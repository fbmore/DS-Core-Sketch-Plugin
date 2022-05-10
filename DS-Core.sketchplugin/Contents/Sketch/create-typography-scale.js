var sketch = require("sketch");
var ui = require("sketch/ui");
var sketchversion = sketch.version.sketch;
var Group = require("sketch/dom").Group;
var Text = require("sketch/dom").Text;
var SharedStyle = require("sketch/dom").SharedStyle;
var HotSpot = require("sketch/dom").HotSpot;
var Flow = require("sketch/dom").Flow;

var document = sketch.getSelectedDocument();
@import "settings.js";
@import "./functions/sketch-functions.js";
@import "./functions/functions.js";


var onRun = function(context) {
    @import "./functions/color-functions.js";

    // Text Styles Management
    var textStyles = document.sharedTextStyles;
    var arrayTextStyleIDs = textStyles.map((sharedstyle) => sharedstyle["id"]);
    var arrayTextStyleNames = textStyles.map((sharedstyle) => sharedstyle["name"]);
    var arrayTextStyleStyles = textStyles.map(
        (sharedstyle) => sharedstyle["style"]
    );
    var textStylesOrdered = [...document.sharedTextStyles].sort(
        (left, right) => left.name > right.name
    );
    var textString = JSON.stringify(textStylesOrdered);

    if (document.selectedLayers.length == 0 || document.selectedLayers.length > 1 || document.selectedLayers.layers[0].type !== "Text") {
        sketch.UI.message("🌈: Please select a Text layer to use as your base font reference. 😅");
    } else {
        var selection = document.selectedLayers.layers[0];
        var originalSelection = selection;
        var currentPage = selection.getParentPage();
        var currentArtboard = selection.getParentArtboard();

        var selectionX = selection.frame.x;
        var selectionY = selection.frame.y;
        if (currentArtboard !== undefined) {
            selectionX = currentArtboard.frame.x;
            selectionY = currentArtboard.frame.y;
        }

        var newArtboardCreated = false;
        if (currentArtboard === undefined) {
            var newArtboardCreated = true;
            currentArtboard = createArtboard(currentPage, selectionX, selectionY, selection.frame.width, selection.frame.height, "Typography");
        }

        // Text management
        var baseFontSize = selection.style.fontSize;
        var baseTextColor = selection.style.textColor;
        var baseLineHeight = selection.style.lineHeight || selection.style.fontSize + 4;
        var baseKerning = selection.style.kerning;
        var baseParagraphSpacing = selection.style.paragraphSpacing;
        var baseTextTransform = selection.style.textTransform;

        var layerStyles = document.sharedLayerStyles;
        var textStyles = document.sharedTextStyles;


        // var lineHeightMultiplier = 1.5;
        var lineHeightMultiplier = baseLineHeight / baseFontSize;

        // Color management
        const documentColors = sketch.getSelectedDocument().colors;

        var color = selection.style.textColor;
        var colorname = selection.name;

        //// Get user input
        var result;
        var instructionalTextForInput = "The selected text layer will be used as your base for"
        instructionalTextForInput += "\nfont family, font size, font-weight, and text color.";
        instructionalTextForInput += "\n\n";
        instructionalTextForInput += "Please select a Scale from the list below:";

        // Plugin interactive window
        ui.getInputFromUser(
            "Choose a Typography Scale", {
                description: instructionalTextForInput,
                type: ui.INPUT_TYPE.selection,
                possibleValues: typographyLabels,
            },
            (err, value) => {
                if (err) {
                    if (newArtboardCreated === true) {
                        currentArtboard.remove()
                    }
                    return;
                } else {
                    result = typographyScaleVariations[typographyLabels.indexOf(value)];
                }
            }
        );

        if (result) {
            let counter = 0;
            let themeName = ""
                // Generate Typography and Styles from selected text layers and docuemnt colors
            let typographyStyleGroups = [];
            let textsGroupWidth = 0;
            let textGroupHeight = 0;
            let newArtboardWidth = 0;
            let newArtboardHeight = 0;
            let groupPosX = 0;
            let internalMargin = 0;
            let colorNameForVariables = colorname;

            // Manage settings and more themes
            if (typographyThemes) {
                // When more themes are in use, we should create as many Artboards as the number of themes
                currentArtboard.remove()

                for (tt = 0; tt < typographyThemesArray.length; tt++) {
                    themeName = typographyThemesArray[tt][0];
                    if (typographyThemesArray[tt][1] === "Inverted") {
                        baseTextColor = invertColor(baseTextColor);
                        colorNameForVariables = colorname + "-light";
                    } else if (typographyThemesArray[tt][1] !== "Default") {
                        // NOTE: this part need work, as we can check for primary/seondary colors etc in Color Variables
                        baseTextColor = "#000000";
                    } else {
                        colorNameForVariables = colorname + "-dark";
                    }

                    // Generate the Themed Artboard
                    currentArtboard = createArtboard(
                        currentPage,
                        selectionX,
                        selectionY,
                        selection.frame.width,
                        selection.frame.height,
                        "Typography - " + themeName
                    );
                    currentArtboard.background.color = invertColor(baseTextColor);
                    currentArtboard.background.enabled = true;
                    currentArtboard.background.includedInExport = false;

                    // Generate the Typography scale
                    createScale(themeName);

                    // Set parameters for the next iteration
                    let currentArtboardWidth = currentArtboard.frame.width;
                    selectionX += currentArtboardWidth + margin * 2;
                    selection = originalSelection;
                    typographyStyleGroups = [];
                    groupPosX = 0
                    textGroupHeight = 0;
                    newArtboardWidth = 0;
                    newArtboardHeight = 0;
                }
            } else {
                createScale();
            }

            function createScale(themeName = "") {
                var scaleFactor = result;

                var StylesArraySizes = [];

                internalMargin = margin * 2;
                for (a = 0; a < typographyStylesArrayAlignments.length; a++) {
                    let newAlign = typographyStylesArrayAlignments[a];
                    let alignmentGroup = createGroup(currentArtboard, [], "Text styles - align " + newAlign);
                    typographyStyleGroups.push(alignmentGroup);
                    textsGroupWidth = 0;
                    textGroupHeight = 0;
                    for (s = 0; s < typographyStylesArray.length; s++) {
                        let scaleMuliplier = typographyStylesArray[s][3]

                        let StyleArraySizeValue = 0
                            // Default size
                        if (typographyStylesArray[s][2] === true) {
                            StyleArraySizeValue = baseFontSize;
                        } else {
                            if (scaleMuliplier >= 1) {
                                StyleArraySizeValue = Math.round(baseFontSize * Math.pow(scaleFactor, typographyStylesArray[s][3]));
                            } else {
                                StyleArraySizeValue = Math.round(baseFontSize / Math.pow(scaleFactor, typographyStylesArray[s][3]));
                            }
                        }

                        let newFolder = typographyStylesArray[s][0];
                        if (themeName !== "") {
                            newFolder += "/" + themeName;
                        }
                        let newName = typographyStylesArray[s][1];
                        let styleName = newFolder + " - " + newAlign;
                        let layerName = newFolder + "/" + newName + " - " + newAlign;

                        let newFontFamily = selection.style.fontFamily;
                        let newFontSize = StyleArraySizeValue;
                        let newTextAlign = newAlign;

                        let newLineHeight = Math.round(newFontSize * lineHeightMultiplier);

                        let colorName = baseTextColor;

                        if (documentColors.length > 0) {
                            colorName = documentColors[c].name || documentColors[c].color;
                        }

                        let newFrameY = 0;

                        if (s > 0) {
                            newFrameY += textGroupHeight + internalMargin * s; // * Math.round(scaleFactor / 100) * 100;
                        }
                        textGroupHeight += newLineHeight;

                        // Create the Text Layer
                        let newText = createTextNoStyle(
                            alignmentGroup,
                            layerName,
                            styleName,
                            0,
                            newFrameY,
                            colorName,
                            newTextAlign,
                            newFontFamily,
                            newFontSize,
                            newLineHeight
                        );

                        counter++;

                        // Create a new color variable if it doesn't exist
                        console.log(colorNameForVariables)
                        createColorVariable(colorNameForVariables, baseTextColor);

                        // Set the Color Variable
                        if (sketchversion >= 69) {
                            var currentSwatch = matchingSwatchForColor(colorName);

                            var myColor = currentSwatch.referencingColor;

                            newText.style.textColor = myColor;
                            // /// Update all the layers using the Swatches/Color Vars
                            swatchContainer = document.sketchObject.documentData().sharedSwatches();
                            swatchContainer.updateReferencesToSwatch(currentSwatch.sketchObject);
                        }

                        // Create (if needed) and Apply text styles
                        createNewTextStyle(newText, layerName, true, false, arrayTextStyleNames, textStyles);
                    }


                    newArtboardWidth += internalMargin + alignmentGroup.frame.width;
                    newArtboardHeight = internalMargin + alignmentGroup.frame.height;
                }

                // Handle the Group and Layer re-position inside the Artboard
                groupPosX = 0;
                for (i = 0; i < typographyStyleGroups.length; i++) {
                    typographyStyleGroups[i].frame.x = groupPosX + internalMargin * (i + 1);
                    typographyStyleGroups[i].frame.y = Math.round(typographyStyleGroups[i].frame.y) + internalMargin;
                    groupPosX += Math.round(typographyStyleGroups[i].frame.width);

                    // align center
                    if (i === 1) {
                        typographyStyleGroups[i].layers.forEach((layer) => {
                            layer.frame.x = Math.round((typographyStyleGroups[i].frame.width - layer.frame.width) / 2);
                        });
                    }
                    // align right
                    if (i === 2) {
                        typographyStyleGroups[i].layers.forEach((layer) => {
                            layer.frame.x = Math.round(typographyStyleGroups[i].frame.width - layer.frame.width);
                        });
                    }

                    // Adjust group sizes to their contents and position the last group correctly
                    typographyStyleGroups[i].adjustToFit();
                    typographyStyleGroups[2].frame.x = (typographyStyleGroups[1].frame.x + typographyStyleGroups[1].frame.width) + (typographyStyleGroups[1].frame.x - (typographyStyleGroups[0].frame.x + typographyStyleGroups[0].frame.width))

                    // Invert the order in the Layer list
                    document.selectedLayers = [];
                    let layersInGroup = typographyStyleGroups[i].layers;
                    for (lg = 0; lg < layersInGroup.length; lg++) {
                        layersInGroup[lg].selected = true;
                    }
                    reverseSelectedLayers(document.selectedLayers);
                    document.selectedLayers = [];
                }

                // Size Typography Artboard
                newArtboardWidth = typographyStyleGroups[2].frame.x + typographyStyleGroups[2].frame.width + internalMargin;
                newArtboardHeight += internalMargin;

                currentArtboard.frame.width = newArtboardWidth;
                currentArtboard.frame.height = newArtboardHeight;

                selection.remove();

                ui.message("🌈: Yay! Done generating typography scale with " + counter + " text styles! 👏 🚀");
            }
        } else {
            ui.message("🌈: Please select a Text layer to use as your base font reference. 😅");
        }
    }
}