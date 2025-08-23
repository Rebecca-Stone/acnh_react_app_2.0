import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { debounce } from "../utils/performanceUtils";
import {
  getVillagerField,
  searchVillagers,
} from "../utils/villagerDataAccessor";

/**
 * Unified Search Component
 * Consolidates functionality from Search.js, EnhancedSearch.js, and OptimizedSearch.js
 * into a single configurable component
 */
const UnifiedSearch = React.memo(
  function UnifiedSearch({
    onSearchChange,
    animalList = [],
    variant = "enhanced", // 'basic', 'enhanced', 'optimized'
    isLowEndDevice = false,
  }) {
    const [isActive, setIsActive] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [focusedSuggestion, setFocusedSuggestion] = useState(-1);
    const inputRef = useRef(null);
    const suggestionsRef = useRef(null);

    // Configuration based on variant
    const config = useMemo(
      () =>
        ({
          basic: {
            suggestions: false,
            debounceMs: 0,
            useIndexing: false,
            showCounter: false,
            animated: false,
            maxSuggestions: 0,
          },
          enhanced: {
            suggestions: true,
            debounceMs: 150,
            useIndexing: false,
            showCounter: true,
            animated: true,
            maxSuggestions: 6,
          },
          optimized: {
            suggestions: true,
            debounceMs: 200,
            useIndexing: true,
            showCounter: true,
            animated: true,
            maxSuggestions: 6,
          },
        }[variant]),
      [variant]
    );

    // Build search indices for optimized variant
    const searchIndices = useMemo(() => {
      if (!config.useIndexing || !animalList || animalList.length === 0) {
        return null;
      }

      console.log(
        `🔍 Building search indices for ${animalList.length} villagers`
      );

      const names = new Map();
      const species = new Map();
      const personalities = new Map();

      animalList.forEach((animal, index) => {
        // Index names
        const name = getVillagerField(animal, "name");
        if (name) {
          const nameKey = name.toLowerCase();
          if (!names.has(nameKey)) names.set(nameKey, []);
          names.get(nameKey).push({ animal, index, type: "name" });
        }

        // Index species
        const speciesValue = getVillagerField(animal, "species");
        if (speciesValue) {
          const speciesKey = speciesValue.toLowerCase();
          if (!species.has(speciesKey)) species.set(speciesKey, []);
          species.get(speciesKey).push({ animal, index, type: "species" });
        }

        // Index personalities
        const personality = getVillagerField(animal, "personality");
        if (personality) {
          const personalityKey = personality.toLowerCase();
          if (!personalities.has(personalityKey))
            personalities.set(personalityKey, []);
          personalities
            .get(personalityKey)
            .push({ animal, index, type: "personality" });
        }
      });

      return { names, species, personalities };
    }, [animalList, config.useIndexing]);

    // Generate suggestions based on variant capabilities
    const generateSuggestions = useCallback(
      (term) => {
        if (!config.suggestions || !term || term.length < 2) return [];

        const lowerTerm = term.toLowerCase();
        const uniqueMatches = new Map();
        const maxSuggestions = config.maxSuggestions;

        if (config.useIndexing && searchIndices) {
          // Use indexed search for optimized variant
          searchIndices.names.forEach((matches, nameKey) => {
            if (
              nameKey.includes(lowerTerm) &&
              uniqueMatches.size < maxSuggestions
            ) {
              const match = matches[0];
              uniqueMatches.set(`name-${nameKey}`, {
                value: getVillagerField(match.animal, "name"),
                type: "name",
                icon: "🐾",
                animal: match.animal,
              });
            }
          });

          if (uniqueMatches.size < maxSuggestions) {
            searchIndices.species.forEach((matches, speciesKey) => {
              if (
                speciesKey.includes(lowerTerm) &&
                uniqueMatches.size < maxSuggestions
              ) {
                if (
                  !Array.from(uniqueMatches.values()).some(
                    (m) =>
                      m.type === "species" &&
                      m.value === getVillagerField(matches[0].animal, "species")
                  )
                ) {
                  uniqueMatches.set(`species-${speciesKey}`, {
                    value: getVillagerField(matches[0].animal, "species"),
                    type: "species",
                    icon: "🦎",
                    count: matches.length,
                  });
                }
              }
            });
          }

          if (uniqueMatches.size < maxSuggestions) {
            searchIndices.personalities.forEach((matches, personalityKey) => {
              if (
                personalityKey.includes(lowerTerm) &&
                uniqueMatches.size < maxSuggestions
              ) {
                if (
                  !Array.from(uniqueMatches.values()).some(
                    (m) =>
                      m.type === "personality" &&
                      m.value ===
                        getVillagerField(matches[0].animal, "personality")
                  )
                ) {
                  uniqueMatches.set(`personality-${personalityKey}`, {
                    value: getVillagerField(matches[0].animal, "personality"),
                    type: "personality",
                    icon: "✨",
                    count: matches.length,
                  });
                }
              }
            });
          }
        } else {
          // Use direct search for basic/enhanced variants
          animalList.forEach((animal) => {
            const name = getVillagerField(animal, "name");
            if (
              name &&
              name.toLowerCase().includes(lowerTerm) &&
              uniqueMatches.size < maxSuggestions
            ) {
              uniqueMatches.set(`name-${name}`, {
                value: name,
                type: "name",
                icon: "🐾",
                animal: animal,
              });
            }
          });

          const seenSpecies = new Set();
          animalList.forEach((animal) => {
            const species = getVillagerField(animal, "species");
            if (
              species &&
              species.toLowerCase().includes(lowerTerm) &&
              !seenSpecies.has(species) &&
              uniqueMatches.size < maxSuggestions
            ) {
              seenSpecies.add(species);
              const count = animalList.filter(
                (a) => getVillagerField(a, "species") === species
              ).length;
              uniqueMatches.set(`species-${species}`, {
                value: species,
                type: "species",
                icon: "🦎",
                count: count,
              });
            }
          });

          const seenPersonalities = new Set();
          animalList.forEach((animal) => {
            const personality = getVillagerField(animal, "personality");
            if (
              personality &&
              personality.toLowerCase().includes(lowerTerm) &&
              !seenPersonalities.has(personality) &&
              uniqueMatches.size < maxSuggestions
            ) {
              seenPersonalities.add(personality);
              const count = animalList.filter(
                (a) => getVillagerField(a, "personality") === personality
              ).length;
              uniqueMatches.set(`personality-${personality}`, {
                value: personality,
                type: "personality",
                icon: "✨",
                count: count,
              });
            }
          });
        }

        return Array.from(uniqueMatches.values());
      },
      [
        animalList,
        config.suggestions,
        config.maxSuggestions,
        config.useIndexing,
        searchIndices,
      ]
    );

    // Debounced search handling
    const debouncedSearch = useMemo(
      () =>
        config.debounceMs > 0
          ? debounce((term) => {
              const newSuggestions = generateSuggestions(term);
              setSuggestions(newSuggestions);
              setShowSuggestions(term.length >= 2 && newSuggestions.length > 0);
              setFocusedSuggestion(-1);
            }, config.debounceMs)
          : (term) => {
              const newSuggestions = generateSuggestions(term);
              setSuggestions(newSuggestions);
              setShowSuggestions(term.length >= 2 && newSuggestions.length > 0);
              setFocusedSuggestion(-1);
            },
      [generateSuggestions, config.debounceMs]
    );

    const debouncedOnSearchChange = useMemo(
      () =>
        config.debounceMs > 0
          ? debounce((term) => {
              if (onSearchChange) {
                onSearchChange(term);
              }
            }, config.debounceMs)
          : onSearchChange,
      [onSearchChange, config.debounceMs]
    );

    const handleSearch = useCallback(
      (event) => {
        const term = event.target.value;
        setSearchTerm(term);

        if (config.suggestions) {
          debouncedSearch(term);
        }

        if (debouncedOnSearchChange) {
          debouncedOnSearchChange(term);
        }
      },
      [config.suggestions, debouncedSearch, debouncedOnSearchChange]
    );

    const handleSuggestionClick = useCallback(
      (suggestion) => {
        const searchValue = suggestion.value;
        setSearchTerm(searchValue);
        if (debouncedOnSearchChange) {
          debouncedOnSearchChange(searchValue);
        }
        setShowSuggestions(false);
        setFocusedSuggestion(-1);
        if (inputRef.current) inputRef.current.focus();
      },
      [debouncedOnSearchChange]
    );

    const handleKeyDown = useCallback(
      (event) => {
        if (!showSuggestions || !config.suggestions) return;

        switch (event.key) {
          case "ArrowDown":
            event.preventDefault();
            setFocusedSuggestion((prev) =>
              prev < suggestions.length - 1 ? prev + 1 : 0
            );
            break;
          case "ArrowUp":
            event.preventDefault();
            setFocusedSuggestion((prev) =>
              prev > 0 ? prev - 1 : suggestions.length - 1
            );
            break;
          case "Enter":
            event.preventDefault();
            if (focusedSuggestion >= 0) {
              handleSuggestionClick(suggestions[focusedSuggestion]);
            }
            break;
          case "Escape":
            setShowSuggestions(false);
            setFocusedSuggestion(-1);
            break;
          default:
            break;
        }
      },
      [
        showSuggestions,
        suggestions,
        focusedSuggestion,
        handleSuggestionClick,
        config.suggestions,
      ]
    );

    const toggleSearch = useCallback(() => {
      setIsActive((prev) => {
        const newActive = !prev;
        if (newActive) {
          // Opening search - focus input
          setTimeout(() => {
            if (inputRef.current) inputRef.current.focus();
          }, 300);
        } else {
          // Closing search - clear everything
          if (searchTerm) {
            setSearchTerm("");
            if (debouncedOnSearchChange) {
              debouncedOnSearchChange("");
            }
          }
          setShowSuggestions(false);
          setFocusedSuggestion(-1);
        }
        return newActive;
      });
    }, [searchTerm, debouncedOnSearchChange]);

    const clearSearch = useCallback(() => {
      setSearchTerm("");
      if (debouncedOnSearchChange) {
        debouncedOnSearchChange("");
      }
      setShowSuggestions(false);
      setFocusedSuggestion(-1);
      if (inputRef.current) inputRef.current.focus();
    }, [debouncedOnSearchChange]);

    // Close suggestions when clicking outside
    useEffect(() => {
      if (!config.suggestions) return;

      const handleClickOutside = (event) => {
        if (
          suggestionsRef.current &&
          !suggestionsRef.current.contains(event.target) &&
          inputRef.current &&
          !inputRef.current.contains(event.target)
        ) {
          setShowSuggestions(false);
          setFocusedSuggestion(-1);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, [config.suggestions]);

    // Calculate search results count
    const searchResultsCount = useMemo(() => {
      if (!config.showCounter || !searchTerm || !animalList) return 0;

      return searchVillagers(animalList, searchTerm).length;
    }, [searchTerm, animalList, config.showCounter]);

    // Render based on variant
    if (variant === "basic") {
      return (
        <div className={isActive ? "active search" : "search"}>
          <input
            ref={inputRef}
            type="text"
            className="input"
            placeholder="Search villagers by name, species, or personality..."
            value={searchTerm}
            onChange={handleSearch}
          />
          <button className="search-btn" onClick={toggleSearch}>
            <i className="fas fa-search"></i>
          </button>
        </div>
      );
    }

    // Enhanced/Optimized layout
    return (
      <div className="enhanced-search-container">
        <div
          className={`enhanced-search ${
            isActive ? "enhanced-search--active" : ""
          }`}
        >
          {/* Search Input */}
          <div className="enhanced-search__input-wrapper">
            <input
              ref={inputRef}
              type="text"
              className="enhanced-search__input"
              placeholder={
                isActive
                  ? "Search villagers by name, species, or personality..."
                  : ""
              }
              value={searchTerm}
              onChange={handleSearch}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (config.suggestions && searchTerm.length >= 2) {
                  const newSuggestions = generateSuggestions(searchTerm);
                  setSuggestions(newSuggestions);
                  setShowSuggestions(newSuggestions.length > 0);
                }
              }}
              aria-label="Search villagers"
              aria-expanded={showSuggestions}
              aria-haspopup="listbox"
              aria-activedescendant={
                focusedSuggestion >= 0
                  ? `suggestion-${focusedSuggestion}`
                  : undefined
              }
            />

            {/* Clear Button */}
            {searchTerm && isActive && (
              <button
                className="enhanced-search__clear"
                onClick={clearSearch}
                aria-label="Clear search"
                type="button"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>

          {/* Search Toggle Button */}
          <button
            className="enhanced-search__toggle"
            onClick={toggleSearch}
            aria-label={isActive ? "Close search" : "Open search"}
            type="button"
          >
            <i className={`fas ${isActive ? "fa-times" : "fa-search"}`}></i>
          </button>

          {/* Search Results Counter */}
          {config.showCounter && isActive && searchTerm && (
            <div className="enhanced-search__counter" aria-live="polite">
              {searchResultsCount} villagers found
            </div>
          )}
        </div>

        {/* Search Suggestions Dropdown */}
        {config.suggestions && showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="enhanced-search__suggestions"
            role="listbox"
            aria-label="Search suggestions"
          >
            {suggestions.map((suggestion, index) => (
              <div
                key={`${suggestion.type}-${suggestion.value}`}
                className={`enhanced-search__suggestion ${
                  focusedSuggestion === index
                    ? "enhanced-search__suggestion--focused"
                    : ""
                }`}
                onClick={() => handleSuggestionClick(suggestion)}
                role="option"
                aria-selected={focusedSuggestion === index}
                id={`suggestion-${index}`}
              >
                <span className="enhanced-search__suggestion-icon">
                  {suggestion.icon}
                </span>
                <div className="enhanced-search__suggestion-content">
                  <span className="enhanced-search__suggestion-value">
                    {suggestion.value}
                  </span>
                  <span className="enhanced-search__suggestion-type">
                    {suggestion.type}
                    {suggestion.count && ` (${suggestion.count})`}
                  </span>
                </div>
                <i className="fas fa-arrow-right enhanced-search__suggestion-arrow"></i>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if key props change
    return (
      prevProps.animalList === nextProps.animalList &&
      prevProps.onSearchChange === nextProps.onSearchChange &&
      prevProps.variant === nextProps.variant &&
      prevProps.isLowEndDevice === nextProps.isLowEndDevice
    );
  }
);

export default UnifiedSearch;
