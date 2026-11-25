// Punktskrift Press: turns text into uncontracted braille using a table from tables.js.
// Loaded with a plain <script src>, not as a module, so the page still works opened straight from disk.
//
// Cells are written as dot numbers, as braille transcribers do: "125" is dots 1, 2 and 5 (h).
// A sign that takes several cells joins them with dashes: "6-36" is two cells.
//
//   1 ● ● 4
//   2 ● ● 5
//   3 ● ● 6

// a–z are the same in every language here; tables add their own letters on top.
const BASE_LETTERS = {
  a: "1", b: "12", c: "14", d: "145", e: "15", f: "124", g: "1245", h: "125", i: "24", j: "245",
  k: "13", l: "123", m: "134", n: "1345", o: "135", p: "1234", q: "12345", r: "1235", s: "234", t: "2345",
  u: "136", v: "1236", w: "2456", x: "1346", y: "13456", z: "1356",
};

// After the number sign, 1–9 and 0 are written with the cells of a–j.
const DIGIT_CELLS = { 1: "1", 2: "12", 3: "14", 4: "145", 5: "15", 6: "124", 7: "1245", 8: "125", 9: "24", 0: "245" };
const DIGIT_LIKE = new Set(Object.values(DIGIT_CELLS));

const isDigit = ch => ch >= "0" && ch <= "9";
const isLetter = ch => ch != null && /\p{L}/u.test(ch);
const isUpper = ch => isLetter(ch) && ch !== ch.toLowerCase();
const isLower = ch => isLetter(ch) && ch !== ch.toUpperCase();
const cellsOf = sign => sign.split("-");

// "1256" is a valid cell: dots 1–6, each at most once, in order.
const isCell = cell => /^1?2?3?4?5?6?$/.test(cell) && cell !== "";
const isSign = sign => typeof sign === "string" && cellsOf(sign).every(isCell);

// The Unicode braille character for a cell: dot n sets bit n − 1 above U+2800.
function cellChar(cell) {
  let bits = 0;
  for (const dot of cell) bits |= 1 << (Number(dot) - 1);
  return String.fromCharCode(0x2800 + bits);
}

// A quote opens a quotation when it starts a word or follows an opening bracket.
const opensHere = prev => prev == null || /[\s([{—–-]/.test(prev);

// The letters of a word that must carry a capital sign, as runs [first, last] over letter positions.
function capitalRuns(chars) {
  const letters = [];
  chars.forEach((ch, k) => { if (isLetter(ch)) letters.push(k); });
  const runs = [];
  let start = null;
  letters.forEach((pos, n) => {
    if (isUpper(chars[pos])) { if (start == null) start = n; }
    else if (start != null) { runs.push([start, n - 1]); start = null; }
  });
  if (start != null) runs.push([start, letters.length - 1]);
  return { letters, runs };
}

// A word is shouted when it has letters and none of them is lower case.
function isShouted(word) {
  const chars = [...word];
  return chars.some(isLetter) && !chars.some(isLower);
}

/**
 * Translate text into braille with one language's table.
 * Returns { lines, unknown }:
 *   lines   — an array of lines; each line an array of words; each word an array of glyphs
 *   glyph   — { print, cells, role }, where role is one of
 *             letter, digit, sign (punctuation and symbols),
 *             cap, capsEnd, num, let (indicators: capital, end of capitals, number, letter sign),
 *             unknown (a character this braille has no cell for; cells is [])
 *   unknown — the characters that had no cell, in the order they first appeared
 */
function translate(text, table) {
  const unknown = [];
  const lines = text.normalize("NFC").split(/\r?\n/).map(line => {
    const words = line.split(/[ \t ]+/).filter(Boolean);
    const phrase = phraseRoles(words, table);
    return words.map((word, k) => translateWord(word, table, phrase[k], unknown));
  });
  return { lines, unknown };
}

// In languages with a caps-phrase sign, a run of enough shouted words is marked once at the start
// and closed after its last letter, instead of marking each word.
function phraseRoles(words, table) {
  const roles = words.map(() => null);
  if (!table.capsPhrase) return roles;
  let k = 0;
  while (k < words.length) {
    let end = k;
    while (end < words.length && isShouted(words[end])) end++;
    if (end - k >= table.capsPhraseMin) {
      for (let n = k; n < end; n++) roles[n] = "inside";
      roles[k] = "first";
      roles[end - 1] = roles[end - 1] === "first" ? "only" : "last";
    }
    k = Math.max(end, k + 1);
  }
  return roles;
}

function translateWord(word, table, phraseRole, unknown) {
  const chars = [...word];
  const glyphs = [];
  const add = (print, sign, role) => glyphs.push({ print, cells: sign ? cellsOf(sign) : [], role });

  // Where the capital signs go: before[k] is the sign before character k, after[k] the sign after it.
  const before = {}, after = {};
  const { letters, runs } = capitalRuns(chars);
  if (phraseRole) {
    if (phraseRole === "first" || phraseRole === "only") before[letters[0]] = table.capsPhrase;
    if ((phraseRole === "last" || phraseRole === "only") && table.capsPhraseEnd) after[letters[letters.length - 1]] = table.capsPhraseEnd;
  } else {
    for (const [first, last] of runs) {
      const followedByLower = last < letters.length - 1;
      if (first === last) before[letters[first]] = table.capital;
      else if (!followedByLower || table.capsWordEnd) {
        before[letters[first]] = table.capsWord;
        if (followedByLower) after[letters[last]] = table.capsWordEnd;
      } else {
        for (let n = first; n <= last; n++) before[letters[n]] = table.capital;
      }
    }
  }

  let numeric = false;
  chars.forEach((ch, k) => {
    const prev = chars[k - 1], next = chars[k + 1];

    if (isDigit(ch)) {
      if (!numeric) add("", table.number, "num");
      numeric = true;
      add(ch, DIGIT_CELLS[ch], "digit");
      return;
    }
    if (numeric && isDigit(next) && table.inNumber[ch]) {
      add(ch, table.inNumber[ch], "sign");
      return;
    }
    const afterDigit = numeric;
    numeric = false;

    if (isLetter(ch)) {
      const lower = ch.toLowerCase();
      const sign = table.letters[lower] || BASE_LETTERS[lower] || accented(lower, table);
      if (!sign) { add(ch, null, "unknown"); noteUnknown(ch, unknown); return; }
      if (before[k]) add("", before[k], "cap");
      // After a number, a lower-case letter that looks like a digit needs the letter sign.
      if (afterDigit && isLower(ch) && DIGIT_LIKE.has(cellsOf(sign)[0])) add("", table.letterSign, "let");
      add(ch, sign, "letter");
      if (after[k]) add("", after[k], "capsEnd");
      return;
    }

    const sign =
      (isLetter(prev) && isLetter(next) && table.midWord[ch]) ||
      (afterDigit && table.afterNumber[ch]) ||
      (table.quotes[ch] && table.quotes[ch][opensHere(prev) ? 0 : 1]) ||
      table.signs[ch];
    if (sign) add(ch, sign, "sign");
    else { add(ch, null, "unknown"); noteUnknown(ch, unknown); }
  });
  return glyphs;
}

// Letters with accents a table doesn't list: English braille writes the accent as a sign before the letter.
function accented(letter, table) {
  if (!table.accents) return null;
  const [base, ...marks] = letter.normalize("NFD");
  if (!BASE_LETTERS[base] || !marks.length || !marks.every(mark => table.accents[mark])) return null;
  return [...marks.map(mark => table.accents[mark]), BASE_LETTERS[base]].join("-");
}

function noteUnknown(ch, unknown) {
  if (!unknown.includes(ch)) unknown.push(ch);
}

// The braille as Unicode text: words split by the blank cell, lines by newlines.
// A character with no cell keeps its print form, so nothing silently disappears.
function toUnicode(result) {
  return result.lines.map(words => words.map(glyphs => glyphs.map(glyph =>
    glyph.role === "unknown" ? glyph.print : glyph.cells.map(cellChar).join("")
  ).join("")).join("⠀")).join("\n");
}

// Every cell a table uses, checked: a broken table is caught by the tests, not by readers.
function tableProblems(table) {
  const problems = [];
  const check = (what, sign) => { if (!isSign(sign)) problems.push(`${what}: "${sign}" is not a braille sign`); };
  ["name", "english", "lang", "code", "sample"].forEach(key => { if (!table[key]) problems.push(`${key} is missing`); });
  ["capital", "capsWord", "number", "letterSign"].forEach(key => check(key, table[key]));
  ["capsWordEnd", "capsPhrase", "capsPhraseEnd"].forEach(key => { if (table[key] != null) check(key, table[key]); });
  for (const group of ["letters", "signs", "midWord", "afterNumber", "inNumber", "accents"]) {
    for (const [ch, sign] of Object.entries(table[group] || {})) check(`${group} ${ch}`, sign);
  }
  for (const [ch, pair] of Object.entries(table.quotes)) pair.forEach(sign => check(`quotes ${ch}`, sign));
  // Two letters on one cell would make the braille ambiguous.
  const letters = { ...BASE_LETTERS, ...table.letters };
  const seen = {};
  for (const [letter, sign] of Object.entries(letters)) {
    if (seen[sign] && !(table.sharedCells || []).includes(sign)) problems.push(`${seen[sign]} and ${letter} share ${sign}`);
    seen[sign] = letter;
  }
  return problems;
}
