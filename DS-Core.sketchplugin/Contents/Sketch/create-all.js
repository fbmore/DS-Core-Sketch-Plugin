const sketch = require("sketch");
const sketchversion = sketch.version.sketch;
var document = sketch.getSelectedDocument();
const Swatch = sketch.Swatch;
var selection = document.selectedLayers;
@import "functions.js";
@import "color-functions.js"

var onRun = function(context) {
    var newSelection = [];
    // Detect Sketch Version to create colors or color vars
    var sketchversion = sketch.version.sketch;

    // console.log("Generate color scale from selection");

    // Part 1. Create the layers
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
            "Generate Color Scales & Variables", {
                description: instructionalTextForInput,
                type: sketch.UI.INPUT_TYPE.selection,
                possibleValues: labels,
            },
            (err, value) => {
                if (err) {
                    // most likely the user canceled the input
                    return;
                } else {
                    sketch.UI.message("🌈: Yay! " + value.replace("Steps","Color steps created! 👏 🚀"));

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
                            newSelection.push(newLayer);
                        }
                        layer.remove();
                    }
                }
            }
        );
        // Color Variables
        for (i = 0; i < newSelection.length; i++) {
            newSelection[i].selected = true;
        }
        selection = document.selectedLayers;
        if (selection.length > 0) {
            var documentColors = sketch.getSelectedDocument().colors;

            var colorName;
            var layer;
            // ordered list of layers
            let colorList = selection.layers.map((layer) => layer["name"]);
            // Generate an array of Folders based on the created list of layers with the color-create-scale script
            let colorFolders = nameList(colorList);

            // Generate colors from selection
            let counter = 0
            for (c = 0; c < selection.layers.length; ++c) {
                layer = selection.layers[c];

                if (layer.type === "Text") {
                    var color = layer.style.textColor;
                } else if (layer.type === "ShapePath" || layer.type === "Shape") {
                    var color = layer.style.fills[0].color;
                }

                colorName = layer.name;
                // Add a folder to Color Variables
                if (colorFolders.length > 0) {
                    for (i = 0; i < colorFolders.length; i++) {
                        if (colorName.includes(colorFolders[i][0]) && colorFolders[i][1] === true) {
                            colorName = colorFolders[i][0] + "/" + colorName;
                        }
                    }
                }

                let arrayColorAssetsNames = [];
                if (sketchversion >= 69) {

                    arrayColorVarNames = document.swatches.map((Swatch) => Swatch["name"]);

                    let newSwatch = Swatch.from({
                        name: colorName,
                        color: color,
                    })

                    // Generate the new Color Variable if it doesn't exist
                    if (arrayColorVarNames.length > 0) {
                        if (arrayColorVarNames.indexOf(colorName) === -1) {
                            document.swatches.push(newSwatch);
                            counter++
                        }
                    } else {
                        document.swatches.push(newSwatch);
                        counter++
                    }

                    // Update the layer style with the new Color
                    if (layer.type === "Text") {
                        layer.style.textColor = newSwatch.referencingColor;
                    } else if (layer.type === "ShapePath" || layer.type === "Shape") {
                        layer.style.fills[0].color = newSwatch.referencingColor;
                    }

                    if (counter > 0) {
                        sketch.UI.message("🌈: Yay! You now have " + counter.toString() + " Color Variables available! 👏 🚀");
                    } else {
                        sketch.UI.message("🌈: All the Color Variables already existed. You have " + document.swatches.length.toString() + " Color Variables available! 👏 🚀");
                    }


                } else {
                    arrayColorAssetsNames = documentColors.map((ColorAsset) => ColorAsset["name"]);
                    if (arrayColorAssetsNames.indexOf(colorName) === -1) {
                        documentColors.push({ type: "ColorAsset", name: colorName, color: color });
                    }
                    sketch.UI.message("🌈: Yay! You now have " + documentColors.length + " Colors Available! 👏 🚀");
                }
            }
        }
    } else {
        sketch.UI.message("🌈: Please select at least one Layer 😅");
    }

    // When you open an existing document in Sketch 69, the color assets in the document will be migrated to Color Swatches. However, layers using those colors will not be changed to use the new swatches. This plugin takes care of this
    const allLayers = sketch.find('*') // TODO: optimise this query: ShapePath, SymbolMaster, Text, SymbolInstance
    allLayers.forEach(layer => {
        layer.style.fills
            .concat(layer.style.borders)
            .filter(item => item.fillType == 'Color')
            .forEach(item => {
                const layerColor = item.color
                let swatch = matchingSwatchForColor(layerColor)
                if (!swatch) {
                    return
                }
                item.color = swatch.referencingColor
            })
            // Previous actions don't work for Text Layer colors that are colored using TextColor, so let's fix that:
        if (layer.style.textColor) {
            const layerColor = layer.style.textColor
            let swatch = matchingSwatchForColor(layerColor)
            if (!swatch) {
                return
            }
            layer.style.textColor = swatch.referencingColor
        }
    })

    function matchingSwatchForColor(color, name) {
        // We need to match color *and* name, if we want this to work
        const swatches = sketch.getSelectedDocument().swatches
        const matchingSwatches = swatches.filter(swatch => swatch.color === color)
        if (matchingSwatches.length == 0) {
            return null
        }
        if (matchingSwatches.length == 1) {
            return matchingSwatches[0]
        }
        // This means there are multiple swatches matching the color. We'll see if we can find one that also matches the name. If we don't find one, or there is no name provided, return the first match.
        if (name) {
            const swatchesMatchingName = matchingSwatches.filter(
                swatch => swatch.name === name
            )
            if (swatchesMatchingName.length) {
                return swatchesMatchingName[0]
            } else {
                return matchingSwatches[0]
            }
        } else {
            return matchingSwatches[0]
        }
    }

    function colorVariableFromColor(color) {
        let swatch = matchingSwatchForColor(color)
        return swatch.referencingColor
    }
};
