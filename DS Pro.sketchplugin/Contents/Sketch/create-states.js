var onRun = function(context) {
var sketch = require('sketch');
var sketchDom = require('sketch/dom')
var ui = require('sketch/ui');
var document = sketch.getSelectedDocument();

console.log("start")

var divider = "--";
// var tokenPrefix = "$";
var tokenPrefix = "";

var spaceX = 600
var spaceY = 200

// var symboldStates = ["--default","--hover", "--pressed","--tab","--disabled" ]
var states = ["Default, Hover, Active, Disabled","default, hover, active, disabled","Default, Hover, Active, Disabled, TAB","default, hover, active, disabled, tab","Checked, Unchecked, Disabled","checked, unchecked, disabled","Medium, Small, XSmall, Large, XLarge","md, sm, xs, lg, xl","Primary, Secondary, Tertiary, Success, Danger, Warning, Info, Link","primary, secondary, tertiary, success, danger, warning, info, link","Light, Dark","light, dark","Mobile, Tablet, Desktop","mobile, tablet, desktop"]

////// Size
// Default
// Small
// Medium
// Large
// XLarge

////// Checkboxes
// Checked
// Unchecked
// Disabled

//var styleStates = ["--default","--hover", "--pressed","--tab","--disabled" ]

////// Buttons
// Default
// Hover
// Active
// Disabled
// TAB

////// Checkboxes
// Checked
// Unchecked
// Disabled

///// Variants
// N/A
// Text
// TextSingleLine
// TextMultiLine
// TextIcon
// Numeric
// Icon
// Badge
// Labeled
// Unlabeled
// Title
// Search
// Navigation

////// Size
// N/A
// Default
// Small
// Medium
// Large
// XLarge

// Alignment
// N/A
// Left
// Center
// Right


// var states = symboldStates;
// var statesPrettified = states.split(",").join(", ");
// var states = symboldStates;

////
var result;

var instructionalTextForInput = "Choose a naming pattern you'd like to use. The name of the selected layers will be used as starting point.\n\nThe divider '" + divider +"' will be added before each value."

ui.getInputFromUser(
  "Generate States, Types and Sizes",
  {
    description: instructionalTextForInput,
    type: ui.INPUT_TYPE.selection,
    possibleValues: states,
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

states = result.split(",")


////

// //var states = [" --default"," --hover"," --active"," --pressed" ]
// //var states = ["--Hover","--Focus","--Selected","--Activated","--Pressed","--Disabled" ]
//
var elements = document.selectedLayers.layers;


for (e = 0; e < elements.length; ++e) {
  console.log("+")

  var symbol = elements[e];

  var originalName = symbol.name
  var sizeOrType = states[0].toLowerCase()

  if (sizeOrType == "primary" || sizeOrType == "medium" || sizeOrType == "md" || sizeOrType == "mobile"){
    divider = " - "
  }

  symbol.name = originalName + divider + states[0].trim();

  if (symbol.type === "Text" || symbol.type === "ShapePath") {
    symbol.name = originalName + " / " + tokenPrefix + originalName + divider + states[0].trim().toLowerCase().replace(/\s+/g, '')
  }

  for (s = 1; s < states.length; ++s) {

    var newState = symbol.duplicate()

    if (sizeOrType == "primary" || sizeOrType == "medium" || sizeOrType == "md" || sizeOrType == "mobile"){
      newState.frame.x = symbol.frame.x;
      newState.frame.y = symbol.frame.y + spaceY * s;
      // changing divider for type, variants or sizes
      divider = " - "
    } else {
      newState.frame.x = symbol.frame.x + spaceX * s;
      newState.frame.y = symbol.frame.y;
    }


    newState.name = originalName + divider + states[s].trim();

    if (symbol.type === "Text" || symbol.type === "ShapePath") {
      newState.name = originalName + " / " + tokenPrefix + originalName + divider + states[s].trim().toLowerCase().replace(/\s+/g, '')
    }


    newState.index = symbol.index - s + 1

  }
}

console.log("done")

};
