/**
 * Centralized Villager Data Accessor
 *
 * Provides a unified interface for accessing villager data fields across
 * different data formats (old API format vs new schema format).
 * Eliminates repetitive data access patterns throughout the codebase.
 */

/**
 * Get a specific field from villager data with fallback handling
 * @param {Object} villager - Villager data object
 * @param {string} field - Field name to retrieve
 * @returns {*} Field value or fallback
 */
export const getVillagerField = (villager, field) => {
  if (!villager) return null;

  const fieldMappings = {
    // Basic identification fields
    name: () =>
      villager._newFormatData?.name ||
      villager.name?.["name-USen"] ||
      villager.name ||
      "Unknown Villager",

    id: () =>
      villager.id ||
      (villager.name
        ? generateSimpleId(getVillagerField(villager, "name"))
        : Math.random() * 10000),

    species: () => villager._newFormatData?.species || villager.species,

    gender: () => villager._newFormatData?.gender || villager.gender,

    personality: () =>
      villager._newFormatData?.personality || villager.personality,

    // Date and text fields
    birthday: () =>
      villager._newFormatData?.birthday ||
      villager["birthday-string"] ||
      villager.birthday,

    catchphrase: () =>
      villager._newFormatData?.catchphrase ||
      villager["catch-phrase"] ||
      villager.catchphrase,

    saying: () =>
      villager.saying ||
      generatePersonalitySaying(getVillagerField(villager, "personality")),

    hobby: () => villager._newFormatData?.hobby || villager.hobby,

    // Image and media fields
    imageUrl: () =>
      villager._newFormatData?.poster_image_url ||
      villager.image_uri ||
      villager.poster_image_url,

    houseSong: () => villager._newFormatData?.house_song || villager.house_song,

    pageUrl: () => villager._newFormatData?.page_url || villager.page_url,

    // Color and styling fields
    textColor: () =>
      villager["text-color"] ||
      getPersonalityColor(getVillagerField(villager, "personality"), "text"),

    bubbleColor: () =>
      villager["bubble-color"] ||
      getPersonalityColor(getVillagerField(villager, "personality"), "bubble"),

    // Enhanced data fields
    favoriteGifts: () =>
      villager._newFormatData?.favorite_gifts ||
      villager.favorite_gifts || {
        favorite_styles: [],
        favorite_colors: [],
        ideal_clothing_examples: [],
      },

    favoriteColors: () => {
      const gifts = getVillagerField(villager, "favoriteGifts");
      return gifts?.favorite_colors || [];
    },

    favoriteStyles: () => {
      const gifts = getVillagerField(villager, "favoriteGifts");
      return gifts?.favorite_styles || [];
    },

    idealClothing: () => {
      const gifts = getVillagerField(villager, "favoriteGifts");
      return gifts?.ideal_clothing_examples || [];
    },

    appearances: () =>
      villager._newFormatData?.appearances ||
      villager.appearances || ["New Horizons"],

    // Computed fields
    displayGender: () => {
      const gender = getVillagerField(villager, "gender");
      return gender === "Female"
        ? "She/Her"
        : gender === "Male"
        ? "He/Him"
        : gender;
    },

    fullDescription: () => {
      const name = getVillagerField(villager, "name");
      const species = getVillagerField(villager, "species");
      const personality = getVillagerField(villager, "personality");
      return `${name}, a ${species} villager with ${personality} personality`;
    },
  };

  const mapper = fieldMappings[field];
  return mapper ? mapper() : villager[field] || null;
};

/**
 * Get multiple fields from villager data at once
 * @param {Object} villager - Villager data object
 * @param {Array<string>} fields - Array of field names to retrieve
 * @returns {Object} Object with requested fields as properties
 */
export const getVillagerFields = (villager, fields) => {
  const result = {};
  fields.forEach((field) => {
    result[field] = getVillagerField(villager, field);
  });
  return result;
};

/**
 * Check if villager has enhanced data available
 * @param {Object} villager - Villager data object
 * @returns {boolean} True if villager has new format data
 */
export const hasEnhancedData = (villager) => {
  return !!(
    villager?._newFormatData ||
    villager?.favorite_gifts?.favorite_colors?.length > 0 ||
    villager?.poster_image_url
  );
};

/**
 * Get a formatted villager summary for display
 * @param {Object} villager - Villager data object
 * @returns {Object} Formatted summary object
 */
export const getVillagerSummary = (villager) => {
  return {
    name: getVillagerField(villager, "name"),
    species: getVillagerField(villager, "species"),
    personality: getVillagerField(villager, "personality"),
    gender: getVillagerField(villager, "displayGender"),
    birthday: getVillagerField(villager, "birthday"),
    catchphrase: getVillagerField(villager, "catchphrase"),
    imageUrl: getVillagerField(villager, "imageUrl"),
    hasEnhanced: hasEnhancedData(villager),
  };
};

/**
 * Generate a simple numeric ID from a string
 * @param {string} str - String to convert to ID
 * @returns {number} Generated ID
 */
const generateSimpleId = (str) => {
  if (!str) return Math.random() * 10000;

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

/**
 * Generate a personality-based saying
 * @param {string} personality - Villager personality
 * @returns {string} Generated saying
 */
const generatePersonalitySaying = (personality) => {
  const personalitySayings = {
    Normal: "Life is what you make of it!",
    Peppy: "Every day is a new adventure!",
    Snooty: "Quality over quantity, always.",
    "Big sister": "You've got this, kiddo!",
    Lazy: "Food makes everything better.",
    Jock: "No pain, no gain!",
    Cranky: "Back in my day...",
    Smug: "Naturally, I'm fabulous.",
  };

  return personalitySayings[personality] || "Living life one day at a time.";
};

/**
 * Get personality-based colors
 * @param {string} personality - Villager personality
 * @param {string} type - 'text' or 'bubble'
 * @returns {string} Color hex code
 */
const getPersonalityColor = (personality, type) => {
  const colors = {
    text: {
      Normal: "#2c5530",
      Peppy: "#ff1493",
      Snooty: "#4b0082",
      "Big sister": "#8b4513",
      Lazy: "#ff8c00",
      Jock: "#228b22",
      Cranky: "#8b0000",
      Smug: "#4169e1",
    },
    bubble: {
      Normal: "#90ee90",
      Peppy: "#ffb6c1",
      Snooty: "#dda0dd",
      "Big sister": "#f4a460",
      Lazy: "#ffd700",
      Jock: "#98fb98",
      Cranky: "#f08080",
      Smug: "#87ceeb",
    },
  };

  return (
    colors[type]?.[personality] || (type === "text" ? "#333333" : "#e0e0e0")
  );
};

/**
 * Search villagers by multiple criteria
 * @param {Array} villagers - Array of villager objects
 * @param {string} searchTerm - Search term to match against
 * @param {Array<string>} searchFields - Fields to search in (default: name, species, personality)
 * @returns {Array} Filtered villagers
 */
export const searchVillagers = (
  villagers,
  searchTerm,
  searchFields = ["name", "species", "personality"]
) => {
  if (!searchTerm || !Array.isArray(villagers)) return villagers;

  const lowerSearchTerm = searchTerm.toLowerCase();

  return villagers.filter((villager) => {
    return searchFields.some((field) => {
      const fieldValue = getVillagerField(villager, field);
      return (
        fieldValue &&
        fieldValue.toString().toLowerCase().includes(lowerSearchTerm)
      );
    });
  });
};

/**
 * Sort villagers by a specific field
 * @param {Array} villagers - Array of villager objects
 * @param {string} field - Field to sort by
 * @param {string} direction - 'asc' or 'desc'
 * @returns {Array} Sorted villagers
 */
export const sortVillagers = (villagers, field, direction = "asc") => {
  if (!Array.isArray(villagers)) return [];

  return [...villagers].sort((a, b) => {
    const aValue = getVillagerField(a, field) || "";
    const bValue = getVillagerField(b, field) || "";

    const comparison = aValue.toString().localeCompare(bValue.toString());
    return direction === "asc" ? comparison : -comparison;
  });
};
