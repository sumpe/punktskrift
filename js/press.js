// Punktskrift Braille Press: the page. Reads the sentence, asks braille.js for the cells and lays them out on the sheet.
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
const explainHint = byId("explain-hint");

let lang = Object.keys(BRAILLE_TABLES)[0];
let pressed = null; // the text on the sheet now
let pressedLang = null;
let punching = null; // the timer while cells are still being embossed
let braille = "";    // the sheet as Unicode braille, for copying

const pressButton = byId("go");
const calm = window.matchMedia("(prefers-reduced-motion: reduce)");

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

  let print = glyph.print, explain = null;
  if (LABELS[glyph.role]) [print, explain] = LABELS[glyph.role];
  if (glyph.role === "unknown") explain = `${BRAILLE_TABLES[lang].english} braille has no cell for “${glyph.print}”, so the press left the space empty.`;
  const under = makeElement("span", "print", print);
  if (LABELS[glyph.role]) under.classList.add("label");
  if (explain) { box.dataset.explain = explain; box.classList.add("explained"); }
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
  braille = toUnicode(result);
  reader.textContent = `${table.english} braille for “${text}”: ${braille}`;
  rememberInLink();

  // A word on the labels, when the sheet has any
  explainHint.hidden = !page.querySelector(".explained");

  if (result.unknown.length) {
    note.textContent = `Not in ${table.english} braille, so left as an empty cell: ${result.unknown.join(" ")}`;
    note.hidden = false;
  } else {
    note.hidden = true;
  }
}

// ---- The machine: cells are embossed one at a time, in reading order ----

// About 120 ms a cell, the pace of a brailler at work; a long text speeds up so it never takes more than about 15 seconds.
function punch(page) {
  if (calm.matches) return;
  const glyphs = [...page.querySelectorAll(".glyph")];
  const cellCount = page.querySelectorAll(".cell").length;
  const step = Math.min(120, 15000 / Math.max(cellCount, 1));
  let n = 0;
  for (const glyph of glyphs) {
    glyph.style.setProperty("--t", `${Math.round(n * step)}ms`);
    for (const cell of glyph.querySelectorAll(".cell")) cell.style.setProperty("--t", `${Math.round(n++ * step)}ms`);
  }
  page.classList.add("punching");
  pressButton.textContent = "Pressing…";
  punching = setTimeout(finishPunching, n * step + 500);
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

sheet.addEventListener("pointerover", event => {
  const glyph = event.target.closest(".explained");
  if (glyph && event.pointerType === "mouse") showExplanation(glyph);
});
sheet.addEventListener("pointerout", event => {
  const glyph = event.target.closest(".explained");
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

// ---- Keeping and sharing ----

// The address holds the language and the sentence, #sv/hej%20piotrek, so a pressed page can be shared.
function rememberInLink() {
  const typed = textBox.value.trim();
  const hash = "#" + lang + (typed ? "/" + encodeURIComponent(typed) : "");
  if (location.hash !== hash) history.replaceState(null, "", hash);
}

function readLink() {
  const match = /^#([a-z]+)(?:\/(.*))?$/.exec(location.hash);
  if (!match || !BRAILLE_TABLES[match[1]]) return false;
  lang = match[1];
  try { textBox.value = match[2] ? decodeURIComponent(match[2]) : ""; } catch { textBox.value = ""; }
  return true;
}

async function copyBraille() {
  try {
    await navigator.clipboard.writeText(braille);
  } catch {
    // Older browsers, or a page opened from disk where the clipboard is off limits
    const scratch = makeElement("textarea");
    scratch.value = braille;
    document.body.append(scratch);
    scratch.select();
    document.execCommand("copy");
    scratch.remove();
  }
  const button = byId("copy");
  button.textContent = "Copied";
  setTimeout(() => { button.textContent = "Copy braille"; }, 1600);
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
byId("copy").addEventListener("click", copyBraille);
byId("print").addEventListener("click", () => { finishPunching(); window.print(); });

// Start from the link if there is one, otherwise from the first language's greeting.
function start() {
  readLink();
  markLanguage();
  textBox.lang = BRAILLE_TABLES[lang].lang;
  textBox.placeholder = BRAILLE_TABLES[lang].sample;
  press(textBox.value.trim() || textBox.placeholder);
}
window.addEventListener("hashchange", () => { if (readLink()) start(); });

buildSwitch();
start();
