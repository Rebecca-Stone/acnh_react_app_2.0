# ACNH Villager Schema Migration Plan

## Current vs New Schema Comparison

### Current Structure (ACNH API)
```javascript
{
  id: 1,
  name: { "name-USen": "Raymond" },
  species: "Cat",
  personality: "Smug", 
  gender: "Male",
  "birthday-string": "October 1st",
  saying: "Hmm, indeed",
  "catch-phrase": "crisp",
  hobby: "Reading",
  image_uri: "https://acnhapi.com/v1/images/villagers/400",
  "text-color": "#ffffff",
  "bubble-color": "#4a4a4a"
}
```

### New Schema Structure
```javascript
{
  name: "Raymond",                    // ✓ CHANGED: String instead of object
  species: "Cat",                     // ✓ SAME
  gender: "Male",                     // ✓ SAME  
  personality: "Smug",                // ✓ SAME
  birthday: "March 10",               // ✓ CHANGED: Format & property name
  catchphrase: "crisp",               // ✓ CHANGED: Property name (catch-phrase → catchphrase)
  poster_image_url: "...",            // ✓ NEW FIELD
  hobby: "Reading",                   // ✓ SAME
  house_song: "...",                  // ✓ NEW FIELD
  appearances: ["New Horizons"],      // ✓ NEW FIELD
  page_url: "...",                    // ✓ NEW FIELD
  favorite_gifts: {                   // ✓ NEW COMPLEX FIELD
    favorite_styles: [...],
    favorite_colors: [...], 
    ideal_clothing_examples: [...]
  }
}
```

## Field Mapping Requirements

### Direct Mappings
- `species` → `species` ✓
- `gender` → `gender` ✓  
- `personality` → `personality` ✓
- `hobby` → `hobby` ✓

### Property Name Changes
- `name["name-USen"]` → `name`
- `"catch-phrase"` → `catchphrase`
- `"birthday-string"` → `birthday` (also format change)

### Deprecated Fields (Current → Removed)
- `id` → ❌ (Need to generate or use name as ID)
- `saying` → ❌
- `image_uri` → ❌ (Replaced by `poster_image_url`)
- `"text-color"` → ❌
- `"bubble-color"` → ❌

### New Fields (Added)
- `poster_image_url` → New image source
- `house_song` → K.K. song info
- `appearances` → Game appearance list
- `page_url` → Nookipedia link
- `favorite_gifts` → Gift preferences

## Migration Strategy

### Phase 1: Data Adapter Layer
Create adapter functions to:
1. Transform new schema → current format (backward compatibility)
2. Transform current format → new schema (forward migration)
3. Handle missing fields gracefully

### Phase 2: Component Updates
Update components to:
1. Use adapter layer for data access
2. Handle new optional fields
3. Maintain existing functionality

### Phase 3: Enhanced Features
Implement new features using:
1. Favorite gifts display
2. House song information
3. Game appearances
4. Nookipedia integration

### Phase 4: Schema Validation
1. Implement JSON schema validation
2. Add error handling for malformed data
3. Create data quality checks

## Implementation Plan

### Files to Update
- `src/utils/dataAdapter.js` (NEW)
- `src/App.js` (Data loading)
- `src/animalComponents/AnimalContent.js` (Display)
- `src/components/VillagerModal.js` (Details)
- `src/helpers/Filter.js` (Filtering)
- `src/contexts/CollectionContext.js` (ID handling)

### Backward Compatibility
- Keep existing API fallback
- Support both data formats during transition
- Graceful degradation for missing fields
