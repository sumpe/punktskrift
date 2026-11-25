// Punktskrift Braille Press: the page. Reads the sentence, asks braille.js for the cells and lays them out on the sheet.
// Loaded after tables.js, braille.js and common.js, with a plain <script src>.

const form = byId("press");
const textBox = byId("text");
const sheet = byId("sheet");
const note = byId("note");
const showPrint = byId("show-print");
const reader = byId("reader");
const explainHint = byId("explain-hint");

let lang = savedLanguage(); // the language last chosen on any page, unless the link says otherwise
let pressed = null; // the text on the sheet now
let pressedLang = null;
let punching = null; // the timer while cells are still being embossed
let braille = "";    // the sheet as Unicode braille, for copying

const pressButton = byId("go");

// ---- The language switch ----

function chooseLanguage(id) {
  lang = id;
  textBox.lang = BRAILLE_TABLES[id].lang;
  const wasSample = !textBox.value.trim();
  textBox.placeholder = BRAILLE_TABLES[id].sample;
  if (pressed != null) press(wasSample ? textBox.placeholder : pressed);
}

// ---- Pressing ----

function press(text) {
  finishPunching();
  pressed = text;
  pressedLang = lang;
  const table = BRAILLE_TABLES[lang];
  const result = translate(text, table);

  const page = drawBraille(result, table);
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

// Start from the link if there is one, otherwise from the remembered language's greeting.
function start() {
  readLink();
  markLanguage(lang);
  textBox.lang = BRAILLE_TABLES[lang].lang;
  textBox.placeholder = BRAILLE_TABLES[lang].sample;
  press(textBox.value.trim() || textBox.placeholder);
}
window.addEventListener("hashchange", () => { if (readLink()) start(); });

const markLanguage = buildLanguageSwitch(byId("langs"), lang, chooseLanguage);
start();
