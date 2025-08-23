/**
 * Unified Filter Utility
 *
 * Consolidates filtering logic used across multiple components
 * Provides flexible, reusable filtering functions
 */

import { getVillagerField, searchVillagers } from "./villagerDataAccessor";

/**
 * Create a universal filter for villagers
 * @param {Array} villagers - Array of villager objects
 * @param {Object} filters - Filter criteria object
 * @returns {Array} Filtered villagers
 */
export const createUniversalFilter = (villagers, filters) => {
  if (!Array.isArray(villagers) || villagers.length === 0) return [];
  if (!filters || Object.keys(filters).length === 0) return villagers;

  return villagers.filter((villager) => {
    return Object.entries(filters).every(([filterType, filterValue]) => {
      // Skip empty or null filters
      if (!filterValue || filterValue === "") return true;

      switch (filterType) {
        case "search":
        case "searchTerm":
          // Handle search across multiple fields
          const searchFields = ["name", "species", "personality"];
          return searchFields.some((field) => {
            const fieldValue = getVillagerField(villager, field);
            return (
              fieldValue &&
              fieldValue.toLowerCase().includes(filterValue.toLowerCase())
            );
          });

        case "species":
          return getVillagerField(villager, "species") === filterValue;

        case "personality":
          return getVillagerField(villager, "personality") === filterValue;

        case "gender":
          return getVillagerField(villager, "gender") === filterValue;

        case "hobby":
          return getVillagerField(villager, "hobby") === filterValue;

        case "birthday":
          const birthday = getVillagerField(villager, "birthday");
          return (
            birthday &&
            birthday.toLowerCase().includes(filterValue.toLowerCase())
          );

        case "favoriteColor":
          const colors = getVillagerField(villager, "favoriteColors");
          return (
            colors &&
            colors.some((color) =>
              color.toLowerCase().includes(filterValue.toLowerCase())
            )
          );

        case "hasEnhancedData":
          // Filter for villagers with enhanced data
          return filterValue ? hasEnhancedVillagerData(villager) : true;

        case "collection":
          // Custom collection filter (requires additional context)
          if (filterValue === "have" && filters._collectionContext) {
            return filters._collectionContext.isInHaveList(
              getVillagerField(villager, "id")
            );
          }
          if (filterValue === "want" && filters._collectionContext) {
            return filters._collectionContext.isInWantList(
              getVillagerField(villager, "id")
            );
          }
          return true;

        default:
          // Generic field matching
          const fieldValue = getVillagerField(villager, filterType);
          if (typeof fieldValue === "string") {
            return fieldValue.toLowerCase().includes(filterValue.toLowerCase());
          }
          return fieldValue === filterValue;
      }
    });
  });
};

/**
 * Get unique values for a specific field from villagers array
 * @param {Array} villagers - Array of villager objects
 * @param {string} field - Field to get unique values for
 * @param {boolean} sorted - Whether to sort the results
 * @returns {Array} Array of unique values
 */
export const getUniqueFieldValues = (villagers, field, sorted = true) => {
  if (!Array.isArray(villagers) || villagers.length === 0) return [];

  const values = villagers
    .map((villager) => getVillagerField(villager, field))
    .filter((value) => value != null && value !== "");

  const uniqueValues = [...new Set(values)];

  return sorted ? uniqueValues.sort() : uniqueValues;
};

/**
 * Create filter options for dropdown components
 * @param {Array} villagers - Array of villager objects
 * @returns {Object} Object with arrays of options for each filter type
 */
export const createFilterOptions = (villagers) => {
  if (!Array.isArray(villagers) || villagers.length === 0) {
    return {
      species: [],
      personality: [],
      gender: [],
      hobby: [],
      favoriteColors: [],
    };
  }

  return {
    species: getUniqueFieldValues(villagers, "species"),
    personality: getUniqueFieldValues(villagers, "personality"),
    gender: getUniqueFieldValues(villagers, "gender"),
    hobby: getUniqueFieldValues(villagers, "hobby"),
    favoriteColors: getUniqueFavoriteColors(villagers),
  };
};

/**
 * Get unique favorite colors from all villagers
 * @param {Array} villagers - Array of villager objects
 * @returns {Array} Unique favorite colors
 */
const getUniqueFavoriteColors = (villagers) => {
  const allColors = villagers.flatMap(
    (villager) => getVillagerField(villager, "favoriteColors") || []
  );

  return [...new Set(allColors)]
    .filter((color) => color && color.trim())
    .sort();
};

/**
 * Advanced search with multiple criteria and weights
 * @param {Array} villagers - Array of villager objects
 * @param {string} searchTerm - Search term
 * @param {Object} options - Search options
 * @returns {Array} Search results with relevance scores
 */
export const advancedVillagerSearch = (villagers, searchTerm, options = {}) => {
  const {
    includeRelevanceScore = false,
    prioritizeNameMatches = true,
    searchFields = ["name", "species", "personality", "hobby"],
    maxResults = null,
  } = options;

  if (!searchTerm || !Array.isArray(villagers)) {
    return villagers;
  }

  const lowerSearchTerm = searchTerm.toLowerCase();

  const results = villagers
    .map((villager) => {
      let score = 0;
      let matches = [];

      searchFields.forEach((field) => {
        const fieldValue = getVillagerField(villager, field);
        if (fieldValue) {
          const lowerFieldValue = fieldValue.toString().toLowerCase();

          if (lowerFieldValue === lowerSearchTerm) {
            // Exact match
            score += field === "name" && prioritizeNameMatches ? 100 : 50;
            matches.push({ field, type: "exact" });
          } else if (lowerFieldValue.startsWith(lowerSearchTerm)) {
            // Starts with match
            score += field === "name" && prioritizeNameMatches ? 75 : 25;
            matches.push({ field, type: "prefix" });
          } else if (lowerFieldValue.includes(lowerSearchTerm)) {
            // Contains match
            score += field === "name" && prioritizeNameMatches ? 50 : 10;
            matches.push({ field, type: "contains" });
          }
        }
      });

      return {
        villager,
        score,
        matches: matches.length > 0 ? matches : null,
      };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score);

  if (maxResults && results.length > maxResults) {
    results.splice(maxResults);
  }

  return includeRelevanceScore ? results : results.map((r) => r.villager);
};

/**
 * Filter villagers by collection status
 * @param {Array} villagers - Array of villager objects
 * @param {Object} collectionContext - Collection context with isInHaveList/isInWantList functions
 * @param {string} filterType - 'all', 'have', 'want', 'neither'
 * @returns {Array} Filtered villagers
 */
export const filterByCollection = (
  villagers,
  collectionContext,
  filterType = "all"
) => {
  if (!Array.isArray(villagers) || !collectionContext || filterType === "all") {
    return villagers;
  }

  return villagers.filter((villager) => {
    const villagerId = getVillagerField(villager, "id");
    const inHaveList = collectionContext.isInHaveList(villagerId);
    const inWantList = collectionContext.isInWantList(villagerId);

    switch (filterType) {
      case "have":
        return inHaveList;
      case "want":
        return inWantList;
      case "neither":
        return !inHaveList && !inWantList;
      case "either":
        return inHaveList || inWantList;
      default:
        return true;
    }
  });
};

/**
 * Check if villager has enhanced data
 * @param {Object} villager - Villager object
 * @returns {boolean} True if has enhanced data
 */
const hasEnhancedVillagerData = (villager) => {
  const favoriteGifts = getVillagerField(villager, "favoriteGifts");
  const posterUrl = getVillagerField(villager, "imageUrl");
  const houseSong = getVillagerField(villager, "houseSong");

  return !!(
    villager._newFormatData ||
    (favoriteGifts &&
      (favoriteGifts.favorite_colors?.length > 0 ||
        favoriteGifts.favorite_styles?.length > 0)) ||
    posterUrl ||
    houseSong
  );
};

/**
 * Create a debounced filter function
 * @param {Function} filterFn - Filter function to debounce
 * @param {number} delay - Debounce delay in ms
 * @returns {Function} Debounced filter function
 */
export const createDebouncedFilter = (filterFn, delay = 300) => {
  let timeoutId;

  return (...args) => {
    clearTimeout(timeoutId);

    return new Promise((resolve) => {
      timeoutId = setTimeout(() => {
        resolve(filterFn(...args));
      }, delay);
    });
  };
};

/**
 * Batch filter multiple criteria efficiently
 * @param {Array} villagers - Array of villager objects
 * @param {Array} filterConfigs - Array of filter configurations
 * @returns {Array} Filtered villagers
 */
export const batchFilter = (villagers, filterConfigs) => {
  if (!Array.isArray(villagers) || !Array.isArray(filterConfigs)) {
    return villagers;
  }

  return filterConfigs.reduce((filteredVillagers, config) => {
    if (config.type === "universal") {
      return createUniversalFilter(filteredVillagers, config.filters);
    } else if (config.type === "collection") {
      return filterByCollection(
        filteredVillagers,
        config.collectionContext,
        config.filterType
      );
    } else if (config.type === "search") {
      return advancedVillagerSearch(
        filteredVillagers,
        config.searchTerm,
        config.options
      );
    }
    return filteredVillagers;
  }, villagers);
};
