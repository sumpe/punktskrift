// Punktskrift: what the Press, the Drill and the Primer share. Loaded after tables.js and braille.js,
// before the page's own script, with a plain <script src> (no modules, so pages open straight from disk).

const byId = id => document.getElementById(id);

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text != null) element.textContent = text;
  return element;
}

const calm = window.matchMedia("(prefers-reduced-motion: reduce)");

// ---- The language, remembered across pages ----

const LANG_KEY = "punktskrift-lang";

function savedLanguage() {
  let id = null;
  try { id = localStorage.getItem(LANG_KEY); } catch { /* storage off: fine */ }
  return BRAILLE_TABLES[id] ? id : Object.keys(BRAILLE_TABLES)[0];
}

function saveLanguage(id) {
  try { localStorage.setItem(LANG_KEY, id); } catch { /* storage off: fine */ }
}

// The row of language buttons. Returns mark(id), which shows id as chosen without calling onChoose.
function buildLanguageSwitch(container, chosen, onChoose) {
  container.replaceChildren();
  for (const [id, table] of Object.entries(BRAILLE_TABLES)) {
    const button = makeElement("button", null, table.name);
    button.type = "button";
    button.setAttribute("role", "radio");
    button.lang = table.lang;
    button.dataset.lang = id;
    button.title = table.code;
    button.addEventListener("click", () => { mark(id); saveLanguage(id); onChoose(id); });
    container.append(button);
  }
  function mark(id) {
    for (const button of container.children) {
      const on = button.dataset.lang === id;
      button.classList.toggle("on", on);
      button.setAttribute("aria-checked", on);
    }
  }
  mark(chosen);
  return mark;
}

// ---- Drawing braille ----

// Indicator cells have no print letter of their own. The small print names them,
// and hovering (or tapping) explains them to people who don't read braille.
const LABELS = {
  cap: ["cap", "Capital sign. Braille has no capital letters of its own, so this cell says the next letter is a capital."],
  capsWord: ["caps", "Capitals sign. This cell says the whole word that follows is in capitals."],
  capsPhrase: ["caps", "Capitals sign for several words. Everything up to the end-of-capitals sign is in capitals."],
  capsEnd: ["end", "End of capitals. From here the letters are lower case again."],
  num: ["num", "Number sign. Braille has no digits of its own: after this cell, the letters a to j stand for 1 to 9 and 0."],
  let: ["let", "Letter sign. It ends the number, so the next cell is read as a letter, not a digit."],
};

// One braille cell: six dot positions, raised where the cell has a dot.
function drawCell(cell) {
  const box = makeElement("span", "cell");
  for (let dot = 1; dot <= 6; dot++) box.append(makeElement("i", "dot d" + dot + (cell.includes(dot) ? " up" : "")));
  return box;
}

// One glyph from translate(): its cells, and the print (or the indicator's label) under them.
function drawGlyph(glyph, table) {
  const box = makeElement("span", "glyph " + glyph.role);
  const cells = makeElement("span", "cells");
  if (glyph.role === "unknown") cells.append(makeElement("span", "cell missing"));
  else glyph.cells.forEach(cell => cells.append(drawCell(cell)));

  let print = glyph.print, explain = null;
  if (LABELS[glyph.role]) [print, explain] = LABELS[glyph.role];
  if (glyph.role === "unknown") explain = `${table.english} braille has no cell for “${glyph.print}”, so the press left the space empty.`;
  const under = makeElement("span", "print", print);
  if (LABELS[glyph.role]) under.classList.add("label");
  if (explain) { box.dataset.explain = explain; box.classList.add("explained"); }
  box.append(cells, under);
  return box;
}

// A whole translation, line by line and word by word, as a .page element.
function drawBraille(result, table) {
  const page = makeElement("div", "page");
  page.lang = table.lang;
  for (const words of result.lines) {
    const line = makeElement("div", "line");
    if (!words.length) line.classList.add("empty");
    for (const glyphs of words) {
      const word = makeElement("span", "word");
      glyphs.forEach(glyph => word.append(drawGlyph(glyph, table)));
      line.append(word);
    }
    page.append(line);
  }
  return page;
}

// ---- Explanations: a small ink slip over a labelled cell, on hover or tap ----

const slip = makeElement("div", "explain");
slip.setAttribute("role", "tooltip");
document.body.append(slip);
let explaining = null;

function showExplanation(glyph) {
  explaining = glyph;
  slip.textContent = glyph.dataset.explain;
  slip.classList.add("on");
  const box = glyph.getBoundingClientRect();
  const width = slip.offsetWidth, height = slip.offsetHeight, margin = 8;
  const left = Math.min(Math.max(margin, box.left + box.width / 2 - width / 2), window.innerWidth - width - margin);
  const above = box.top - height - 10;
  slip.style.transform = `translate(${Math.round(left)}px, ${Math.round(above > margin ? above : box.bottom + 10)}px)`;
}

function hideExplanation() {
  explaining = null;
  slip.classList.remove("on");
}

document.addEventListener("pointerover", event => {
  const glyph = event.target.closest && event.target.closest(".explained");
  if (glyph && event.pointerType === "mouse") showExplanation(glyph);
});
document.addEventListener("pointerout", event => {
  const glyph = event.target.closest && event.target.closest(".explained");
  if (glyph && event.pointerType === "mouse" && !glyph.contains(event.relatedTarget)) hideExplanation();
});
// A tap shows the explanation; a second tap, or a tap elsewhere, hides it.
// With a mouse, hovering already shows it, so a click on the cell leaves it up.
const hoverable = window.matchMedia("(hover: hover)");
document.addEventListener("click", event => {
  const glyph = event.target.closest && event.target.closest(".explained");
  if (glyph && (glyph !== explaining || hoverable.matches)) showExplanation(glyph);
  else hideExplanation();
});
window.addEventListener("scroll", hideExplanation, { passive: true });
document.addEventListener("keydown", event => { if (event.key === "Escape") hideExplanation(); });
