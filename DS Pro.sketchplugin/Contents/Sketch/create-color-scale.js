var onRun = function(context) {
    const sketch = require("sketch");
    var document = sketch.getSelectedDocument();
    var selection = document.selectedLayers;

    // Detect Sketch Version to create colors or color vars

    // console.log("Generate color scale from selection");

    if (selection.layers.length > 0) {
        var layer;

        var colorVariations = [
            "900,800,700,600,500,400,300,200,100,50",
            "800,700,600,500,400,300,200,100",
            "900,700,500,300,100",
            "900,700,500,300",
            "700,500,300",
        ];

        var labels = [
            "10 Steps",
            "8 Steps",
            "5 Steps",
            "4 Steps",
            "3 Steps",
        ];

        let padding = 8;

        var instructionalTextForInput =
            "Choose the number of steps you'd like to use to create Color Scales from the Selected Layers.\n\nTip: the name of the selected layers will be used as 'base name' and the fill color as 'middle step'.";

        sketch.UI.getInputFromUser(
            "Generate Color Scales", {
                description: instructionalTextForInput,
                type: sketch.UI.INPUT_TYPE.selection,
                possibleValues: labels,
            },
            (err, value) => {
                if (err) {
                    // most likely the user canceled the input
                    return;
                } else {
                    sketch.UI.message(value);

                    let result = colorVariations[labels.indexOf(value)];

                    colorVariations = result.split(",");

                    let numColorVariations = colorVariations.length;

                    let reverse = false;
                    if (colorVariations[0] < colorVariations[numColorVariations - 1]) {
                        colorVariations.reverse();
                        reverse = true;
                    }
                    let colorVariationsFirst = colorVariations[0];
                    let colorVariationsLast = colorVariations[numColorVariations - 1];

                    let middleIndex = parseInt(numColorVariations / 2);
                    if (middleIndex % 2 !== 0) {
                        middleIndex = middleIndex - 1;
                    }

                    var colorVariationsMiddle = colorVariations[middleIndex];
                    var colorVariationsDeltaBelow = (colorVariationsMiddle - colorVariationsLast) / middleIndex;

                    // console.log("----------------------------");
                    // console.log("numColorVariations: " + numColorVariations);
                    // console.log("colorVariationsFirst: " + colorVariationsFirst);
                    // console.log("colorVariationsLast: " + colorVariationsLast);
                    // console.log("colorVariationsMiddle: " + colorVariationsMiddle);
                    // console.log("colorVariationsDeltaBelow: " + colorVariationsDeltaBelow);
                    // console.log("middleIndex: " + middleIndex);
                    // console.log("----------------------------");

                    // Generate colors from selection
                    for (c = 0; c < selection.layers.length; c++) {
                        let colorName = selection.layers[c].name;

                        layer = selection.layers[c];
                        let color = "";
                        if (layer.type === "ShapePath" || layer.type === "Shape") {
                            color = layer.style.fills[0].color;
                        }
                        let posX = layer.frame.x;
                        if (reverse) {
                            posX = layer.frame.x + (layer.frame.width + padding) * (colorVariations.length - 1);
                        }

                        for (cv = 0; cv < colorVariations.length; cv++) {
                            let percent = (colorVariationsDeltaBelow * (cv - middleIndex)) / 100;

                            // Calculate color
                            let newColor = color;
                            if (percent !== 0) {
                                newColor = increase_brightness(color, percent);
                            }
                            result = result + ", " + newColor;

                            var newLayer = layer.duplicate();
                            newLayer.style.fills[0].color = newColor;
                            newLayer.name = colorName + " " + colorVariations[cv];
                            newLayer.frame.x = posX;
                            // Position
                            if (reverse) {
                                posX = posX - layer.frame.width - padding;
                            } else {
                                posX = posX + layer.frame.width + padding;
                            }
                        }
                        layer.remove();
                    }
                }
            }
        );
    } else {
        sketch.UI.message("☝️ Please select at least one layer.");
    }
};

function increase_brightness(hex, percent) {
    // strip the leading # if it's there
    hex = hex.replace(/^\s*#|\s*$/g, "");

    // convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
    if (hex.length == 3) {
        hex = hex.replace(/(.)/g, "$1$1");
    }

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

    // console.log("RGB from HSL");
    // console.log(r + "," + g + "," + b);

    // return "rgb(" + r + "," + g + "," + b + ")";
    return [r, g, b];
}
