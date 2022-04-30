var onRun = function(context) {

  var sketch = require('sketch')
  var ui = require('sketch/ui')

  var	document = sketch.getSelectedDocument();


  var data = document.sketchObject.documentData();
  var page = document.selectedPage;

  if (document.selectedLayers.length == 0) {
    ui.message("🌈: Please select a Text layer to use as your base font reference. 😅");
  }

  var selection = document.selectedLayers.layers[0];

  var selectionX = selection.frame.x
  var selectionY = selection.frame.y

  var baseFontSize = selection.style.fontSize;
  var baseTextColor = selection.style.textColor;
  var baseLineHeight = selection.style.lineHeight || (selection.style.fontSize + 4);
  var baseKerning = selection.style.kerning;
  var baseParagraphSpacing = selection.style.paragraphSpacing;
  var baseTextTransform = selection.style.textTransform;

  var tempColorsArray = [];

  tempColorsArray.push(baseTextColor)

  var documentColors = sketch.getSelectedDocument().colors;
  var arrayColorNamesAndValues = []


  console.log(arrayColorNamesAndValues)

  console.log(sketch.getSelectedDocument().colors)



  var layerStyles = document.sharedLayerStyles;
  var textStyles = document.sharedTextStyles;

  var margin = 0;
  var moveby = 0;
  // var lineHeightMultiplier = 1.5;
  var lineHeightMultiplier = baseLineHeight/baseFontSize;

  // Doc colors to array
  console.log(documentColors)


  /// map all documentColors IDs


  if (sketch.getSelectedDocument().colors.length == 0){

    console.log("no colors, adding current")

    if (selection.type === "Text"){
      var color = selection.style.textColor;
      // var colorname = "#"+selection.name;
      var colorname = selection.name;
    }
    documentColors.push({type: 'ColorAsset', name: colorname, color: color});


  }


  if (sketch.getSelectedDocument().colors){
    arrayColorNamesAndValues = documentColors.map(ColorAsset => [ColorAsset["name"], ColorAsset["color"]]);
    console.log(arrayColorNamesAndValues)

    arrayColorNamesAndValues.sort(sortFunction);

    function sortFunction(a, b) {
      if (a[0] === b[0]) {
        return 0;
      }
      else {
        return (a[0] < b[0]) ? -1 : 1;
      }
    }

    console.log("Alpha sorted")
    console.log(arrayColorNamesAndValues)
    ////
  }

  //// Get user input
  var result; //= [] + [doc askForUserInput:instructionalTextForInput initialValue:""];
  var instructionalTextForInput = "The selected layer will be used as your base font size, lineheight and kerning (character spacing)."

  ui.getInputFromUser(
    "Choose a Typography Scale",
    {
      description: instructionalTextForInput,
      type: ui.INPUT_TYPE.selection,
      possibleValues: ["1.25","1.125","1.2","1.25","1.333","1.414","1.5","1.6","1.618","1.667","1.778","1.875"],
    },
    (err, value) => {
      if (err) {
        // most likely the user canceled the input
        return
      } else {
        console.log(value)
        result = value;
      }
    }
  )

  if (result) {



    // var scaleFactor = 1.25;
    var scaleFactor = result;

    /// EDIT Array to change nomenclacture. Second to last is name for "Body"
    var StylesArray = ["Headline 1","Headline 2","Headline 3","Headline 4","Headline 5","paragraph","small"]


    // var StylesArraySizes = ["48","40","32","24","20","18","12"]
    var StylesArraySizes = []

    var prevFontSize = baseFontSize * 0.8;

    for (s = 0; s < StylesArray.length; ++s){
      if (s === 0) {
        // StylesArraySizes.push(Math.round(prevFontSize));
        // Round & Even
        StylesArraySizes.push(roundAndEvenNumber(prevFontSize));
      }
      if (s === 1) {
        StylesArraySizes.push(baseFontSize);
      } else {
        if (s !== 0) {
          StylesArraySizes.push(roundAndEvenNumber((Math.pow(scaleFactor, s) * baseFontSize)));
        }
      }
    }

    StylesArraySizes.reverse()

    console.log("StylesArraySizes")
    console.log(StylesArraySizes)



    var StylesArrayAlignments = ["left","center","right"]
    // var StylesArrayColors = ["#000000FF","#FFFFFFFF"]
    var StylesArrayColors = []

    var moveby = StylesArraySizes[0];

    var GeneratedStylesArray = [];

    var create = function create(document, layer, stylename) {
      var sharedStyle = sketch["default"].SharedStyle.fromStyle({
        //name: layer.name,
        name: stylename,
        style: layer.style,
        document: document
      });
    }


    // var StylesArrayColors = arrayColorNamesAndValues;
    var stylename = "";
    var layername = "";

    var scaleSectionHeight = 1000 * scaleFactor;
    // Generate Typography and Styles from selected text layers and docuemnt colors
    for (c = 0; c < documentColors.length; ++c){


      for (a = 0; a < StylesArrayAlignments.length; ++a){

        for (s = 0; s < StylesArray.length; ++s){

          var duplicatedLayer = selection.duplicate()

          duplicatedLayer.frame.x = 720 * scaleFactor * a + selectionX;
          duplicatedLayer.style.fontSize = StylesArraySizes[s];

          console.log("StylesArraySizes[s]")
          console.log(StylesArraySizes[s])

          // duplicatedLayer.style.textColor = documentColors[c].color;
          duplicatedLayer.style.lineHeight = roundToClosestGridModuleNumber(duplicatedLayer.style.fontSize * lineHeightMultiplier);
          duplicatedLayer.style.alignment = StylesArrayAlignments[a];
          duplicatedLayer.frame.height = duplicatedLayer.style.lineHeight;

          duplicatedLayer.frame.y = (selection.frame.y + moveby * s * 2 + margin) + (scaleSectionHeight * c);

          duplicatedLayer.frame.width = 400;

          layername = StylesArray[s] + " - " + StylesArrayAlignments[a];
          var colorname = documentColors[c].name || documentColors[c].color
          stylename = StylesArray[s] +"/"+StylesArray[s] +  " - " + StylesArrayAlignments[a];

          duplicatedLayer.text = layername;

          duplicatedLayer.name = stylename;

          duplicatedLayer.adjustToFit();

          console.log(s)

          GeneratedStylesArray.push(duplicatedLayer);


        }

      }
    }

    selection.remove();

    ui.message("🌈: Yay! Done generating typography scale with " + GeneratedStylesArray.length + " Text layers! 👏 🚀");

  } else {
    ui.message("🌈: See you next when you are ready. 😀");
  }

};

function roundAndEvenNumber(value){
  return 2 * Math.round(value / 2);
}

function roundToClosestGridModuleNumber(value){
  /// Assumes common 8 pixel grid
  return Math.round(value / 8) * 8
}
