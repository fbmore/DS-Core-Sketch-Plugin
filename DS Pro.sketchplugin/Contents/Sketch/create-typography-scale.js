@import "functions.js"

var onRun = function(context) {
    var sketch = require("sketch");
    var ui = require("sketch/ui");
    var sketchversion = sketch.version.sketch;

    var Group = require("sketch/dom").Group;
    var Text = require("sketch/dom").Text;
    var SharedStyle = require("sketch/dom").SharedStyle;
    var HotSpot = require("sketch/dom").HotSpot;
    var Flow = require("sketch/dom").Flow;

    var document = sketch.getSelectedDocument();

    if (document.selectedLayers.length == 0 || document.selectedLayers.length > 1) {
        ui.message("🌈: Please select a Text layer to use as your base font reference. 😅");
    } else {
        var selection = document.selectedLayers.layers[0];
        var currentPage = selection.getParentPage();
        var currentArtboard = selection.getParentArtboard();

        var selectionX = selection.frame.x;
        var selectionY = selection.frame.y;

        if (currentArtboard === undefined) {
            currentArtboard = createArtboard(currentPage, selectionX, selectionY, selection.frame.width, selection.frame.height, "Typography");
        }

        var baseFontSize = selection.style.fontSize;
        var baseTextColor = selection.style.textColor;
        var baseLineHeight = selection.style.lineHeight || selection.style.fontSize + 4;
        var baseKerning = selection.style.kerning;
        var baseParagraphSpacing = selection.style.paragraphSpacing;
        var baseTextTransform = selection.style.textTransform;

        var layerStyles = document.sharedLayerStyles;
        var textStyles = document.sharedTextStyles;

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
        var instructionalTextForInput = "The selected layer will be used as your base font size, lineheight and kerning (character spacing).";

        let typographyScaleVariations = [
            "1.067",
            "1.25",
            "1.125",
            "1.2",
            "1.25",
            "1.333",
            "1.414",
            "1.5",
            "1.6",
            "1.618",
            "1.667",
            "1.778",
            "1.875",
        ];

        let labels = [
            "Minor Second",
            "Major Second",
            "Minor Third",
            "Major Third",
            "Perfect Fourth",
            "Augmented Fourth",
            "Perfect Fifth",
            "Golden Ratio",
        ];

        ui.getInputFromUser(
            "Choose a Typography Scale", {
                description: instructionalTextForInput,
                type: ui.INPUT_TYPE.selection,
                possibleValues: labels,
            },
            (err, value) => {
                if (err) {
                    // most likely the user canceled the input
                    return;
                } else {
                    result = typographyScaleVariations[labels.indexOf(value)];
                }
            }
        );

        if (result) {
            var scaleFactor = result;

            /// EDIT Array to change nomenclacture. Second to last is name for "Body"
            var StylesArray = ["Headline 1", "Headline 2", "Headline 3", "Headline 4", "Headline 5", "paragraph", "small"];

            // var StylesArraySizes = ["48","40","32","24","20","18","12"]
            var StylesArraySizes = [];

            var prevFontSize = baseFontSize * 0.8;

            for (s = 0; s < StylesArray.length; ++s) {
                if (s === 0) {
                    // StylesArraySizes.push(Math.round(prevFontSize));
                    StylesArraySizes.push(roundAndEvenNumber(prevFontSize));
                }
                if (s === 1) {
                    StylesArraySizes.push(baseFontSize);
                } else {
                    if (s !== 0) {
                        StylesArraySizes.push(roundAndEvenNumber(Math.pow(scaleFactor, s) * baseFontSize));
                    }
                }
            }

            StylesArraySizes.reverse();

            var StylesArrayAlignments = ["left", "center", "right"];

            var moveby = StylesArraySizes[0];

            var GeneratedStylesArray = [];

            var create = function create(document, layer, styleName) {
                var sharedStyle = sketch["default"].SharedStyle.fromStyle({
                    //name: layer.name,
                    name: styleName,
                    style: layer.style,
                    document: document,
                });
            };

            // var StylesArrayColors = arrayColorNamesAndValues;

            var scaleSectionHeight = 1000 * scaleFactor;
            // Generate Typography and Styles from selected text layers and docuemnt colors
            let typographyStyleGroups = [];
            let textsGroupWidth = 0;
            let textGroupHeight = 0;
            let newArtboardWidth = 0;
            let newArtboardHeight = 0;
            margin = Math.round(margin * 2 * scaleFactor);

            for (c = 0; c < documentColors.length; ++c) {
                for (a = 0; a < StylesArrayAlignments.length; ++a) {
                    let alignmentGroup = createGroup(currentArtboard, [], "Texts Align " + StylesArrayAlignments[a]);
                    typographyStyleGroups.push(alignmentGroup);
                    textsGroupWidth = 0;
                    textGroupHeight = 0;
                    for (s = 0; s < StylesArray.length; ++s) {
                        let styleName = StylesArray[s] + " - " + StylesArrayAlignments[a];
                        let layerName = StylesArray[s] + "/" + StylesArray[s] + " - " + StylesArrayAlignments[a];
                        // var duplicatedLayer = selection.duplicate();
                        let newFontFamily = selection.style.fontFamily;
                        let newFontSize = StylesArraySizes[s];
                        let newTextAlign = StylesArrayAlignments[a];

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
                            styleName,
                            layerName,
                            0,
                            newFrameY,
                            colorName,
                            newTextAlign,
                            newFontFamily,
                            newFontSize,
                            newLineHeight
                        );
                        // Se the Color Variable
                        if (sketchversion >= 69) {
                            var currentSwatch = newSwatch;
                            let swatchContainer = document.sketchObject.documentData().sharedSwatches();
                            currentSwatch.sketchObject.updateWithColor(MSColor.colorWithHex_alpha(color.slice(1, 6), 1));
                            var myColor = currentSwatch.referencingColor;

                            newText.style.textColor = myColor;
                            // /// Update all the layers using the Swatches/Color Vars
                            swatchContainer = document.sketchObject.documentData().sharedSwatches();
                            swatchContainer.updateReferencesToSwatch(currentSwatch.sketchObject);
                        }
                    }
                    newArtboardWidth += margin + alignmentGroup.frame.width;
                    newArtboardHeight = margin + alignmentGroup.frame.height;
                }
                newArtboardWidth += margin;
                newArtboardHeight += margin;
            }
            currentArtboard.frame.width = newArtboardWidth;
            currentArtboard.frame.height = newArtboardHeight;

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
            }

            selection.remove();

            ui.message("🌈: Yay! Done generating typography scale with " + GeneratedStylesArray.length + " Text layers! 👏 🚀");
        } else {
            ui.message("🌈: See you next when you are ready. 😀");
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

                let newText = new Text({
                    parent: textParent,
                    text: textValue,
                });

                newText.frame.x = textX;
                newText.frame.y = textY;
                newText.style.textColor = textColor;
                newText.style.fontSize = fontSize;
                newText.style.lineHeight = lineHeight;
                newText.style.alignment = textAlign;
                newText.style.fontFamily = textFontFamily;

                newText.name = textName;

                return newText;
            } catch (textNoStyleErr) {
                console.log(textNoStyleErr);
            }
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