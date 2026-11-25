// Punktskrift Primer: the try-it parts of the explanation. Loaded after lessons.js and common.js.
// Every part redraws itself when the language changes, since cells and signs differ between countries.

let lang = savedLanguage();
const table = () => BRAILLE_TABLES[lang];
const parts = []; // functions that redraw a try-it part for the current language

// "145" → "dots 1 4 5"; "1" → "dot 1"
const dotsText = cell => (cell.length === 1 ? "dot " : "dots ") + [...cell].join(" ");

// ---- 1. The cell: tap dots, see what the cell is ----

const cellPad = makePad(cell => showReading(cell));
byId("cell-pad").append(cellPad.element);

function showReading(cell) {
  const box = byId("cell-reading");
  box.replaceChildren();
  if (!cell) {
    box.append(makeElement("p", "big", "·"), makeElement("p", "what", "No dots: a blank cell, which is a space."));
    return;
  }
  box.append(makeElement("p", "dots", dotsText(cell)));
  const meanings = lettersFor(table(), cell);
  if (!meanings.length) {
    box.append(makeElement("p", "what", `${table().english} braille doesn't use this cell on its own. It only appears as part of a longer sign, or not at all.`));
    return;
  }
  const main = meanings.find(m => m.kind === "letter") || meanings[0];
  const big = makeElement("p", "big", main.kind === "indicator" ? "" : main.print);
  big.lang = table().lang;
  box.append(big);
  const list = makeElement("ul", "meanings");
  for (const meaning of meanings) {
    const line = makeElement("li");
    if (meaning.kind === "indicator") line.textContent = `The ${meaning.print}.`;
    else if (meaning.kind === "digit") line.textContent = `The digit ${meaning.print}, after the number sign.`;
    else if (meaning.kind === "letter") line.textContent = `The letter ${meaning.print}.`;
    else line.textContent = `The ${meaning.kind === "sign" ? "sign" : meaning.kind} ${meaning.print}`;
    list.append(line);
  }
  box.append(list);
}
parts.push(() => showReading(cellPad.cell()));

// ---- 2. The alphabet's pattern: three rows of ten, the added dots ringed ----

function drawDecades() {
  const box = byId("decades");
  box.replaceChildren();
  const rows = [
    ["abcdefghij", ""],
    ["klmnopqrst", "3"],
    ["uvxyz", "36"],
  ];
  for (const [letters, added] of rows) {
    box.append(makeElement("span", "row-label", added ? `${letters[0]}–${letters.slice(-1)}: the same shapes + ${dotsText(added)}` : "a–j: the top four dots"));
    const row = makeElement("div", "decade");
    [...letters].forEach((letter, column) => {
      const glyph = makeElement("span", "glyph");
      glyph.dataset.column = column;
      const cell = drawCell(BASE_LETTERS[letter]);
      for (const dot of added) cell.querySelector(".d" + dot).classList.add("added");
      glyph.append(cell, makeElement("span", "print", letter));
      row.append(glyph);
    });
    box.append(row);
  }
}
// Point at a letter: its column lights up in all three rows
function lightColumn(column) {
  for (const glyph of byId("decades").querySelectorAll(".glyph")) glyph.classList.toggle("lit", glyph.dataset.column === column);
}
byId("decades").addEventListener("pointerover", event => {
  const glyph = event.target.closest(".glyph");
  lightColumn(glyph ? glyph.dataset.column : null);
});
byId("decades").addEventListener("pointerleave", () => lightColumn(null));
byId("decades").addEventListener("click", event => {
  const glyph = event.target.closest(".glyph");
  lightColumn(glyph ? glyph.dataset.column : null);
});
drawDecades();

// ---- Wiring ----

buildLanguageSwitch(byId("langs"), lang, id => { lang = id; parts.forEach(redraw => redraw()); });
parts.forEach(redraw => redraw());
