import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  createUniversalFilter,
  createFilterOptions,
} from "../utils/unifiedFilter";

const Filter = React.memo(
  function Filter({ animalList, onFilter, searchTerm }) {
    const [filters, setFilters] = useState({
      species: "",
      personality: "",
      gender: "",
      hobby: "",
    });

    // Generate filter options using utility function
    const filterOptions = useMemo(() => {
      return createFilterOptions(animalList);
    }, [animalList]);

    // Apply filters whenever filters or search term changes
    useEffect(() => {
      if (!animalList || animalList.length === 0) {
        onFilter([]);
        return;
      }

      // Combine search term and dropdown filters
      const combinedFilters = {
        ...filters,
        searchTerm: searchTerm,
      };

      const filtered = createUniversalFilter(animalList, combinedFilters);
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
              {filterOptions.species.map((species) => (
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
              {filterOptions.personality.map((personality) => (
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
              {filterOptions.gender.map((gender) => (
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
              {filterOptions.hobby.map((hobby) => (
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
