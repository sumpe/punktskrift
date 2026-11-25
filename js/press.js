// Punktskrift Press: the page. Reads the sentence, asks braille.js for the cells and lays them out on the sheet.
// Loaded after tables.js and braille.js, with a plain <script src>.

const byId = id => document.getElementById(id);

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text != null) element.textContent = text;
  return element;
}

const form = byId("press");
const textBox = byId("text");
const sheet = byId("sheet");
const langSwitch = byId("langs");
const note = byId("note");
const showPrint = byId("show-print");
const reader = byId("reader");

let lang = Object.keys(BRAILLE_TABLES)[0];
let pressed = null; // the text on the sheet now
let pressedLang = null;
let punching = null; // the timer while cells are still being embossed

const pressButton = byId("go");
const calm = window.matchMedia("(prefers-reduced-motion: reduce)");

// What the small print says under the indicator cells, and what it means on hover
const LABELS = {
  cap: ["cap", "capital sign"],
  caps: ["caps", "capitals sign: the whole word, or several words"],
  capsEnd: ["end", "end of capitals"],
  num: ["num", "number sign: a–j are digits until the word ends"],
  let: ["let", "letter sign: what follows is a letter, not a digit"],
};

// ---- The language switch, built from the tables ----

function buildSwitch() {
  langSwitch.replaceChildren();
  for (const [id, table] of Object.entries(BRAILLE_TABLES)) {
    const button = makeElement("button", null, table.name);
    button.type = "button";
    button.setAttribute("role", "radio");
    button.lang = table.lang;
    button.dataset.lang = id;
    button.title = table.code;
    button.addEventListener("click", () => chooseLanguage(id));
    langSwitch.append(button);
  }
  markLanguage();
}

function markLanguage() {
  for (const button of langSwitch.children) {
    const on = button.dataset.lang === lang;
    button.classList.toggle("on", on);
    button.setAttribute("aria-checked", on);
  }
}

function chooseLanguage(id) {
  lang = id;
  markLanguage();
  textBox.lang = BRAILLE_TABLES[id].lang;
  const wasSample = !textBox.value.trim();
  textBox.placeholder = BRAILLE_TABLES[id].sample;
  if (pressed != null) press(wasSample ? textBox.placeholder : pressed);
}

// ---- Laying out the sheet ----

// One braille cell: six dot positions, raised where the cell has a dot.
function drawCell(cell) {
  const box = makeElement("span", "cell");
  for (let dot = 1; dot <= 6; dot++) box.append(makeElement("i", "dot d" + dot + (cell.includes(dot) ? " up" : "")));
  return box;
}

function drawGlyph(glyph) {
  const box = makeElement("span", "glyph " + glyph.role);
  const cells = makeElement("span", "cells");
  if (glyph.role === "unknown") cells.append(makeElement("span", "cell missing"));
  else glyph.cells.forEach(cell => cells.append(drawCell(cell)));

  let print = glyph.print, meaning = null;
  const label = glyph.role === "cap" && glyph.cells.length > 1 ? "caps" : glyph.role;
  if (LABELS[label]) [print, meaning] = LABELS[label];
  const under = makeElement("span", "print", print);
  if (meaning) { box.title = meaning; under.classList.add("label"); }
  if (glyph.role === "unknown") box.title = `No ${BRAILLE_TABLES[lang].english} braille for “${glyph.print}”`;
  box.append(cells, under);
  return box;
}

function press(text) {
  finishPunching();
  pressed = text;
  pressedLang = lang;
  const table = BRAILLE_TABLES[lang];
  const result = translate(text, table);

  const page = makeElement("div", "page");
  page.lang = table.lang;
  for (const words of result.lines) {
    const line = makeElement("div", "line");
    if (!words.length) line.classList.add("empty");
    for (const glyphs of words) {
      const word = makeElement("span", "word");
      glyphs.forEach(glyph => word.append(drawGlyph(glyph)));
      line.append(word);
    }
    page.append(line);
  }
  const stamp = makeElement("p", "stamp", table.code);
  stamp.setAttribute("aria-hidden", "true");
  sheet.replaceChildren(stamp, page);
  page.setAttribute("aria-hidden", "true");
  punch(page);

  // Screen readers get the sentence and the braille as text, which braille displays can show.
  reader.textContent = `${table.english} braille for “${text}”: ${toUnicode(result)}`;

  if (result.unknown.length) {
    note.textContent = `Not in ${table.english} braille, so left as an empty cell: ${result.unknown.join(" ")}`;
    note.hidden = false;
  } else {
    note.hidden = true;
  }
}

// ---- The machine: cells are embossed one at a time, in reading order ----

// About 35 ms a cell, like a brailler, but a long text never takes more than about four seconds.
function punch(page) {
  if (calm.matches) return;
  const glyphs = [...page.querySelectorAll(".glyph")];
  const cellCount = page.querySelectorAll(".cell").length;
  const step = Math.min(35, 4000 / Math.max(cellCount, 1));
  let n = 0;
  for (const glyph of glyphs) {
    glyph.style.setProperty("--t", `${Math.round(n * step)}ms`);
    for (const cell of glyph.querySelectorAll(".cell")) cell.style.setProperty("--t", `${Math.round(n++ * step)}ms`);
  }
  page.classList.add("punching");
  pressButton.textContent = "Pressing…";
  punching = setTimeout(finishPunching, n * step + 300);
}

// Skip to the finished page.
function finishPunching() {
  if (!punching) return;
  clearTimeout(punching);
  punching = null;
  const page = sheet.querySelector(".page");
  if (page) page.classList.remove("punching");
  pressButton.textContent = "Press";
}

// ---- Wiring ----

form.addEventListener("submit", event => {
  event.preventDefault();
  const text = textBox.value.trim() || textBox.placeholder;
  // Pressing the same thing again while the press is running just finishes it.
  if (punching && text === pressed && lang === pressedLang) finishPunching();
  else press(text);
});
sheet.addEventListener("click", finishPunching);
document.addEventListener("keydown", event => { if (event.key === "Escape") finishPunching(); });

// Enter presses; Shift+Enter starts a new line.
textBox.addEventListener("keydown", event => {
  if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
    event.preventDefault();
    form.requestSubmit();
  }
});

showPrint.addEventListener("change", () => sheet.classList.toggle("bare", !showPrint.checked));

buildSwitch();
textBox.lang = BRAILLE_TABLES[lang].lang;
textBox.placeholder = BRAILLE_TABLES[lang].sample;
press(textBox.placeholder);
