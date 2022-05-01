@import "functions.js";

var onRun = function(context) {
    var sketch = require("sketch");

    var document = sketch.getSelectedDocument();

    var selection = document.selectedLayers;
    var documentColors = sketch.getSelectedDocument().colors;

    // Detect Sketch Version to create colors or color vars
    var sketchversion = sketch.version.sketch;

    var colorname;
    var layer;

    let colorList = selection.layers.map((layer) => layer["name"]);
    // Generate an array of Folders based on the created list of layers with the color-create-scale script
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

    if (sketchversion >= 69) {
        sketch.UI.message("🌈: Yay! You now have " + document.swatches.length + " Color Variables available! 👏 🚀");
    } else {
        sketch.UI.message("🌈: Yay! You now have " + documentColors.length + " Colors Available! 👏 🚀");
    }
};