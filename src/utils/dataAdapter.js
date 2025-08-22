/**
 * Data Adapter for ACNH Villager Schema Migration
 * 
 * Handles transformation between the old ACNH API format and the new schema format.
 * Provides backward compatibility and graceful handling of missing fields.
 */

/**
 * Generate a consistent ID from villager name
 * @param {string} name - Villager name
 * @returns {number} Generated ID
 */
export const generateVillagerID = (name) => {
  if (!name) return Math.random() * 10000;
  
  // Simple hash function to generate consistent IDs from names
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

/**
 * Transform old ACNH API format to new schema format
 * @param {Object} oldVillager - Villager in old format
 * @returns {Object} Villager in new schema format
 */
export const transformOldToNew = (oldVillager) => {
  if (!oldVillager) return null;

  const newVillager = {
    // Required fields
    name: oldVillager.name?.["name-USen"] || oldVillager.name || "Unknown",
    species: oldVillager.species || null,
    gender: oldVillager.gender || null,
    personality: oldVillager.personality || null,
    birthday: convertBirthdayFormat(oldVillager["birthday-string"]),
    catchphrase: oldVillager["catch-phrase"] || oldVillager.catchphrase || null,

    // Optional fields with fallbacks
    poster_image_url: oldVillager.image_uri || oldVillager.poster_image_url || null,
    hobby: oldVillager.hobby || null,
    house_song: oldVillager.house_song || null,
    appearances: oldVillager.appearances || ["New Horizons"],
    page_url: oldVillager.page_url || null,
    favorite_gifts: oldVillager.favorite_gifts || {
      favorite_styles: null,
      favorite_colors: null,
      ideal_clothing_examples: []
    }
  };

  return newVillager;
};

/**
 * Transform new schema format to old ACNH API format (for backward compatibility)
 * @param {Object} newVillager - Villager in new schema format
 * @returns {Object} Villager in old format
 */
export const transformNewToOld = (newVillager) => {
  if (!newVillager) return null;

  const oldVillager = {
    id: generateVillagerID(newVillager.name),
    name: { "name-USen": newVillager.name },
    species: newVillager.species,
    personality: newVillager.personality,
    gender: newVillager.gender,
    "birthday-string": newVillager.birthday,
    saying: generateSaying(newVillager), // Generate from other data
    "catch-phrase": newVillager.catchphrase,
    hobby: newVillager.hobby,
    image_uri: newVillager.poster_image_url,
    
    // Generate default colors based on personality
    "text-color": getPersonalityTextColor(newVillager.personality),
    "bubble-color": getPersonalityBubbleColor(newVillager.personality)
  };

  return oldVillager;
};

/**
 * Convert birthday from old format to new format
 * @param {string} oldBirthday - "October 1st" format
 * @returns {string} "October 1" format
 */
export const convertBirthdayFormat = (oldBirthday) => {
  if (!oldBirthday) return null;
  
  // Remove ordinal suffixes (st, nd, rd, th)
  return oldBirthday.replace(/(st|nd|rd|th)$/, "");
};

/**
 * Generate a saying based on personality and other villager data
 * @param {Object} villager - Villager data
 * @returns {string} Generated saying
 */
export const generateSaying = (villager) => {
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

  return personalitySayings[villager.personality] || "Living life one day at a time.";
};

/**
 * Get text color based on personality
 * @param {string} personality - Villager personality
 * @returns {string} Hex color code
 */
export const getPersonalityTextColor = (personality) => {
  const colors = {
    Normal: "#2c5530",
    Peppy: "#ff1493",
    Snooty: "#4b0082",
    "Big sister": "#8b4513",
    Lazy: "#ff8c00",
    Jock: "#228b22",
    Cranky: "#8b0000",
    Smug: "#4169e1",
  };
  
  return colors[personality] || "#333333";
};

/**
 * Get bubble color based on personality
 * @param {string} personality - Villager personality
 * @returns {string} Hex color code
 */
export const getPersonalityBubbleColor = (personality) => {
  const colors = {
    Normal: "#90ee90",
    Peppy: "#ffb6c1",
    Snooty: "#dda0dd",
    "Big sister": "#f4a460",
    Lazy: "#ffd700",
    Jock: "#98fb98",
    Cranky: "#f08080",
    Smug: "#87ceeb",
  };
  
  return colors[personality] || "#e0e0e0";
};

/**
 * Validate villager data against new schema
 * @param {Object} villager - Villager data to validate
 * @returns {Object} Validation result with isValid and errors
 */
export const validateVillagerData = (villager) => {
  const errors = [];
  
  // Check required fields
  const requiredFields = ["name", "species", "gender", "personality", "birthday", "catchphrase"];
  requiredFields.forEach(field => {
    if (!villager[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Validate enums
  const validGenders = ["Male", "Female", null];
  if (villager.gender && !validGenders.includes(villager.gender)) {
    errors.push(`Invalid gender: ${villager.gender}`);
  }

  const validPersonalities = ["Jock", "Cranky", "Peppy", "Snooty", "Normal", "Lazy", "Smug", "Big sister", null];
  if (villager.personality && !validPersonalities.includes(villager.personality)) {
    errors.push(`Invalid personality: ${villager.personality}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Detect data format and normalize to new schema
 * @param {Object|Array} data - Raw villager data
 * @returns {Array} Array of villagers in new schema format
 */
export const normalizeVillagerData = (data) => {
  if (!data) return [];
  
  let villagers = Array.isArray(data) ? data : [data];
  
  return villagers.map(villager => {
    // Detect if this is old format (has name["name-USen"] structure)
    if (villager.name && typeof villager.name === "object" && villager.name["name-USen"]) {
      return transformOldToNew(villager);
    }
    
    // Assume it's already in new format or close to it
    return {
      name: villager.name || "Unknown",
      species: villager.species || null,
      gender: villager.gender || null,
      personality: villager.personality || null,
      birthday: villager.birthday || null,
      catchphrase: villager.catchphrase || null,
      poster_image_url: villager.poster_image_url || null,
      hobby: villager.hobby || null,
      house_song: villager.house_song || null,
      appearances: villager.appearances || ["New Horizons"],
      page_url: villager.page_url || null,
      favorite_gifts: villager.favorite_gifts || {
        favorite_styles: null,
        favorite_colors: null,
        ideal_clothing_examples: []
      }
    };
  }).filter(villager => villager.name && villager.name !== "Unknown");
};

/**
 * Get backward-compatible data for components still using old format
 * @param {Object} newVillager - Villager in new schema format
 * @returns {Object} Villager data compatible with existing components
 */
export const getCompatibleVillagerData = (newVillager) => {
  if (!newVillager) return null;
  
  const compatible = transformNewToOld(newVillager);
  
  // Add any additional fields that components might expect
  compatible._newFormatData = newVillager; // Store new format data for enhanced features
  
  return compatible;
};
