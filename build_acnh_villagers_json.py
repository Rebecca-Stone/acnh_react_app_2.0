#!/usr/bin/env python3
# build_acnh_villagers_json.py
#
# Build a comprehensive JSON of ALL Animal Crossing: New Horizons villagers and key details,
# without using any API. This script scrapes public HTML pages from Nookipedia.
#
# Fields requested:
#   poster_image_url | name | species | gender | personality | hobby | birthday | catchphrase
#   house_song | appearances | favorite_gifts
#
# Output file: acnh_villagers.json (UTF-8, pretty-printed)
#
# Usage:
#   python build_acnh_villagers_json.py
#
# Notes:
# - Please be respectful with request rates (we sleep between requests).
# - HTML can change; the parsers use defensive lookups and multiple fallbacks.
# - If a field can't be found, it will be set to None to avoid incorrect guesses.
#
# Dependencies: requests, beautifulsoup4 (bs4)
#
# pip install requests beautifulsoup4

import json, time, sys, urllib.parse, re
from pathlib import Path

import requests
from bs4 import BeautifulSoup

BASE = "https://nookipedia.com"
LIST_URL = f"{BASE}/wiki/Villager/New_Horizons"

HEADERS = {
    "User-Agent": "acnh-json-builder/1.0 (+https://nookipedia.com)",
}

SESSION = requests.Session()
SESSION.headers.update(HEADERS)

# Known games to detect in headings/links for appearance inference:
GAME_ALIASES = {
    "Animal Crossing": "Animal Crossing (GCN)",
    "Animal Crossing: Wild World": "Animal Crossing: Wild World",
    "Animal Crossing: City Folk": "Animal Crossing: City Folk",
    "Animal Crossing: New Leaf": "Animal Crossing: New Leaf",
    "Animal Crossing: New Horizons": "Animal Crossing: New Horizons",
    "Animal Crossing: Pocket Camp": "Animal Crossing: Pocket Camp",
    "Animal Crossing: Happy Home Designer": "Animal Crossing: Happy Home Designer",
    "Animal Crossing: amiibo Festival": "Animal Crossing: amiibo Festival",
    # JP originals
    "Dōbutsu no Mori": "Dōbutsu no Mori (N64)",
    "Dōbutsu no Mori+": "Dōbutsu no Mori+ (GCN)",
    "Dōbutsu no Mori e+": "Dōbutsu no Mori e+ (GCN)",
    "iQue Player": "Animal Crossing (iQue)",
}

SLEEP_BETWEEN = 0.6  # seconds between HTTP requests

def get_soup(url):
    r = SESSION.get(url, timeout=30)
    r.raise_for_status()
    return BeautifulSoup(r.text, "html.parser")

def clean_text(x):
    if not x: 
        return None
    return re.sub(r'\s+', ' ', x).strip()

def extract_row_value_by_label(container, labels):
    """
    Find the first matching label (case-insensitive) in a dl/dt/dd or table (th/td) and return the corresponding value text.
    """
    if container is None:
        return None
    # Try <table> rows
    for th in container.select("th, dt"):
        label = clean_text(th.get_text(" ")).lower()
        if label in labels:
            # paired cell
            td = th.find_next("td") or th.find_next("dd")
            if td:
                # remove super/sub footnotes and reference brackets
                for sup in td.find_all(["sup","span"], class_=lambda c: c and "reference" in c):
                    sup.decompose()
                return clean_text(td.get_text(" "))
    return None

def find_infobox(soup):
    # Many villager pages use an infobox near the top; try a few common selectors.
    infobox = soup.select_one(".infobox, table.infobox, .villager-infobox")
    return infobox

def extract_basic_from_page(soup):
    # Extract Species / Personality / Gender / Birthday / Catchphrase from the header area or infobox.
    out = {"species": None, "personality": None, "gender": None, "birthday": None, "catchphrase": None}
    infobox = find_infobox(soup)

    # Attempt 1: infobox rows
    if infobox:
        # Normalize labels to lower-case variants to match both 'Favorite saying' vs 'Catchphrase' etc.
        out["species"] = extract_row_value_by_label(infobox, {"species"})
        out["personality"] = extract_row_value_by_label(infobox, {"personality"})
        out["gender"] = extract_row_value_by_label(infobox, {"gender"})
        # Birthday often shows "Month Day (Sign)" → keep "Month Day"
        bday_raw = extract_row_value_by_label(infobox, {"birthday"})
        if bday_raw:
            # Extract Month Day using a permissive regex
            m = re.search(r'([A-Za-z]+)\s+\d{1,2}', bday_raw)
            out["birthday"] = m.group(0) if m else clean_text(bday_raw)
        # Some pages have both "Favorite saying" and "Catchphrase"; prefer "Catchphrase" for this dataset
        cphrase = extract_row_value_by_label(infobox, {"catchphrase"})
        if not cphrase:
            cphrase = extract_row_value_by_label(infobox, {"favorite saying"})
        out["catchphrase"] = cphrase

    # Fallbacks: try header fact grid
    if not out["species"] or not out["personality"] or not out["gender"]:
        # There is often a small facts grid under the title; try scanning near the first h1.
        facts = []
        h1 = soup.select_one("h1")
        if h1:
            # look in the next few siblings
            sib = h1
            for _ in range(12):
                sib = sib.find_next_sibling()
                if not sib: break
                txt = clean_text(sib.get_text(" "))
                if txt: facts.append(txt)
        # naive extraction from facts (best-effort, non-fatal if it fails)
        # (intentionally not implemented further to avoid overfitting)
        pass

    return out

def extract_nh_table(soup):
    """
    Locate the 'In New Horizons' information table and return it (bs4 Tag), else None.
    """
    # Find the "Villager information" → "In New Horizons" section
    for h3 in soup.select("h3, h2"):
        title = clean_text(h3.get_text(" ")).lower()
        if title == "in new horizons":
            # The table usually follows this heading
            tbl = h3.find_next("table")
            if tbl: 
                return tbl
    # Some pages use anchors with ids; try id-based
    nh = soup.select_one("#In_New_Horizons, #In_New_Horizons_2, #In_New_Horizons_3")
    if nh:
        tbl = nh.find_next("table")
        if tbl:
            return tbl
    return None

def extract_nh_favorites_hobby(soup):
    """
    From the NH info table, pull Favorite styles, Favorite colors, and Hobby.
    """
    out = {"favorite_styles": None, "favorite_colors": None, "hobby": None}
    tbl = extract_nh_table(soup)
    if not tbl:
        return out

    # There is often a "Favorites" subsection rendered as dl/dt/dd within the NH table cell.
    # Try both table rows and nested lists.
    # Search for 'Favorite styles', 'Favorite colors', 'Hobby' labels anywhere within the NH section.
    section = tbl
    labels_map = {
        "favorite styles": "favorite_styles",
        "favorite colors": "favorite_colors",
        "hobby": "hobby",
    }
    # Gather <dt>/<th> labels inside the NH table
    for th in section.select("th, dt"):
        label = clean_text(th.get_text(" ")).lower()
        if label in labels_map:
            td = th.find_next("td") or th.find_next("dd")
            if td:
                txt = clean_text(td.get_text(" "))
                # Split by ' and ' or commas
                if label.startswith("favorite"):
                    parts = [clean_text(p) for p in re.split(r",| and ", txt) if clean_text(p)]
                    out[labels_map[label]] = parts if parts else [txt]
                else:
                    out[labels_map[label]] = txt

    return out

def extract_house_song(soup):
    """
    Navigate to House -> In New Horizons and read the 'Music' row (K.K. song).
    """
    # Find the 'House' heading then locate the NH subsection
    house_header = None
    for h2 in soup.select("h2, h3"):
        t = clean_text(h2.get_text(" ")).lower()
        if t == "house":
            house_header = h2
            break
    if not house_header:
        return None

    # Look for 'In New Horizons' under this section
    sub = house_header.find_next(lambda tag: tag.name in ("h3","h4") and clean_text(tag.get_text(" ")).lower() == "in new horizons")
    block = sub if sub else house_header

    # Now, within the block, search for a 'Music:' row
    # The layout often has text like "Wall: <...> Floor: <...> Music: <K.K. Song>"
    # Use regex search over the text of the following block
    texts = []
    cur = block
    for _ in range(8):
        cur = cur.find_next_sibling()
        if not cur: break
        texts.append(cur.get_text(" "))
        # stop once we hit another major heading
        if cur.name in ("h2","h3","h4"):
            break

    blob = " ".join(texts)
    m = re.search(r"Music:\s*([A-Za-z\.\-\s!'&]+K\.K\.[^,\n]*)", blob)
    if m:
        return clean_text(m.group(1))

    # Alternate: look for a 'th' labeled 'Music'
    house_table = block.find_next("table")
    if house_table:
        for th in house_table.select("th"):
            if clean_text(th.get_text(" ")).lower() == "music":
                td = th.find_next("td")
                if td:
                    return clean_text(td.get_text(" "))
    return None

def to_poster_page_url(name):
    # Construct Item:{Name}'s_Poster_(New_Horizons)
    # Handle apostrophes and spaces
    # Example: "Agent S" -> "Item:Agent_S's_Poster_(New_Horizons)"
    # Example: "Sherb" -> "Item:Sherb's_poster_(New_Horizons)" (note some pages use lowercase 'poster' in path; redirect will handle case)
    safe = name.replace(" ", "_")
    return f"{BASE}/wiki/Item:{urllib.parse.quote(safe)}%27s_Poster_(New_Horizons)"

def extract_poster_image_url(name):
    """
    Fetch the villager's poster page and return the direct image URL (dodo.ac CDN) if present.
    """
    url = to_poster_page_url(name)
    try:
        soup = get_soup(url)
    except Exception:
        # try lowercase 'poster' as some pages use that in the canonical URL but redirect usually works
        url = f"{BASE}/wiki/Item:{urllib.parse.quote(name.replace(' ','_'))}%27s_poster_(New_Horizons)"
        soup = get_soup(url)

    # The first image under the 'Icon' section is typically the poster icon image at dodo.ac
    # Look for an <img> whose src contains '/np/images/' and has 'Poster' + 'NH' in the filename.
    for img in soup.select("img"):
        src = img.get("src") or ""
        if "/np/images/" in src and "Poster" in src and "NH" in src:
            if src.startswith("//"):  # protocol-relative
                src = "https:" + src
            elif src.startswith("/"):
                src = "https://dodo.ac" + src  # images are on dodo.ac
            return src

    return None

def normalize_appearances(soup):
    """
    Build a list of games the villager appears in, based on headings/links present on their page.
    This is heuristic and aims to avoid false positives.
    """
    games_found = set()

    # Strategy 1: Find "House" subheadings that start with 'In <Game>' (e.g., "In New Horizons", "In New Leaf")
    for hdr in soup.select("h2, h3, h4"):
        t = clean_text(hdr.get_text(" "))
        if not t:
            continue
        if t.startswith("In "):
            # Map exact known game names
            name = t.replace("In ", "")
            # Fix common variants
            name = name.replace("the ", "")
            # Direct lookups
            for key, val in GAME_ALIASES.items():
                if key.lower() in name.lower():
                    games_found.add(val)

    # Strategy 2: Look for explicit links to game pages in "Other appearances" or lead sections
    for a in soup.select("a[href]"):
        txt = clean_text(a.get_text())
        href = a["href"]
        if not txt or not href.startswith("/wiki/"):
            continue
        for key, val in GAME_ALIASES.items():
            if key.lower() == txt.lower():
                games_found.add(val)

    # Always include NH if we're scraping an NH villager
    games_found.add("Animal Crossing: New Horizons")

    return sorted(games_found)

def parse_list_page():
    """
    Parse the list page to get (name, species, gender, personality, birthday, catchphrase) plus a link to each villager page.
    """
    soup = get_soup(LIST_URL)
    data = []
    # The table is rendered as rows of inline 'Poster | Name | Species | ...' links.
    # We'll iterate over rows by scanning for the Name link and capturing the following siblings.
    # Simpler: find all rows in the table
    table = None
    for tbl in soup.select("table"):
        # choose the first table that has a header containing "Poster" and "Personality"
        header_text = clean_text(tbl.get_text(" ")).lower()
        if all(h in header_text for h in ("poster", "personality", "catchphrase")):
            table = tbl
            break
    if not table:
        raise RuntimeError("Could not find the villager list table on the page.")

    # Iterate over rows
    for tr in table.select("tr"):
        cells = tr.find_all(["td", "th"])
        if len(cells) < 7:
            continue
        # Expect columns: Poster | Name | Species | Gender | Personality | Birthday | Catchphrase
        try:
            name_link = cells[1].find("a", href=True)
            name = clean_text(name_link.get_text())
            href = urllib.parse.urljoin(BASE, name_link["href"])
            species = clean_text(cells[2].get_text())
            gender = clean_text(cells[3].get_text())
            # Personality often includes subtype e.g. "Jock (A)" → strip parenthesis
            personality = clean_text(cells[4].get_text())
            personality = re.sub(r"\s*\([AB]\)\s*$", "", personality or "")
            birthday = clean_text(cells[5].get_text())
            catchphrase = clean_text(cells[6].get_text())
        except Exception:
            continue

        data.append({
            "name": name,
            "page_url": href,
            "species": species,
            "gender": gender,
            "personality": personality,
            "birthday": birthday,
            "catchphrase": catchphrase,
        })
    return data

def parse_villager_page(v):
    """
    Given a dict from parse_list_page, open the villager page and populate the remaining fields.
    """
    url = v["page_url"]
    time.sleep(SLEEP_BETWEEN)
    soup = get_soup(url)

    # Sanity: basic fields either from list or infobox (list takes priority)
    basics = extract_basic_from_page(soup)
    for k in ("species","gender","personality","birthday","catchphrase"):
        if not v.get(k):
            v[k] = basics.get(k)

    # Favorites + Hobby
    fav = extract_nh_favorites_hobby(soup)
    v["hobby"] = fav.get("hobby")
    # favorite gifts (styles/colors + up to 8 ideal clothing examples)
    v["favorite_gifts"] = {
        "favorite_styles": fav.get("favorite_styles"),
        "favorite_colors": fav.get("favorite_colors"),
        "ideal_clothing_examples": []
    }

    # Try to pull top few example items from "Ideal clothing for <Name>" list (if present)
    # This list usually lives right below the Favorites/Hobby block in the NH table.
    nh_tbl = extract_nh_table(soup)
    if nh_tbl:
        # Look for the heading "Ideal clothing for <Name>"
        heading = None
        for h in nh_tbl.select("h4,h5,strong"):
            t = clean_text(h.get_text(" ")).lower()
            if t and t.startswith("ideal clothing for"):
                heading = h
                break
        # The items are often rendered as a subsequent table with first column 'Name'
        block = heading.find_parent() if heading else nh_tbl
        inner_table = block.find("table")
        if inner_table:
            # Gather first ~8 item names
            examples = []
            for row in inner_table.select("tr"):
                cols = row.find_all("td")
                if not cols: 
                    continue
                item_name = clean_text(cols[0].get_text(" "))
                if item_name and item_name.lower() != "name":
                    examples.append(item_name)
                if len(examples) >= 8:
                    break
            if examples:
                v["favorite_gifts"]["ideal_clothing_examples"] = examples

    # House music (song)
    v["house_song"] = extract_house_song(soup)

    # Appearances
    v["appearances"] = normalize_appearances(soup)

    # Poster image
    v["poster_image_url"] = extract_poster_image_url(v["name"])

    return v

def main():
    # 1) Parse list page
    villagers = parse_list_page()
    print(f"Found {len(villagers)} villagers on the list page.")

    # 2) For each villager page, enrich fields
    results = []
    for i, v in enumerate(villagers, 1):
        try:
            enriched = parse_villager_page(v)
            results.append(enriched)
            print(f"[{i}/{len(villagers)}] {enriched['name']} ✓")
        except Exception as e:
            print(f"[{i}] {v.get('name','?')} – error: {e}", file=sys.stderr)
        time.sleep(SLEEP_BETWEEN)

    # 3) Write JSON
    out_path = Path("acnh_villagers.json")
    out_path.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {out_path.resolve()}")

if __name__ == "__main__":
    main()
