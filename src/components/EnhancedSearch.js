import React, { useState, useRef, useEffect } from "react";

export default function EnhancedSearch({ onSearchChange, animalList = [] }) {
  const [isActive, setIsActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [focusedSuggestion, setFocusedSuggestion] = useState(-1);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Generate search suggestions based on current input
  const generateSuggestions = (term) => {
    if (!term || term.length < 2) return [];
    
    const lowerTerm = term.toLowerCase();
    const uniqueMatches = new Set();
    
    // Search by name (highest priority)
    animalList.forEach(animal => {
      if (animal.name && animal.name.toLowerCase().includes(lowerTerm)) {
        uniqueMatches.add({
          value: animal.name,
          type: 'name',
          icon: '🐾',
          animal: animal
        });
      }
    });

    // Search by species
    animalList.forEach(animal => {
      if (animal.species && animal.species.toLowerCase().includes(lowerTerm) && 
          ![...uniqueMatches].some(m => m.animal === animal)) {
        uniqueMatches.add({
          value: animal.species,
          type: 'species',
          icon: '🦎', 
          count: animalList.filter(a => a.species === animal.species).length
        });
      }
    });

    // Search by personality
    animalList.forEach(animal => {
      if (animal.personality && animal.personality.toLowerCase().includes(lowerTerm) &&
          ![...uniqueMatches].some(m => m.animal === animal)) {
        uniqueMatches.add({
          value: animal.personality,
          type: 'personality',
          icon: '✨',
          count: animalList.filter(a => a.personality === animal.personality).length
        });
      }
    });

    return Array.from(uniqueMatches).slice(0, 6);
  };

  const handleSearch = (event) => {
    const term = event.target.value;
    setSearchTerm(term);
    onSearchChange(term);
    
    // Generate and show suggestions
    const newSuggestions = generateSuggestions(term);
    setSuggestions(newSuggestions);
    setShowSuggestions(term.length >= 2 && newSuggestions.length > 0);
    setFocusedSuggestion(-1);
  };

  const handleSuggestionClick = (suggestion) => {
    const searchValue = suggestion.value;
    setSearchTerm(searchValue);
    onSearchChange(searchValue);
    setShowSuggestions(false);
    setFocusedSuggestion(-1);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleKeyDown = (event) => {
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
  };

  const toggleSearch = () => {
    setIsActive(!isActive);
    if (!isActive) {
      // Opening search - focus input
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 300);
    } else {
      // Closing search - clear everything
      if (searchTerm) {
        setSearchTerm("");
        onSearchChange("");
      }
      setShowSuggestions(false);
      setFocusedSuggestion(-1);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    onSearchChange("");
    setShowSuggestions(false);
    setFocusedSuggestion(-1);
    if (inputRef.current) inputRef.current.focus();
  };

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
            {animalList.filter(animal => 
              animal.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              animal.species?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              animal.personality?.toLowerCase().includes(searchTerm.toLowerCase())
            ).length} villagers found
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
}
