var sketch = require("sketch");
var Page = require("sketch/dom").Page;

var onRun = function(context) {
    var document = sketch.getSelectedDocument();

    var selectedLayers = document.selectedLayers.layers;
    var count = 0;

    var SymbolMaster = require("sketch/dom").SymbolMaster;

    var instructionalTextForInput = "Define how you want to name your Symbols:";
    // instructionalTextForInput += "\n\n";
    // instructionalTextForInput += "Layer name";
    // instructionalTextForInput += "\n\n";
    // instructionalTextForInput += "Page name:\nthe Page name is your Symbol group and the Layer name is your Symbol name";

    var labels = ["Layer name", "Page name/Layer name"];

    // Plugin interactive window
    sketch.UI.getInputFromUser(
        "Choose how to name your Symbols", {
            description: instructionalTextForInput,
            type: sketch.UI.INPUT_TYPE.selection,
            possibleValues: labels,
        },
        (err, value) => {
            if (err) {
                return;
            } else {
                for (i = 0; i < selectedLayers.length; i++) {
                    let layer = selectedLayers[i];
                    let currentPage = layer.getParentPage();
                    let isSymbolPage = false;
                    if (currentPage === "Symbols") {
                        isSymbolPage = true;
                    }
                    if (layer.type !== "SymbolMaster" && layer.getParentSymbolMaster() === undefined) {
                        let itemX = layer.frame.x;
                        let itemY = layer.frame.y;
                        let itemWidth = layer.frame.width;
                        let itemHeight = layer.frame.height;
                        let itemName = layer.name;
                        if (value === labels[1]) {
                            itemName = layer.getParentPage().name + "/" + layer.name;
                        }

                        let currentArtboard = createArtboard(currentPage, itemX, itemY, itemWidth, itemHeight, itemName);
                        layer.parent = currentArtboard;
                        layer.frame.x = 0;
                        layer.frame.y = 0;
                        let newSymbol = SymbolMaster.fromArtboard(currentArtboard);

                        count++;
                    }
                }

                sketch.UI.message("🌈: Done creating " + count + " symbols! 👏 🚀");
                // sketch.UI.message("🌈: Done creating (or updating) " + count + " symbols! 👏 🚀");
            }
        }
    );

    function createArtboard(parentLayer, x, y, width, height, name) {
        let Artboard = sketch.Artboard;
        let artboard = new Artboard({
            name: name,
            parent: parentLayer,
            frame: {
                x: x,
                y: y,
                width: width,
                height: height,
            },
        });
        return artboard;
    }
};
