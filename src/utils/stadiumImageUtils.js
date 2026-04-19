/**
 * Stadium Image Utilities
 * Provides fallback image mapping and validation for stadium upgrade cards
 */

// Map stadium levels to their default image files
const STADIUM_IMAGE_MAP = {
  'level0': null, // Level 0 uses SVG only
  'level1': null, // Uses SVG
  'level2': null, // Uses SVG
  'level3': null, // Uses SVG
  'level4': null, // Uses SVG
  'level5': null, // Uses SVG
  'level6': null, // Uses SVG
}

/**
 * Validates if a stadium image URL is valid and not empty
 * @param {string} imageUrl - The image URL to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidStadiumImage = (imageUrl) => {
  return imageUrl && typeof imageUrl === 'string' && imageUrl.trim().length > 0
}

/**
 * Gets the appropriate image for a stadium level
 * Falls back to SVG rendering if no image is available
 * @param {string} levelKey - The stadium level key (e.g., 'level1')
 * @param {string} imageUrl - Optional image URL from database
 * @returns {object} - Object with { src, useFallback } properties
 */
export const getStadiumImageForLevel = (levelKey, imageUrl) => {
  // If there's a valid image URL from the database, use it
  if (isValidStadiumImage(imageUrl)) {
    return {
      src: imageUrl,
      useFallback: false,
    }
  }

  // Otherwise use SVG fallback
  return {
    src: null,
    useFallback: true,
  }
}

/**
 * Extracts numeric level from level string (e.g., 'level3' -> 3)
 * @param {string} levelStr - The level string
 * @returns {number} - The numeric level value
 */
export const extractLevelNumber = (levelStr) => {
  if (!levelStr) return 0
  const match = levelStr.toString().replace(/\D/g, '')
  return match ? parseInt(match, 10) : 0
}

export default {
  isValidStadiumImage,
  getStadiumImageForLevel,
  extractLevelNumber,
  STADIUM_IMAGE_MAP,
}
