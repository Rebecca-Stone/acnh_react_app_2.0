import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { debounce } from "../utils/performanceUtils";

const OptimizedSearch = React.memo(function OptimizedSearch({ onSearchChange, animalList = [] }) {
  const [isActive, setIsActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [focusedSuggestion, setFocusedSuggestion] = useState(-1);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Memoize search indices for better performance with large datasets
  const searchIndices = useMemo(() => {
    if (!animalList || animalList.length === 0) return { names: [], species: [], personalities: [] };

    console.log(`🔍 Building search indices for ${animalList.length} villagers`);

    const names = new Map();
    const species = new Map();
    const personalities = new Map();

    animalList.forEach((animal, index) => {
      // Index names
      if (animal.name) {
        const nameKey = typeof animal.name === 'string' 
          ? animal.name.toLowerCase()
          : (animal.name["name-USen"] || "").toLowerCase();
        
        if (nameKey) {
          if (!names.has(nameKey)) names.set(nameKey, []);
          names.get(nameKey).push({ animal, index, type: 'name' });
        }
      }

      // Index species
      if (animal.species) {
        const speciesKey = animal.species.toLowerCase();
        if (!species.has(speciesKey)) species.set(speciesKey, []);
        species.get(speciesKey).push({ animal, index, type: 'species' });
      }

      // Index personalities
      if (animal.personality) {
        const personalityKey = animal.personality.toLowerCase();
        if (!personalities.has(personalityKey)) personalities.set(personalityKey, []);
        personalities.get(personalityKey).push({ animal, index, type: 'personality' });
      }
    });

    return { names, species, personalities };
  }, [animalList]);

  // Optimized suggestion generation using indices
  const generateSuggestions = useCallback((term) => {
    if (!term || term.length < 2) return [];
    
    const lowerTerm = term.toLowerCase();
    const uniqueMatches = new Map();
    const maxSuggestions = 6;

    // Search names first (highest priority)
    searchIndices.names.forEach((matches, nameKey) => {
      if (nameKey.includes(lowerTerm) && uniqueMatches.size < maxSuggestions) {
        const match = matches[0];
        const displayName = typeof match.animal.name === 'string' 
          ? match.animal.name
          : match.animal.name["name-USen"] || "Unknown";
        
        uniqueMatches.set(`name-${nameKey}`, {
          value: displayName,
          type: 'name',
          icon: '🐾',
          animal: match.animal
        });
      }
    });

    // Search species
    if (uniqueMatches.size < maxSuggestions) {
      searchIndices.species.forEach((matches, speciesKey) => {
        if (speciesKey.includes(lowerTerm) && uniqueMatches.size < maxSuggestions) {
          if (!Array.from(uniqueMatches.values()).some(m => m.type === 'species' && m.value === matches[0].animal.species)) {
            uniqueMatches.set(`species-${speciesKey}`, {
              value: matches[0].animal.species,
              type: 'species',
              icon: '🦎',
              count: matches.length
            });
          }
        }
      });
    }

    // Search personalities
    if (uniqueMatches.size < maxSuggestions) {
      searchIndices.personalities.forEach((matches, personalityKey) => {
        if (personalityKey.includes(lowerTerm) && uniqueMatches.size < maxSuggestions) {
          if (!Array.from(uniqueMatches.values()).some(m => m.type === 'personality' && m.value === matches[0].animal.personality)) {
            uniqueMatches.set(`personality-${personalityKey}`, {
              value: matches[0].animal.personality,
              type: 'personality',
              icon: '✨',
              count: matches.length
            });
          }
        }
      });
    }

    return Array.from(uniqueMatches.values());
  }, [searchIndices]);

  // Debounced search to improve performance
  const debouncedSearch = useMemo(
    () => debounce((term) => {
      const newSuggestions = generateSuggestions(term);
      setSuggestions(newSuggestions);
      setShowSuggestions(term.length >= 2 && newSuggestions.length > 0);
      setFocusedSuggestion(-1);
    }, 150),
    [generateSuggestions]
  );

  // Debounced search change to reduce parent re-renders
  const debouncedOnSearchChange = useMemo(
    () => debounce((term) => {
      if (onSearchChange) {
        onSearchChange(term);
      }
    }, 200),
    [onSearchChange]
  );

  const handleSearch = useCallback((event) => {
    const term = event.target.value;
    setSearchTerm(term);
    
    // Update suggestions immediately for better UX
    debouncedSearch(term);
    
    // Notify parent with debounce to reduce re-renders
    debouncedOnSearchChange(term);
  }, [debouncedSearch, debouncedOnSearchChange]);

  const handleSuggestionClick = useCallback((suggestion) => {
    const searchValue = suggestion.value;
    setSearchTerm(searchValue);
    debouncedOnSearchChange(searchValue);
    setShowSuggestions(false);
    setFocusedSuggestion(-1);
    if (inputRef.current) inputRef.current.focus();
  }, [debouncedOnSearchChange]);

  const handleKeyDown = useCallback((event) => {
    if (!showSuggestions) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setFocusedSuggestion(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setFocusedSuggestion(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        event.preventDefault();
        if (focusedSuggestion >= 0) {
          handleSuggestionClick(suggestions[focusedSuggestion]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setFocusedSuggestion(-1);
        break;
      default:
        break;
    }
  }, [showSuggestions, suggestions, focusedSuggestion, handleSuggestionClick]);

  const toggleSearch = useCallback(() => {
    setIsActive(prev => {
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
          debouncedOnSearchChange("");
        }
        setShowSuggestions(false);
        setFocusedSuggestion(-1);
      }
      return newActive;
    });
  }, [searchTerm, debouncedOnSearchChange]);

  const clearSearch = useCallback(() => {
    setSearchTerm("");
    debouncedOnSearchChange("");
    setShowSuggestions(false);
    setFocusedSuggestion(-1);
    if (inputRef.current) inputRef.current.focus();
  }, [debouncedOnSearchChange]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setFocusedSuggestion(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Memoize search results counter
  const searchResultsCount = useMemo(() => {
    if (!searchTerm || !animalList) return 0;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return animalList.filter(animal => {
      const name = typeof animal.name === 'string' 
        ? animal.name
        : (animal.name && animal.name["name-USen"]) || "";
      
      return name.toLowerCase().includes(lowerSearchTerm) ||
        (animal.species && animal.species.toLowerCase().includes(lowerSearchTerm)) ||
        (animal.personality && animal.personality.toLowerCase().includes(lowerSearchTerm));
    }).length;
  }, [searchTerm, animalList]);

  return (
    <div className="enhanced-search-container">
      <div className={`enhanced-search ${isActive ? 'enhanced-search--active' : ''}`}>
        {/* Search Input */}
        <div className="enhanced-search__input-wrapper">
          <input
            ref={inputRef}
            type="text"
            className="enhanced-search__input"
            placeholder={isActive ? "Search villagers by name, species, or personality..." : ""}
            value={searchTerm}
            onChange={handleSearch}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (searchTerm.length >= 2) {
                const newSuggestions = generateSuggestions(searchTerm);
                setSuggestions(newSuggestions);
                setShowSuggestions(newSuggestions.length > 0);
              }
            }}
            aria-label="Search villagers"
            aria-expanded={showSuggestions}
            aria-haspopup="listbox"
            aria-activedescendant={
              focusedSuggestion >= 0 ? `suggestion-${focusedSuggestion}` : undefined
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
          <i className={`fas ${isActive ? 'fa-times' : 'fa-search'}`}></i>
        </button>

        {/* Search Results Counter */}
        {isActive && searchTerm && (
          <div className="enhanced-search__counter" aria-live="polite">
            {searchResultsCount} villagers found
          </div>
        )}
      </div>

      {/* Search Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
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
                focusedSuggestion === index ? 'enhanced-search__suggestion--focused' : ''
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
}, (prevProps, nextProps) => {
  // Only re-render if animalList or onSearchChange changes
  return (
    prevProps.animalList === nextProps.animalList &&
    prevProps.onSearchChange === nextProps.onSearchChange
  );
});

export default OptimizedSearch;
