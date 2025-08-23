/**
 * Color name to CSS color value mapping for ACNH villager favorite colors
 * Maps Animal Crossing color names to web-safe CSS color values
 */

const colorMap = {
  // Primary colors
  Red: "#FF0000",
  Blue: "#0066CC",
  Green: "#00AA00",
  Yellow: "#FFD700",
  Orange: "#FF8C00",
  Purple: "#8A2BE2",
  Pink: "#FF69B4",

  // Extended colors from ACNH
  Aqua: "#00FFFF",
  Beige: "#F5F5DC",
  Black: "#2C2C2C",
  Brown: "#8B4513",
  Colorful: "#FF6347", // Fallback to a bright color
  Gray: "#808080",
  Grey: "#808080", // Alternative spelling
  White: "#F8F8F8", // Slightly off-white for better visibility

  // Additional ACNH specific colors
  "Light Blue": "#87CEEB",
  "Dark Blue": "#003366",
  "Light Green": "#90EE90",
  "Dark Green": "#006600",
  "Light Purple": "#DDA0DD",
  "Dark Purple": "#4B0082",
  "Light Pink": "#FFB6C1",
  "Dark Pink": "#C71585",
  "Light Yellow": "#FFFFE0",
  "Dark Yellow": "#B8860B",
  "Light Orange": "#FFA07A",
  "Dark Orange": "#FF4500",
  "Light Brown": "#D2B48C",
  "Dark Brown": "#654321",
  "Light Gray": "#D3D3D3",
  "Dark Gray": "#696969",
  "Light Grey": "#D3D3D3",
  "Dark Grey": "#696969",
};

/**
 * Convert ACNH color name to CSS color value
 * @param {string} colorName - The color name from ACNH data
 * @returns {string} CSS color value (hex code)
 */
export const getColorValue = (colorName) => {
  if (!colorName || typeof colorName !== "string") {
    return "#E0E0E0"; // Default light gray
  }

  // Handle case-insensitive lookup
  const normalizedColor = colorName.trim();
  return colorMap[normalizedColor] || "#E0E0E0";
};

/**
 * Get card colors from villager's favorite_colors array
 * @param {Object} villager - Villager data object
 * @returns {Object} Object with backgroundColor and textColor
 */
export const getCardColorsFromFavorites = (villager) => {
  // Extract favorite colors from the villager data
  const favoriteColors =
    villager?.favorite_gifts?.favorite_colors ||
    villager?.favorite_colors ||
    [];

  // Default colors as fallbacks
  const defaultBg = "#E0E0E0";
  const defaultText = "#333333";

  // If no favorite colors, fall back to current system or defaults
  if (!Array.isArray(favoriteColors) || favoriteColors.length === 0) {
    return {
      backgroundColor: villager?.["bubble-color"] || defaultBg,
      textColor: villager?.["text-color"] || defaultText,
    };
  }

  // Get first color for background, second for text (or use defaults if not enough colors)
  const backgroundColor = favoriteColors[0]
    ? getColorValue(favoriteColors[0])
    : defaultBg;
  const textColor = favoriteColors[1]
    ? getColorValue(favoriteColors[1])
    : defaultText;

  return {
    backgroundColor,
    textColor,
  };
};

/**
 * Check if a color is too light and needs dark text
 * @param {string} hexColor - Hex color code
 * @returns {boolean} True if the color is light and needs dark text
 */
export const isLightColor = (hexColor) => {
  // Remove # if present
  const color = hexColor.replace("#", "");

  // Convert to RGB
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5;
};

/**
 * Get contrasting text color for better readability
 * @param {string} backgroundColor - Background color hex code
 * @param {string} preferredTextColor - Preferred text color from favorite colors
 * @returns {string} Final text color that ensures good contrast
 */
export const getContrastingTextColor = (
  backgroundColor,
  preferredTextColor
) => {
  const bgIsLight = isLightColor(backgroundColor);
  const textIsLight = isLightColor(preferredTextColor);

  // If background and text are both light or both dark, adjust text color
  if (bgIsLight === textIsLight) {
    return bgIsLight ? "#333333" : "#FFFFFF";
  }

  return preferredTextColor;
};
