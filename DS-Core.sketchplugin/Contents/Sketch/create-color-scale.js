@import "settings.js";
@import "./functions/color-functions.js";


var onRun = function(context) {
    const sketch = require("sketch");
    var document = sketch.getSelectedDocument();
    var selection = document.selectedLayers;

    // console.log("Generate color scale from selection");

    if (selection.layers.length > 0) {
        var layer;

        var instructionalTextForInput =
            "Choose the number of steps you'd like to use to create Color Scales from the Selected Layers."
        instructionalTextForInput += "\n\n"
        instructionalTextForInput += "Tip: the name of the selected layers will be used as 'base name' and the fill color as 'middle step'.";

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
                    // sketch.UI.message(value);
                    sketch.UI.message("🌈: Yay! " + value.replace("Steps", "Color steps created! 👏 🚀"));

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