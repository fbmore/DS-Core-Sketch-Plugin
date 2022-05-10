// **********************************************************
// General settings for all the scripts
// import via @import(@import "settings.js") at the very
// beginning of your script
// **********************************************************

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

function createTextNoStyle(
    parentLayer,
    name,
    value,
    x,
    y,
    color,
    align,
    fontFamily,
    fontSize,
    lineHeight
) {
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

function createNewTextStyle(
    item,
    styleName,
    apply = false,
    variants = false,
    availableNames = [],
    textStyles = []
) {
    // let document = sketch.getSelectedDocument();
    let arrayTextStyleNames = availableNames;
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

function reverseSelectedLayers(selectedLayers) {
    var indexArray = new Array();
    selectedLayers.forEach((nativeLayer) => {
        var layer = sketch.fromNative(nativeLayer);
        indexArray.push(layer.index);
    });

    for (var i = 1; i < indexArray.length; i++) {
        if (indexArray[i] !== indexArray[i - 1] + 1) {
            const message = "Please select consecutive layers 🙅🏻";
            sketch.UI.message(message);
            throw new Error(message);
        }
    }

    selectedLayers.forEach((nativeLayer) => {
        var layer = sketch.fromNative(nativeLayer);
        layer.index = indexArray.pop();
    });
}