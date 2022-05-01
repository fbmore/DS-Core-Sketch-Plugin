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