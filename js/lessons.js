// Punktskrift: what the Drill and the Primer teach, built from the tables. Plain functions, no page needed,
// so tests/index.html checks them directly. Loaded after tables.js and braille.js.
//
// An item is one thing to learn: { print, also, cell, prefix, kind, key }
//   print   what it is in print: "d", "4", "?"
//   also    other print forms on the same cell, e.g. ")" beside "(" in German
//   cell    its cell, in dot numbers: "145"
//   prefix  a cell that comes first, for digits the number sign
//   kind    letter, digit or sign
//   key     prefix and cell together; no two items in a level share one

const PUNCTUATION = [".", ",", "?", "!", ";", ":", "'", "-", "(", ")", '"', "“", "”", "„"];

function item(print, cell, kind, prefix = null) {
  return { print, also: [], cell, prefix, kind, key: (prefix ? prefix + "-" : "") + cell };
}

// Letters a table writes in one cell (a–z first, then its own), as items
function letterItems(table, letters) {
  return [...letters].map(letter => item(letter, table.letters[letter] || BASE_LETTERS[letter], "letter"));
}

// The language's own letters that fit in one cell: å ä ö, ł ż, ç ã… (not the foreign ones a table also knows)
function ownLetters(table) {
  return [...table.alphabet].filter(letter => isCell(table.letters[letter] || "")).join("");
}

// The punctuation a table writes in one cell. Marks that share a cell become one item ("( )"),
// and a mark on a cell that is also a letter is left out, so every answer is unambiguous.
function punctuationItems(table) {
  const letterCells = new Set([...Object.values(BASE_LETTERS), ...Object.values(table.letters)]);
  const byCell = new Map();
  for (const mark of PUNCTUATION) {
    const sign = table.signs[mark] || (table.quotes[mark] && table.quotes[mark][0]);
    if (!sign || !isCell(sign) || letterCells.has(sign)) continue;
    if (byCell.has(sign)) byCell.get(sign).also.push(mark);
    else byCell.set(sign, item(mark, sign, "sign"));
  }
  return [...byCell.values()];
}

// "åäöéüàè" → "å ä ö é …", short enough for a button
const shortList = letters => [...letters].slice(0, 4).join(" ") + (letters.length > 4 ? " …" : "");

/**
 * The levels, in the order braille is usually taught:
 * the first ten letters on the top four dots, then the same ten with dot 3, then with dots 3 and 6,
 * the language's own letters, digits, punctuation, and finally everything together.
 * A level with nothing in it (a language with no letters of its own) is left out.
 */
function levels(table) {
  const list = [
    { id: "aj", name: "a–j", hint: "The first ten letters use only the top four dots.", items: letterItems(table, "abcdefghij") },
    { id: "kt", name: "k–t", hint: "The same ten shapes again, with dot 3 added.", items: letterItems(table, "klmnopqrst") },
    { id: "uz", name: "u–z", hint: "a–e again with dots 3 and 6 added; w is the odd one out.", items: letterItems(table, "uvwxyz") },
    { id: "own", name: shortList(ownLetters(table)), hint: `The letters ${table.english} braille adds to a–z.`, items: letterItems(table, ownLetters(table)) },
    { id: "digits", name: "1–0", hint: "The number sign, then a–j stand for 1 to 9 and 0.", items: [..."1234567890"].map(d => item(d, DIGIT_CELLS[d], "digit", table.number)) },
    { id: "signs", name: "Punctuation", hint: `Full stop, comma, question mark and the rest, as ${table.english} braille writes them.`, items: punctuationItems(table) },
  ].filter(level => level.items.length);
  list.push({ id: "all", name: "Everything", hint: "All of the above, mixed.", items: list.flatMap(level => level.items) });
  return list;
}

// What a single cell means in a table: its letters, signs, and the digit it is after the number sign.
function lettersFor(table, cell) {
  const meanings = [];
  for (const [letter, sign] of Object.entries({ ...BASE_LETTERS, ...table.letters })) {
    if (sign === cell) meanings.push({ print: letter, kind: "letter" });
  }
  for (const [mark, sign] of Object.entries(table.signs)) {
    if (sign === cell) meanings.push({ print: mark, kind: "sign" });
  }
  for (const [mark, pair] of Object.entries(table.quotes)) {
    pair.forEach((sign, n) => { if (sign === cell) meanings.push({ print: mark, kind: n ? "closing quote" : "opening quote" }); });
  }
  for (const [digit, sign] of Object.entries(DIGIT_CELLS)) {
    if (sign === cell) meanings.push({ print: digit, kind: "digit" });
  }
  for (const [name, role] of [["capital", "cap"], ["capsWord", "capsWord"], ["number", "num"], ["letterSign", "let"], ["capsWordEnd", "capsEnd"]]) {
    if (table[name] === cell) meanings.push({ print: LABELS_SHORT[role], kind: "indicator" });
  }
  return meanings;
}

const LABELS_SHORT = { cap: "capital sign", capsWord: "capitals sign", num: "number sign", let: "letter sign", capsEnd: "end of capitals" };

// How many dots two cells differ by
function dotDistance(a, b) {
  let distance = 0;
  for (let dot = 1; dot <= 6; dot++) if (a.includes(dot) !== b.includes(dot)) distance++;
  return distance;
}

// Wrong answers worth offering: the items whose cells are closest to this one (d, f, h, j for each other),
// picked at random from the nearest few, preferring the same kind (letters among letters).
function neighbours(target, pool, count = 3, random = Math.random) {
  const others = pool.filter(other => other.key !== target.key);
  const sameKind = others.filter(other => other.kind === target.kind);
  const candidates = (sameKind.length >= count ? sameKind : others)
    .map(other => ({ other, distance: dotDistance(target.cell, other.cell), tie: random() }))
    .sort((x, y) => x.distance - y.distance || x.tie - y.tie)
    .slice(0, count * 2)
    .map(({ other }) => other);
  for (let k = candidates.length - 1; k > 0; k--) {
    const j = Math.floor(random() * (k + 1));
    [candidates[k], candidates[j]] = [candidates[j], candidates[k]];
  }
  return candidates.slice(0, count);
}
