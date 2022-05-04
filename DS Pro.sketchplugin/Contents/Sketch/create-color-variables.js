const sketch = require("sketch");
const sketchversion = sketch.version.sketch;
const Swatch = sketch.Swatch;
const document = sketch.getSelectedDocument();
@import "functions.js";

var onRun = function(context) {
    var selection = document.selectedLayers;

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
        console.log("function1");
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
        console.log("function2");
        let swatch = matchingSwatchForColor(color)
        return swatch.referencingColor
    }
};