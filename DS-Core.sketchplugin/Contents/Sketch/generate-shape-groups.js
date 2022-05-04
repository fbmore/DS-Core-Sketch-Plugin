var onRun = function(context) {
    let sketch = require("sketch");

    let document = sketch.getSelectedDocument();
    let selectedLayers = document.selectedLayers.layers;
    // var selection = document.selectedLayers.layers[0];
    for (ng = 0; ng < selectedLayers.length; ng++) {
        let groupLayer = selectedLayers[ng];
        if (groupLayer.type === "Group") {
            groupLayer.type = "Shape";
            // let groupLayers = groupLayer.layers;
            var parentArtboard = groupLayer.getParentArtboard();
            let newName = parentArtboard.name;
            // groupLayer.layers = groupLayer.layers.concat(new sketch.Shape());

            console.log(groupLayer);
            // if (layer.type === "Shape") {
            //     let innerLayers = layer.layers;
            //     for (i = 0; i < innerLayers.length; i++) {
            //         let innerLayer = innerLayers[i];
            //         console.log(innerLayer);
            //         innerLayer.sketchObject.booleanOperation = -1;
            //     }
            // }
        }
    }
};