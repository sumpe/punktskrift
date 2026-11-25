// Punktskrift Press: one braille table per language, uncontracted (one cell per letter).
// Cells are dot numbers; several cells are joined with dashes (see braille.js).
//
// The cells come from the liblouis tables, the open-source braille translator behind most
// screen readers, which in turn follow each country's braille authority. The file each table
// was read from is named in its `source`; CREDITS.md lists the authorities.
//
// The switch on the page lists the tables in the order they are defined here.
//
// What each table holds:
//   letters      letters beyond a–z, lower case (a–z are shared, in braille.js)
//   accents      English only: accent signs written before a letter (combining mark → sign)
//   signs        punctuation and symbols
//   quotes       characters that open or close a quotation: [opening, closing]
//   midWord      signs used between two letters instead of the usual one
//   afterNumber  signs used straight after a digit instead of the usual one
//   inNumber     signs that keep a number going when a digit follows (decimal point, thousands)
//   capital      the sign before one capital letter
//   capsWord     the sign before a word, or a run of letters, in capitals
//   capsWordEnd  the sign that ends such a run when lower case follows (null: capitalise each letter instead)
//   capsPhrase   the sign before a run of `capsPhraseMin` or more words in capitals (null: none)
//   capsPhraseEnd the sign after the last letter of that run
//   number       the number sign
//   letterSign   the sign between a digit and a lower-case letter that looks like a digit (a–j)

const BRAILLE_TABLES = {};

BRAILLE_TABLES.en = {
  name: "English",      // as the language calls itself, for the switch
  english: "English",   // for the notes under the sheet
  lang: "en",
  code: "Unified English Braille, grade 1",
  source: "liblouis en-ueb-g1.ctb, en-ueb-chardefs.uti",
  letters: {},
  accents: {
    "́": "45-34",    // acute: café
    "̀": "45-16",    // grave
    "̂": "45-146",   // circumflex
    "̃": "45-12456", // tilde
    "̈": "45-25",    // diaeresis: naïve
    "̧": "45-12346", // cedilla: façade
    "̊": "45-1246",  // ring
    "̌": "45-346",   // caron
    "̄": "4-36",     // macron
    "̆": "4-346",    // breve
  },
  signs: {
    ",": "2", ";": "23", ":": "25", ".": "256", "!": "235", "?": "236",
    "'": "3", "‘": "6-236", "’": "6-356", "“": "236", "”": "356",
    "(": "5-126", ")": "5-345", "[": "46-126", "]": "46-345", "{": "456-126", "}": "456-345",
    "-": "36", "‐": "36", "‑": "36", "–": "6-36", "—": "6-36", "…": "256-256-256",
    "/": "456-34", "\\": "456-16", "|": "456-1256", "_": "46-36",
    "&": "4-12346", "@": "4-1", "#": "456-1456", "%": "46-356", "*": "5-35",
    "+": "5-235", "=": "5-2356", "<": "4-126", ">": "4-345", "×": "5-236", "÷": "5-34", "~": "4-35",
    "$": "4-234", "€": "4-15", "£": "4-123", "¢": "4-14", "¥": "4-13456",
    "§": "45-234", "¶": "45-1234", "©": "45-14", "®": "45-1235", "°": "45-245",
  },
  quotes: { '"': ["236", "356"] },
  midWord: { "’": "3" },
  afterNumber: {},
  inNumber: { ".": "256", ",": "2" },
  capital: "6",
  capsWord: "6-6",
  capsWordEnd: "6-3",
  capsPhrase: "6-6-6",
  capsPhraseEnd: "6-3",
  capsPhraseMin: 3,
  number: "3456",
  letterSign: "56",
};

BRAILLE_TABLES.sv = {
  name: "Svenska",
  english: "Swedish",
  lang: "sv",
  code: "Svensk punktskrift, oförkortad",
  source: "liblouis sv-g0.utb, sv-6common.uti (made with Punktskriftsnämnden)",
  letters: { "å": "16", "ä": "345", "ö": "246", "é": "123456", "ü": "1256", "à": "12356", "è": "2346" },
  signs: {
    ",": "2", ";": "23", ":": "25", ".": "3", "!": "235", "?": "26",
    "'": "5", "‘": "5", "’": "5", '"': "56", "“": "56", "”": "56", "„": "56",
    "(": "236", ")": "356", "[": "12356", "]": "23456", "{": "6-12356", "}": "6-23456",
    "-": "36", "‐": "36", "‑": "36", "–": "36-36", "…": "3-3-3",
    "/": "34", "\\": "45-34", "|": "456", "_": "45-36",
    "&": "12346", "@": "45-12356", "#": "45-3456", "%": "1456", "‰": "1456-1456", "*": "35",
    "+": "256", "=": "2356", "<": "3456-246", ">": "3456-135", "×": "12456-1346",
    "$": "45-234", "€": "45-15", "£": "45-123", "§": "346", "°": "12456-1245",
  },
  quotes: {},
  midWord: {},
  afterNumber: {},
  inNumber: { ".": "3", ",": "2" },
  capital: "6",
  capsWord: "6-6",
  capsWordEnd: "156",
  capsPhrase: "6-6-6",
  capsPhraseEnd: "156",
  capsPhraseMin: 3,
  number: "3456",
  letterSign: "156",
};
