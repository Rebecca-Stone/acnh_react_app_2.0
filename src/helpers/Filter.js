import React, { useState, useEffect, useMemo, useCallback } from "react";

const Filter = React.memo(
  function Filter({ animalList, onFilter, searchTerm }) {
    const [filters, setFilters] = useState({
      species: "",
      personality: "",
      gender: "",
      hobby: "",
    });

    // Memoize unique values for dropdown options
    const speciesOptions = useMemo(() => {
      if (!animalList || animalList.length === 0) return [];
      const values = animalList.map((animal) => animal.species).filter(Boolean);
      return [...new Set(values)].sort();
    }, [animalList]);

    const personalityOptions = useMemo(() => {
      if (!animalList || animalList.length === 0) return [];
      const values = animalList
        .map((animal) => animal.personality)
        .filter(Boolean);
      return [...new Set(values)].sort();
    }, [animalList]);

    const genderOptions = useMemo(() => {
      if (!animalList || animalList.length === 0) return [];
      const values = animalList.map((animal) => animal.gender).filter(Boolean);
      return [...new Set(values)].sort();
    }, [animalList]);

    const hobbyOptions = useMemo(() => {
      if (!animalList || animalList.length === 0) return [];
      const values = animalList.map((animal) => animal.hobby).filter(Boolean);
      return [...new Set(values)].sort();
    }, [animalList]);

    // Apply filters whenever filters or search term changes
    useEffect(() => {
      if (!animalList || animalList.length === 0) return;

      let filtered = animalList;

      // Apply search term filter
      if (searchTerm) {
        filtered = filtered.filter(
          (animal) =>
            animal.name["name-USen"]
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            animal.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
            animal.personality.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Apply dropdown filters
      if (filters.species) {
        filtered = filtered.filter(
          (animal) => animal.species === filters.species
        );
      }
      if (filters.personality) {
        filtered = filtered.filter(
          (animal) => animal.personality === filters.personality
        );
      }
      if (filters.gender) {
        filtered = filtered.filter(
          (animal) => animal.gender === filters.gender
        );
      }
      if (filters.hobby) {
        filtered = filtered.filter((animal) => animal.hobby === filters.hobby);
      }

      onFilter(filtered);
    }, [filters, searchTerm, animalList, onFilter]);

    const handleFilterChange = useCallback((filterType, value) => {
      setFilters((prev) => ({
        ...prev,
        [filterType]: value,
      }));
    }, []);

    const clearAllFilters = useCallback(() => {
      setFilters({
        species: "",
        personality: "",
        gender: "",
        hobby: "",
      });
    }, []);

    const hasActiveFilters = Object.values(filters).some(
      (value) => value !== ""
    );

    return (
      <div className="filter-container">
        <div className="filter-header">
          <h3>Filters</h3>
          {hasActiveFilters && (
            <button
              className="clear-filters-btn"
              onClick={clearAllFilters}
              title="Clear all filters"
            >
              <i className="fas fa-times"></i> Clear All
            </button>
          )}
        </div>

        <div className="filter-grid">
          <div className="filter-group">
            <label htmlFor="species-filter">Species</label>
            <select
              id="species-filter"
              value={filters.species}
              onChange={(e) => handleFilterChange("species", e.target.value)}
              className="filter-select"
            >
              <option value="">All Species</option>
              {speciesOptions.map((species) => (
                <option key={species} value={species}>
                  {species}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="personality-filter">Personality</label>
            <select
              id="personality-filter"
              value={filters.personality}
              onChange={(e) =>
                handleFilterChange("personality", e.target.value)
              }
              className="filter-select"
            >
              <option value="">All Personalities</option>
              {personalityOptions.map((personality) => (
                <option key={personality} value={personality}>
                  {personality}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="gender-filter">Gender</label>
            <select
              id="gender-filter"
              value={filters.gender}
              onChange={(e) => handleFilterChange("gender", e.target.value)}
              className="filter-select"
            >
              <option value="">All Genders</option>
              {genderOptions.map((gender) => (
                <option key={gender} value={gender}>
                  {gender}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="hobby-filter">Hobby</label>
            <select
              id="hobby-filter"
              value={filters.hobby}
              onChange={(e) => handleFilterChange("hobby", e.target.value)}
              className="filter-select"
            >
              <option value="">All Hobbies</option>
              {hobbyOptions.map((hobby) => (
                <option key={hobby} value={hobby}>
                  {hobby}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if animalList, onFilter, or searchTerm changes
    return (
      prevProps.animalList === nextProps.animalList &&
      prevProps.onFilter === nextProps.onFilter &&
      prevProps.searchTerm === nextProps.searchTerm
    );
  }
);

export default Filter;
