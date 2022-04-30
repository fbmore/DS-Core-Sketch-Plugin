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

function nameList(array = []) {
    if (array.length > 0) {
        let checkArray = [];
        for (i = 0; i < array.length; i++) {
            let name = array[i];
            let options = [" 50", " 100", " 200", " 300", " 400", " 500", " 600", " 700", " 800", " 900"];

            // Automatically remove the scale values generated with the create color scale script
            for (j = 0; j < options.length; j++) {
                let currentScaleValue = options[j];
                if (isExactMatch(name, currentScaleValue)) {
                    name = name.replace(currentScaleValue, "");
                }
            }
            // Add names to the folder list
            if (checkArray.length > 0) {
                if (!checkArray.includes(name)) {
                    checkArray.push(name);
                }
            } else {
                checkArray.push(name);
            }
        }
        return checkArray;
    } else {
        return array;
    }
}

function escapeRegExpMatch(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
}

function isExactMatch(str, match) {
    return new RegExp(`\\b${escapeRegExpMatch(match)}\\b`).test(str);
}
