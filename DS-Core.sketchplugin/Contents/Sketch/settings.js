// **********************************************************
// General settings for all the scripts
// import via @import(@import "settings.js") at the very
// beginning of your script
// **********************************************************

// Margins
var margin = 24;
var moveby = 0;
var padding = 8;

// Typography
// Scale Variations
// 1. Available scales multipliers
var typographyScaleVariations = ["1.067", "1.125", "1.2", "1.25", "1.333", "1.414", "1.5", "1.618"];
// 2. UI Labels for selection
var typographyLabels = [
    "1.067 - Minor Second",
    "1.125 - Major Second",
    "1.200 - Minor Third",
    "1.250 - Major Third",
    "1.333 - Perfect Fourth",
    "1.414 - Augmented Fourth",
    "1.500 - Perfect Fifth",
    "1.618 - Golden Ratio",
];
// 3. Style names and multiplier factors
// Array oranization:
//   0 = Folder Name
//   1 = Style Name
//   2 = Default font size (no multiplier in use)
//   3 = Scale factor multiplier
var typographyStylesArray = [
    ["Headline 1", "H1", false, 5],
    ["Headline 2", "H2", false, 4],
    ["Headline 3", "H3", false, 3],
    ["Headline 4", "H4", false, 2],
    ["Headline 5", "H5", false, 1],
    ["Paragraph", "Paragraph", true, 1],
    ["Small", "Small", false, 0.75],
    ["Button", "Button", true, 1],
];
// 4. Styles alignments
var typographyStylesArrayAlignments = ["left", "center", "right"];
// 5. Themes
var typographyThemes = true;
var typographyThemesArray = [
    ["Dark", "Default"],
    ["Light", "Inverted"],
];

// Colors
// Scale options
// 1. Available scales multipliers
var colorVariations = [
    "900,800,700,600,500,400,300,200,100,50",
    "800,700,600,500,400,300,200,100",
    "900,700,500,300,100",
    "900,700,500,300",
    "700,500,300",
];

// 2. UI Labels for selection
var labels = ["10 Steps", "8 Steps", "5 Steps", "4 Steps", "3 Steps"];