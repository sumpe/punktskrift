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
