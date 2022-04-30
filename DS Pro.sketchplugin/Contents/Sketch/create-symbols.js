var onRun = function(context) {
  var sketch = require('sketch')
  var document = sketch.getSelectedDocument();
  var ui = require('sketch/ui')
  var doc = context.document;
  var selectedLayers = document.selectedLayers;
  var selectedCount = selectedLayers.length;
  var selection = context.selection;
  var selections = selection.objectEnumerator();
  var count = 0;

  var Rectangle = require('sketch/dom').Rectangle
  var ShapePath = require('sketch/dom').ShapePath


  console.log(selection.length)
  //Loop over the selected layers/groups and add them to the symbols page skipping the options
  // FIX turning an Artboard into a Symbol

  var currentSelectionIndex = 0

  while (s = selections.nextObject()) {

    console.log(s)
    if (s.class() != "MSArtboardGroup") {
      var symbols = MSLayerArray.arrayWithLayers([s]);
      var symbolName = s.name();
      console.log(symbolName)
      console.log(s)

      // var layers = document.getLayersNamed(symbolName)
      var layers = sketch.find('SymbolMaster, [name="'+symbolName+'"]')

      // find all the Shape named "Layer-Name"
      //sketch.find('Shape, [name="'+symbolName'"]')

      if (layers.length) {
        // do something
        console.log("count: "+layers.length)
        console.log(symbolName + " already exists")

        selectedLayers.layers[currentSelectionIndex].parent = layers[0].layers[0].parent
        selectedLayers.layers[currentSelectionIndex].frame.x = 0
        selectedLayers.layers[currentSelectionIndex].frame.y = 0

        layers[0].layers[0].remove()
        layers[0].adjustToFit()
        // rectangle.parent = layers[0]
        console.log(layers[0])
      } else {
        var createSymbol = MSSymbolCreator.createSymbolFromLayers_withName_onSymbolsPage(symbols, symbolName, true);
        var simplifiedNameArray = symbolName.split("/");
        var simplifiedName = simplifiedNameArray[simplifiedNameArray.length - 1]
        createSymbol.name = simplifiedName;
        console.log(selection.length)
      }

      //  console.log(symbolName)


      count = count + 1;
    } else {
      var symbols = MSLayerArray.arrayWithLayers([s]);
      var symbolName = s.name();
      var createSymbol = MSSymbolCreator.createSymbolFromLayers_withName_onSymbolsPage(symbols, symbolName, true);
      var simplifiedNameArray = symbolName.split("/");
      var simplifiedName = simplifiedNameArray[simplifiedNameArray.length - 1]
      createSymbol.name = simplifiedName;
      // createSymbol.layers[
      console.log("createSymbol")
      console.log(createSymbol.symbolID())
      var masterSymbolFromInstance = document.getSymbolMasterWithID(createSymbol.symbolID());
      // var masterSymbolFromInstance = document.getSymbolMasterWithID(Layer.symbolId);
      console.log(masterSymbolFromInstance.name);

      masterSymbolFromInstance.layers[0].sketchObject.ungroup()

      count = count + 1;
    }

currentSelectionIndex = currentSelectionIndex + 1
  }

  ui.message("🌈: Done creating (or updating) " + count + " symbols! 👏 🚀");


};
