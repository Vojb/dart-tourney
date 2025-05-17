// Color utility functions

/**
 * Maps colors to color names for better team naming
 */
export const colorToNameMap: { [key: string]: string } = {
  "#3498db": "Blue",
  "#e74c3c": "Red",
  "#2ecc71": "Green",
  "#f39c12": "Orange",
  "#9b59b6": "Purple",
  "#1abc9c": "Teal",
  "#f1c40f": "Yellow",
  "#34495e": "Navy",
  "#16a085": "Dark Teal",
  "#d35400": "Burnt Orange",
  "#c0392b": "Dark Red",
  "#8e44ad": "Dark Purple",
  "#27ae60": "Dark Green",
  "#2980b9": "Ocean Blue",
  "#ff6b81": "Pink",
  "#5352ed": "Bright Blue",
  "#ff4757": "Bright Red",
  "#7bed9f": "Light Green",
  "#70a1ff": "Sky Blue",
  "#a4b0be": "Gray",
  "#ff6348": "Coral",
  "#7158e2": "Indigo",
  "#3742fa": "Royal Blue",
};

/**
 * Find closest color name for any hex color
 */
export const getColorName = (hexColor: string): string => {
  // If exact match exists, use it
  if (colorToNameMap[hexColor]) {
    return colorToNameMap[hexColor];
  }

  // Parse the hex color
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  // Find dominant color component
  const max = Math.max(r, g, b);
  let colorName = "Black";

  if (max > 200) {
    if (r > g && r > b) colorName = "Red";
    else if (g > r && g > b) colorName = "Green";
    else if (b > r && b > g) colorName = "Blue";
    else if (r > 200 && g > 200 && b < 100) colorName = "Yellow";
    else if (r > 200 && b > 200 && g < 100) colorName = "Purple";
    else if (g > 200 && b > 200 && r < 100) colorName = "Cyan";
    else if (r > 200 && g > 200 && b > 200) colorName = "White";
  } else if (max > 150) {
    if (r > g && r > b) colorName = "Dark Red";
    else if (g > r && g > b) colorName = "Dark Green";
    else if (b > r && b > g) colorName = "Dark Blue";
    else if (r > 150 && g > 150 && b < 100) colorName = "Gold";
    else if (r > 150 && b > 150 && g < 100) colorName = "Violet";
    else if (g > 150 && b > 150 && r < 100) colorName = "Teal";
    else colorName = "Silver";
  } else if (max > 100) {
    if (r > g && r > b) colorName = "Brown";
    else if (g > r && g > b) colorName = "Olive";
    else if (b > r && b > g) colorName = "Navy";
    else colorName = "Gray";
  }

  return colorName;
};
