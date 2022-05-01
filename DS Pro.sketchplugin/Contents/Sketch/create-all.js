@import "functions.js";
@import "color-functions.js"

var onRun = function(context) {
    const sketch = require("sketch");
    var document = sketch.getSelectedDocument();
    var selection = document.selectedLayers;

    var newSelection = [];
    // Detect Sketch Version to create colors or color vars
    var sketchversion = sketch.version.sketch;

    // console.log("Generate color scale from selection");

    // Part 1. Create the layers
    if (selection.layers.length > 0) {
        var layer;

        // var colorVariations = [
        //     "900,800,700,600,500,400,300,200,100,50",
        //     "50,100,200,300,400,500,600,700,800,900",
        //     "900, 700, 500, 200, 50",
        //     "50, 200, 500, 700, 900",
        // ];
        //
        // var labels = [
        //     "10 Steps - Darker to Lighter",
        //     "10 Steps - Lighter to Darker",
        //     "5 Steps - Darker to Lighter",
        //     "5 Steps - Lighter to Darker",
        // ];

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
                            newSelection.push(newLayer.id);
                        }
                        layer.remove();
                    }
                }
            }
        );

        if (newSelection.length > 0) {
            selection.clear();
            for (n = 0; n < newSelection.length; n++) {
                let layerToBeSelected = newSelection[n];
                const layer = document.getLayerWithID(layerToBeSelected);
                layer.selected = true;
            }

            selection = document.selectedLayers;

            var documentColors = sketch.getSelectedDocument().colors;
            var colorname;
            var layer;

            let colorList = selection.layers.map((layer) => layer["name"]);

            // Generate an array of Folders based on the created list of layers
            let colorFolders = nameList(colorList);

            // Generate colors from selection
            for (c = 0; c < selection.layers.length; ++c) {
                var arrayColorAssetsValues = documentColors.map((ColorAsset) => ColorAsset["color"]);
                var arrayColorAssetsNames = documentColors.map((ColorAsset) => ColorAsset["name"]);
                var arrayColorNamesAndValues = documentColors.map((ColorAsset) => [ColorAsset["name"], ColorAsset["color"]]);

                if (sketchversion >= 69) {
                    var arrayColorVarNames = document.swatches.map((Swatch) => Swatch["name"]);
                }

                layer = selection.layers[c];

                if (layer.type === "Text") {
                    var color = layer.style.textColor;
                } else if (layer.type === "ShapePath" || layer.type === "Shape") {
                    var color = layer.style.fills[0].color;
                }

                colorname = layer.name;
                if (colorFolders.length > 0) {
                    for (i = 0; i < colorFolders.length; i++) {
                        if (colorname.includes(colorFolders[i])) {
                            colorname = colorFolders[i] + "/" + colorname;
                        }
                    }
                }

                if (sketchversion >= 69) {
                    const Swatch = sketch.Swatch;
                    var newSwatch = Swatch.from({ name: colorname, color: color });

                    if (arrayColorVarNames.indexOf(colorname) === -1) {
                        document.swatches.push(newSwatch);
                    } else {}
                    // /// Update all the layers using the Swatches/Color Vars
                    var currentSwatch = newSwatch;
                    let swatchContainer = document.sketchObject.documentData().sharedSwatches();
                    currentSwatch.sketchObject.updateWithColor(MSColor.colorWithHex_alpha(color.slice(1, 6), 1));
                    // currentSwatch.color = color
                    // console.log("New color value: " + document.swatches[arrayColorVarNames.indexOf(colorname)].color)
                    var myColor = currentSwatch.referencingColor;

                    layer.style.fills[0].color = myColor;
                    // /// Update all the layers using the Swatches/Color Vars
                    swatchContainer = document.sketchObject.documentData().sharedSwatches();
                    swatchContainer.updateReferencesToSwatch(currentSwatch.sketchObject);
                } else {
                    if (arrayColorAssetsNames.indexOf(colorname) === -1) {
                        documentColors.push({ type: "ColorAsset", name: colorname, color: color });
                    } else {}
                }
            }

            selection.clear();

            if (sketchversion >= 69) {
                sketch.UI.message("🌈: Yay! You now have " + document.swatches.length + " color variables available! 👏 🚀");
            } else {
                sketch.UI.message("🌈: Yay! You now have " + documentColors.length + " colors available! 👏 🚀");
            }
        }
    } else {
        sketch.UI.message("☝️ Please select at least one layer.");
    }
};