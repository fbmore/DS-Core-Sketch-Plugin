const sketch = require("sketch");
const sketchversion = sketch.version.sketch;
const Swatch = sketch.Swatch;
const document = sketch.getSelectedDocument();
@import "settings.js";
@import "./functions/functions.js";

var onRun = function(context) {
    @import "./functions/color-functions.js";
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
                    if (counter < 2) {
                        sketch.UI.message("🌈: Yay! You now have " + counter.toString() + " new Color Variable available! 👏 🚀");
                    } else {
                        sketch.UI.message("🌈: Yay! You now have " + counter.toString() + " new Color Variables available! 👏 🚀");
                    }

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

    // Update layers with the created color variables
    updateLayerWithColorVariables();
};