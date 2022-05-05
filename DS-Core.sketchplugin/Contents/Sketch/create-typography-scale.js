var sketch = require("sketch");
var ui = require("sketch/ui");
var sketchversion = sketch.version.sketch;
var Group = require("sketch/dom").Group;
var Text = require("sketch/dom").Text;
var SharedStyle = require("sketch/dom").SharedStyle;
var HotSpot = require("sketch/dom").HotSpot;
var Flow = require("sketch/dom").Flow;

var document = sketch.getSelectedDocument();
@import "functions.js"

var onRun = function(context) {
    @import "color-functions.js";

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
        var currentPage = selection.getParentPage();
        var currentArtboard = selection.getParentArtboard();

        var selectionX = selection.frame.x;
        var selectionY = selection.frame.y;

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

        // Default margins
        var margin = 24;
        var moveby = 0;
        // var lineHeightMultiplier = 1.5;
        var lineHeightMultiplier = baseLineHeight / baseFontSize;

        // Color management
        const documentColors = sketch.getSelectedDocument().colors;

        var arrayColorAssetsNames = documentColors.map((ColorAsset) => ColorAsset["name"]);

        if (sketchversion >= 69) {
            var arrayColorVarNames = document.swatches.map((Swatch) => Swatch["name"]);
        }
        var color = selection.style.textColor;
        var colorname = selection.name;

        // Generate the Color Variable, if not existent
        if (sketchversion >= 69) {
            const Swatch = sketch.Swatch;
            var newSwatch = Swatch.from({ name: colorname, color: color });

            if (arrayColorVarNames.indexOf(colorname) === -1) {
                document.swatches.push(newSwatch);
            } else {}

        } else {
            if (arrayColorAssetsNames.indexOf(colorname) === -1) {
                documentColors.push({ type: "ColorAsset", name: colorname, color: color });
            } else {}
        }
        //// Get user input
        var result; //= [] + [doc askForUserInput:instructionalTextForInput initialValue:""];
        var instructionalTextForInput = "The selected text layer will be used as your base for"
        instructionalTextForInput += "\nfont family, font size, font-weight, and text color.";
        instructionalTextForInput += "\n\n";
        instructionalTextForInput += "Please select a Scale from the list below:";

        let typographyScaleVariations = [
            "1.067",
            "1.125",
            "1.2",
            "1.25",
            "1.333",
            "1.414",
            "1.5",
            "1.618",
        ];

        let labels = [
            "1.067 - Minor Second",
            "1.125 - Major Second",
            "1.200 - Minor Third",
            "1.250 - Major Third",
            "1.333 - Perfect Fourth",
            "1.414 - Augmented Fourth",
            "1.500 - Perfect Fifth",
            "1.618 - Golden Ratio",
        ];

        // Plugin interactive window
        ui.getInputFromUser(
            "Choose a Typography Scale", {
                description: instructionalTextForInput,
                type: ui.INPUT_TYPE.selection,
                possibleValues: labels,
            },
            (err, value) => {
                if (err) {
                    if (newArtboardCreated === true) {
                        currentArtboard.remove()
                    }
                    return;
                } else {
                    result = typographyScaleVariations[labels.indexOf(value)];
                }
            }
        );

        if (result) {
            var scaleFactor = result;

            // Styles management
            // Array oranization:
            // 0 = Folder Name
            // 1 = Style Name
            // 2 = Default font size (no multiplier in use)
            // 3 = Scale factor multiplier
            var StylesArray = [
                ["Headline 1", "H1", false, 5],
                ["Headline 2", "H2", false, 4],
                ["Headline 3", "H3", false, 3],
                ["Headline 4", "H4", false, 2],
                ["Headline 5", "H5", false, 1],
                ["Paragraph", "Paragraph", true, 1],
                ["Small", "Small", false, 0.75],
                ["Label", "Label", true, 1]
            ];
            var StylesArraySizes = [];

            for (s = 0; s < StylesArray.length; s++) {

            }

            var StylesArrayAlignments = ["left", "center", "right"];

            var counter = 0

            // Generate Typography and Styles from selected text layers and docuemnt colors
            let typographyStyleGroups = [];
            let textsGroupWidth = 0;
            let textGroupHeight = 0;
            let newArtboardWidth = 0;
            let newArtboardHeight = 0;
            // margin = Math.round(margin * 2 * scaleFactor);
            margin = margin * 2;

            for (a = 0; a < StylesArrayAlignments.length; ++a) {
                let newAlign = StylesArrayAlignments[a];
                let alignmentGroup = createGroup(currentArtboard, [], "Text styles - align " + newAlign);
                typographyStyleGroups.push(alignmentGroup);
                textsGroupWidth = 0;
                textGroupHeight = 0;
                for (s = 0; s < StylesArray.length; ++s) {
                    let scaleMuliplier = StylesArray[s][3]

                    let StyleArraySizeValue = 0
                        // Default size
                    if (StylesArray[s][2] === true) {
                        StyleArraySizeValue = baseFontSize;
                    } else {
                        if (scaleMuliplier >= 1) {
                            StyleArraySizeValue = Math.round(baseFontSize * Math.pow(scaleFactor, StylesArray[s][3]));
                        } else {
                            StyleArraySizeValue = Math.round(baseFontSize / Math.pow(scaleFactor, StylesArray[s][3]));
                        }
                    }
                    // console.log("Style: " + StylesArray[s][0] + " - Multiplier: " + scaleMuliplier + " - Value: " + StyleArraySizeValue)
                    let newFolder = StylesArray[s][0];
                    let newName = StylesArray[s][1];
                    let styleName = newFolder + " - " + newAlign;
                    let layerName = newFolder + "/" + newName + " - " + newAlign;

                    let newFontFamily = selection.style.fontFamily;
                    let newFontSize = StyleArraySizeValue;
                    let newTextAlign = newAlign;

                    let newLineHeight = Math.round(newFontSize * lineHeightMultiplier);

                    let colorName = selection.style.textColor;

                    if (documentColors.length > 0) {
                        colorName = documentColors[c].name || documentColors[c].color;
                    }

                    let newFrameY = 0;

                    if (s > 0) {
                        newFrameY += textGroupHeight + margin * s; // * Math.round(scaleFactor / 100) * 100;
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

                    // Se the Color Variable
                    if (sketchversion >= 69) {
                        var currentSwatch = matchingSwatchForColor(colorName);

                        var myColor = currentSwatch.referencingColor;

                        newText.style.textColor = myColor;
                        // /// Update all the layers using the Swatches/Color Vars
                        swatchContainer = document.sketchObject.documentData().sharedSwatches();
                        swatchContainer.updateReferencesToSwatch(currentSwatch.sketchObject);
                    }

                    // Create (if needed) and Apply text styles
                    createNewTextStyle(newText, layerName, true, false);
                }


                newArtboardWidth += margin + alignmentGroup.frame.width;
                newArtboardHeight = margin + alignmentGroup.frame.height;
            }

            // Handle the Group and Layer re-position inside the Artboard
            let groupPosX = 0;
            for (i = 0; i < typographyStyleGroups.length; i++) {
                typographyStyleGroups[i].frame.x = groupPosX + margin * (i + 1);
                typographyStyleGroups[i].frame.y = Math.round(typographyStyleGroups[i].frame.y) + margin;
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
            }

            // Size Typography Artboard
            newArtboardWidth = typographyStyleGroups[2].frame.x + typographyStyleGroups[2].frame.width + margin;
            newArtboardHeight += margin;

            currentArtboard.frame.width = newArtboardWidth;
            currentArtboard.frame.height = newArtboardHeight;



            selection.remove();

            ui.message("🌈: Yay! Done generating typography scale with " + counter + " text styles! 👏 🚀");
        } else {
            ui.message("🌈: Please select a Text layer to use as your base font reference. 😅");
        }

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

        function createGroup(parentLayer, children, name, x = 0, y = 0) {
            try {
                let Group = sketch.Group;
                let newGroup = new Group({
                    parent: parentLayer,
                    layers: children,
                    name: name,
                    frame: {
                        x: x,
                        y: y,
                    },
                });

                return newGroup;
            } catch (errGroup) {
                console.log(errGroup);
            }
        }

        function createTextNoStyle(parentLayer, name, value, x, y, color, align, fontFamily, fontSize, lineHeight) {
            try {
                let textX = x;
                let textY = y;
                let textParent = parentLayer;
                let textColor = color;
                let textFontFamily = fontFamily;
                let textValue = value;
                let textName = name;
                let textAlign = align;
                let textSize = fontSize;


                let newText = new Text({
                    parent: textParent,
                    text: textValue,
                });

                newText.frame.x = textX;
                newText.frame.y = textY;
                newText.style.textColor = textColor;
                newText.style.fontSize = textSize;
                newText.style.lineHeight = lineHeight;
                newText.style.alignment = textAlign;
                newText.style.fontFamily = textFontFamily;

                newText.name = textName;

                return newText;
            } catch (textNoStyleErr) {
                console.log(textNoStyleErr);
            }
        }

        function createNewTextStyle(item, styleName, apply = false, variants = false) {
            // let document = sketch.getSelectedDocument();
            try {
                if (arrayTextStyleNames.indexOf(styleName) === -1) {
                    let sharedStyle = textStyles.push({
                        name: styleName,
                        style: item.style,
                        document: document,
                    });
                    updateTextStyles();
                    if (apply === true) {
                        let newTextStyleID = getTextStyleIDFromName(styleName);
                        let localIndex = arrayTextStyleIDs.indexOf(newTextStyleID);
                        item.sharedStyleId = newTextStyleID;
                        item.style = textStyles[localIndex].style;
                    }
                    if (variants === true && states.length > 0) {
                        styleName = styleName.replace(states[0], "");
                        for (let vIndex = 1; vIndex < states.length; vIndex++) {
                            styleName =
                                styleName.replace(states[vIndex - 1], "") +
                                states[vIndex];
                            sharedStyle = textStyles.push({
                                name: styleName,
                                style: item.style,
                                document: document,
                            });
                        }
                    }
                } else {
                    if (apply === true) {
                        let newTextStyleID = getTextStyleIDFromName(styleName);
                        let localIndex = arrayTextStyleIDs.indexOf(newTextStyleID);
                        item.sharedStyleId = newTextStyleID;
                        item.style = textStyles[localIndex].style;
                    }
                }
            } catch (createTextStyleErr) {
                console.log(createTextStyleErr);
            }
        }

        function updateTextStyles() {
            let textStyles = document.sharedTextStyles;
            arrayTextStyleIDs = textStyles.map((sharedstyle) => sharedstyle["id"]);
            arrayTextStyleNames = textStyles.map((sharedstyle) => sharedstyle["name"]);
            arrayTextStyleStyles = textStyles.map(
                (sharedstyle) => sharedstyle["style"]
            );
        }

        function getTextStyleIDFromName(name) {
            let styleID = "";
            for (let i = 0; i < arrayTextStyleIDs.length; i++) {
                if (arrayTextStyleNames[i] === name) {
                    styleID = arrayTextStyleIDs[i];
                }
            }
            return styleID;
        }
    }


};

function sortFunction(a, b) {
    if (a[0] === b[0]) {
        return 0;
    } else {
        return a[0] < b[0] ? -1 : 1;
    }
}

function roundAndEvenNumber(value) {
    return 2 * Math.round(value / 2);
}

function roundToClosestGridModuleNumber(value) {
    /// Assumes common 8 pixel grid
    return Math.round(value / 8) * 8;
}