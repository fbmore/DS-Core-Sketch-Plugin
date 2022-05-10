// **********************************************************
// General settings for all the scripts
// import via @import(@import "settings.js") at the very
// beginning of your script
// **********************************************************

function nameList(array = []) {
    let checkArray = [];
    if (array.length > 0) {
        for (i = 0; i < array.length; i++) {
            let name = array[i];
            let group = false;
            let options = [
                " 50",
                " 100",
                " 200",
                " 300",
                " 400",
                " 500",
                " 600",
                " 700",
                " 800",
                " 900",
            ];

            // Automatically remove the scale values generated with the create color scale script
            for (j = 0; j < options.length; j++) {
                let currentScaleValue = options[j];
                if (isExactMatch(name, currentScaleValue)) {
                    name = name.replace(currentScaleValue, "");
                    group = true;
                }
            }
            // Add names to the folder list
            let isNew = true;
            if (checkArray.length > 0) {
                for (n = 0; n < checkArray.length; n++) {
                    if (checkArray[n][0] === name) {
                        isNew = false;
                        break;
                    }
                }
            }
            if (isNew) {
                checkArray.push([name, group]);
            }
        }
    } else {
        checkArray.push([array[0], false]);
    }
    return checkArray;
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

function deepCompare() {
    var i, l, leftChain, rightChain;

    function compare2Objects(x, y) {
        var p;

        // remember that NaN === NaN returns false
        // and isNaN(undefined) returns true
        if (
            isNaN(x) &&
            isNaN(y) &&
            typeof x === "number" &&
            typeof y === "number"
        ) {
            return true;
        }

        // Compare primitives and functions.
        // Check if both arguments link to the same object.
        // Especially useful on the step where we compare prototypes
        if (x === y) {
            return true;
        }

        // Works in case when functions are created in constructor.
        // Comparing dates is a common scenario. Another built-ins?
        // We can even handle functions passed across iframes
        if (
            (typeof x === "function" && typeof y === "function") ||
            (x instanceof Date && y instanceof Date) ||
            (x instanceof RegExp && y instanceof RegExp) ||
            (x instanceof String && y instanceof String) ||
            (x instanceof Number && y instanceof Number)
        ) {
            return x.toString() === y.toString();
        }

        // At last checking prototypes as good as we can
        if (!(x instanceof Object && y instanceof Object)) {
            return false;
        }

        if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {
            return false;
        }

        if (x.constructor !== y.constructor) {
            return false;
        }

        if (x.prototype !== y.prototype) {
            return false;
        }

        // Check for infinitive linking loops
        if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1) {
            return false;
        }

        // Quick checking of one object being a subset of another.
        // todo: cache the structure of arguments[0] for performance
        for (p in y) {
            if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
                return false;
            } else if (typeof y[p] !== typeof x[p]) {
                return false;
            }
        }

        for (p in x) {
            if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
                return false;
            } else if (typeof y[p] !== typeof x[p]) {
                return false;
            }

            switch (typeof x[p]) {
                case "object":
                case "function":
                    leftChain.push(x);
                    rightChain.push(y);

                    if (!compare2Objects(x[p], y[p])) {
                        return false;
                    }

                    leftChain.pop();
                    rightChain.pop();
                    break;

                default:
                    if (x[p] !== y[p]) {
                        return false;
                    }
                    break;
            }
        }

        return true;
    }

    if (arguments.length < 1) {
        return true; //Die silently? Don't know how to handle such case, please help...
        // throw "Need two or more arguments to compare";
    }

    for (i = 1, l = arguments.length; i < l; i++) {
        leftChain = []; //Todo: this can be cached
        rightChain = [];

        if (!compare2Objects(arguments[0], arguments[i])) {
            return false;
        }
    }

    return true;
}