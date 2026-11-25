// Punktskrift Press: known translations for each language, checked by tests/index.html.
// Expected braille is written in dot numbers: cells split by spaces, words by " | ", lines by " / ".
// "=x" stands for a character x that has no cell and is kept in print.

const CASES = {};

CASES.en = [
  ["hello", "125 15 123 123 135"],
  ["Hello", "6 125 15 123 123 135"],
  ["I am", "6 24 | 1 134"],
  ["Hi, Piotrek.", "6 125 24 2 | 6 1234 24 135 2345 1235 15 13 256"],
  ['"Yes!"', "236 6 13456 15 234 235 356"],
  ["don't", "145 135 1345 3 2345"],
  ["don’t", "145 135 1345 3 2345"],
  // Capitals: one letter, a whole word, a run that lower case ends, three words in capitals
  ["PhD", "6 1234 125 6 145"],
  ["NASA", "6 6 1345 1 234 1"],
  ["ABCs", "6 6 1 12 14 6 3 234"],
  ["THIS IS LOUD", "6 6 6 2345 125 24 234 | 24 234 | 123 135 136 145 6 3"],
  // Numbers: the number sign, a decimal point and thousands inside a number, the letter sign after one
  ["2026", "3456 12 245 12 124"],
  ["3.14", "3456 14 256 1 145"],
  ["1,000", "3456 1 2 245 245 245"],
  ["3a", "3456 14 56 1"],
  ["3k", "3456 14 13"],
  ["1234Card", "3456 1 12 14 145 6 14 1 1235 145"],
  ["(1-2)", "5 126 3456 1 36 3456 12 5 345"],
  // Accents come before the letter
  ["café", "14 1 124 45 34 15"],
  ["Café", "6 14 1 124 45 34 15"],
  // Lines, and a character English braille has no cell for
  ["line one\nline two", "123 24 1345 15 | 135 1345 15 / 123 24 1345 15 | 2345 2456 135"],
  ["snow ☃", "234 1345 135 2456 | =☃"],
];

CASES.sv = [
  ["hej", "125 15 245"],
  ["Hej, Piotrek!", "6 125 15 245 2 | 6 1234 24 135 2345 1235 15 13 235"],
  ["blåbär", "12 123 16 12 345 1235"],
  ["Öl", "6 246 123"],
  ["café", "14 1 124 123456"],
  ["Vad? Ja.", "6 1236 1 145 26 | 6 245 1 3"],
  ['"Hej"', "56 6 125 15 245 56"],
  ["(fika)", "236 124 24 13 1 356"],
  // Capitals: a word, a run that lower case ends, three words in capitals
  ["SVT", "6 6 234 1236 2345"],
  ["SVTs", "6 6 234 1236 2345 156 234"],
  ["DET ÄR STORT", "6 6 6 145 15 2345 | 345 1235 | 234 2345 135 1235 2345 156"],
  // Numbers: decimal comma, the letter sign after a number, a dash between numbers
  ["2026", "3456 12 245 12 124"],
  ["3,5", "3456 14 2 15"],
  ["3a", "3456 14 156 1"],
  ["kl. 9–17", "13 123 3 | 3456 24 36 36 3456 1 1245"],
  ["€", "45 15"],
  ["snö ☃", "234 1345 246 | =☃"],
];

CASES.de = [
  ["Hallo, Welt!", "46 125 1 123 123 135 2 | 46 2456 15 123 2345 235"],
  ["Straße", "46 234 2345 1235 1 2346 15"],
  ["Grüße", "46 1245 1235 1256 2346 15"],
  ["Café", "46 14 1 124 4 15"],
  // Capitals: a whole word, a run that lower case ends, single capitals inside a word
  ["ÄRGER", "45 345 1235 1245 15 1235"],
  ["ABCs", "45 1 12 14 6 234"],
  ["GmbH", "46 1245 134 12 46 125"],
  // Quotes in both German styles; signs between letters and after digits take dot 6
  ["„Ja“", "236 46 245 1 356"],
  ["»Ja«", "236 46 245 1 356"],
  ["Lehrer(innen)", "46 123 15 125 1235 15 1235 6 2356 24 1345 1345 15 1345 2356"],
  ["geht’s", "1245 15 125 2345 6 234"],
  ["Seite 3!", "46 234 15 24 2345 15 | 3456 14 6 235"],
  // Numbers: time and decimal comma stay in the number; the letter sign is dot 6
  ["2026", "3456 12 245 12 124"],
  ["12:30", "3456 1 12 25 14 245"],
  ["3,5", "3456 14 2 15"],
  ["3a", "3456 14 6 1"],
  ["Schnee ☃", "46 234 14 125 1345 15 15 | =☃"],
];
