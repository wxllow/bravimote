const themeColors = {
    blue: '#007BFF',
    green: '#28A745',
    lavender: '#E6E6FA',
    teal: '#20C997',
    pink: '#E83E8C'
};

/// Converts a hex color string (e.g., "#A3B1C8") to an RGB object.
function hexToRgb(hex: string) {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16)
          }
        : null;
}

/**
 * Calculates the squared Euclidean distance between two RGB colors.
 * We use squared distance to save a step (no Math.sqrt) because
 * minimizing the squared distance is the same as minimizing the distance.
 * * Formula: distance² = (r₂ - r₁)² + (g₂ - g₁)² + (b₂ - b₁)²
 */
function colorDistanceSquared(
    rgb1: { r: number; g: number; b: number },
    rgb2: { r: number; g: number; b: number }
) {
    const dr = rgb1.r - rgb2.r;
    const dg = rgb1.g - rgb2.g;
    const db = rgb1.b - rgb2.b;
    return dr * dr + dg * dg + db * db;
}

/// Finds the closest theme name for a given target hex color.
export function findClosestTheme(userHexColor: string) {
    const targetRgb = hexToRgb(userHexColor);

    if (!targetRgb) {
        console.error('Invalid hex color provided.');
        return 'blue';
    }

    let closestTheme = 'blue';
    let shortestDistance = Infinity;

    for (const themeName in themeColors) {
        const themeHex = themeColors[themeName as keyof typeof themeColors];

        const themeRgb = hexToRgb(themeHex)!;

        const distance = colorDistanceSquared(targetRgb, themeRgb);

        if (distance < shortestDistance) {
            shortestDistance = distance;
            closestTheme = themeName;
        }
    }

    return closestTheme;
}
