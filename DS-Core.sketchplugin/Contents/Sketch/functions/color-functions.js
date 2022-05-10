// **********************************************************
// General color functions for all the scripts
// import via @import(@import "color-functions.js") at the very
// beginning of your script (after the var onRun() statement)
// because the "context" variable is required (Actions)
// **********************************************************

/// Brightness management for color scales
function increase_brightness(hex, percent) {
    hex = standardizeHex(hex);

    let r = parseInt(hex.substr(0, 2), 16);
    let g = parseInt(hex.substr(2, 2), 16);
    let b = parseInt(hex.substr(4, 2), 16);

    //// RGB to HSL ////
    let colorHSL = RGBToHSL(r, g, b);

    let h = colorHSL[0];
    let s = colorHSL[1];
    let l = colorHSL[2];

    let horig = h;
    let sorig = s;

    /// Increase L in HSL ///
    if (percent < 0) {
        // l = l + percent * 10;
        l = l + percent * 5;
    } else {
        l = l + percent * 5;
    }

    colorRGB = HSLToRGB(horig, sorig, l);

    r = colorRGB[0];
    g = colorRGB[1];
    b = colorRGB[2];

    return RGBToHex(r, g, b);
}

/// Invert Colors
function invertColor(hex) {
    hex = standardizeHex(hex);

    if (hex.length !== 6 && hex.length !== 8) {
        throw new Error("Invalid HEX color.");
    }
    // invert color components
    var r = 255 - parseInt(hex.slice(0, 2), 16);
    var g = 255 - parseInt(hex.slice(2, 4), 16);
    var b = 255 - parseInt(hex.slice(4, 6), 16);
    var a = hex.slice(6, 8);

    return RGBToHex(r, g, b) + a;
}

/// RGBToHex
function RGBToHex(r, g, b) {
    r = r.toString(16);
    g = g.toString(16);
    b = b.toString(16);

    if (r.length == 1) r = "0" + r;
    if (g.length == 1) g = "0" + g;
    if (b.length == 1) b = "0" + b;

    return "#" + r + g + b;
}

/// RGBToHSL
function RGBToHSL(r, g, b) {
    // Make r, g, and b fractions of 1
    r /= 255;
    g /= 255;
    b /= 255;

    // Find greatest and smallest channel values
    let cmin = Math.min(r, g, b),
        cmax = Math.max(r, g, b),
        delta = cmax - cmin,
        h = 0,
        s = 0,
        l = 0;

    // Calculate hue
    // No difference
    if (delta == 0) h = 0;
    // Red is max
    else if (cmax == r) h = ((g - b) / delta) % 6;
    // Green is max
    else if (cmax == g) h = (b - r) / delta + 2;
    // Blue is max
    else h = (r - g) / delta + 4;

    h = Math.round(h * 60);

    // Make negative hues positive behind 360°
    if (h < 0) h += 360;

    // Calculate lightness
    l = (cmax + cmin) / 2;

    // Calculate saturation
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

    // Multiply l and s by 100
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    //return "hsl(" + h + "," + s + "%," + l + "%)";
    return [h, s, l];
}

/// HSLToRGB
function HSLToRGB(h, s, l) {
    // Must be fractions of 1
    s /= 100;
    l /= 100;

    let c = (1 - Math.abs(2 * l - 1)) * s,
        x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
        m = l - c / 2,
        r = 0,
        g = 0,
        b = 0;

    if (0 <= h && h < 60) {
        r = c;
        g = x;
        b = 0;
    } else if (60 <= h && h < 120) {
        r = x;
        g = c;
        b = 0;
    } else if (120 <= h && h < 180) {
        r = 0;
        g = c;
        b = x;
    } else if (180 <= h && h < 240) {
        r = 0;
        g = x;
        b = c;
    } else if (240 <= h && h < 300) {
        r = x;
        g = 0;
        b = c;
    } else if (300 <= h && h < 360) {
        r = c;
        g = 0;
        b = x;
    }
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return [r, g, b];
}

/// Standardize HEX
function standardizeHex(hex) {
    hex = hex.replace(/^\s*#|\s*$/g, "");
    // convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
    if (hex.length == 3 || hex.lenght == 4) {
        hex = hex.replace(/(.)/g, "$1$1");
    }
    return hex;
}

// Update Color Variables
function updateLayerWithColorVariables(context) {
    // When you open an existing document in Sketch 69, the color assets in the document will be migrated to Color Swatches. However, layers using those colors will not be changed to use the new swatches. This plugin takes care of this
    const allLayers = sketch.find("*"); // TODO: optimise this query: ShapePath, SymbolMaster, Text, SymbolInstance
    allLayers.forEach((layer) => {
        layer.style.fills
            .concat(layer.style.borders)
            .filter((item) => item.fillType == "Color")
            .forEach((item) => {
                const layerColor = item.color;
                let swatch = matchingSwatchForColor(layerColor);
                if (!swatch) {
                    return;
                }
                item.color = swatch.referencingColor;
            });
        // Previous actions don't work for Text Layer colors that are colored using TextColor, so let's fix that:
        if (layer.style.textColor) {
            const layerColor = layer.style.textColor;
            let swatch = matchingSwatchForColor(layerColor);
            if (!swatch) {
                return;
            }
            layer.style.textColor = swatch.referencingColor;
        }
    });
}

function matchingSwatchForColor(color, name) {
    // We need to match color *and* name, if we want this to work
    const swatches = sketch.getSelectedDocument().swatches;
    const matchingSwatches = swatches.filter(
        (swatch) => swatch.color === color
    );
    if (matchingSwatches.length == 0) {
        return null;
    }
    if (matchingSwatches.length == 1) {
        return matchingSwatches[0];
    }
    // This means there are multiple swatches matching the color. We'll see if we can find one that also matches the name. If we don't find one, or there is no name provided, return the first match.
    if (name) {
        const swatchesMatchingName = matchingSwatches.filter(
            (swatch) => swatch.name === name
        );
        if (swatchesMatchingName.length) {
            return swatchesMatchingName[0];
        } else {
            return matchingSwatches[0];
        }
    } else {
        return matchingSwatches[0];
    }
}

function colorVariableFromColor(color) {
    let swatch = matchingSwatchForColor(color);
    return swatch.referencingColor;
}

function createColorVariable(colorName, color) {
    const documentColors = sketch.getSelectedDocument().colors;
    // Generate the Color Variable, if not existent
    if (sketchversion >= 69) {
        var arrayColorVarNames = document.swatches.map(
            (Swatch) => Swatch["name"]
        );
        const Swatch = sketch.Swatch;
        var newSwatch = Swatch.from({ name: colorName, color: color });

        if (arrayColorVarNames.indexOf(colorName) === -1) {
            document.swatches.push(newSwatch);
        }
    } else {
        var arrayColorAssetsNames = documentColors.map(
            (ColorAsset) => ColorAsset["name"]
        );
        if (arrayColorAssetsNames.indexOf(colorName) === -1) {
            documentColors.push({
                type: "ColorAsset",
                name: colorName,
                color: color,
            });
        }
    }
}