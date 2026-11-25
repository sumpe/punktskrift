// Punktskrift Drill: the game for learning the cells. Loaded after lessons.js and common.js.
//
// A round is 12 questions from one level. In Read mode a cell is shown and you pick its letter;
// in Write mode a letter is shown and you build its cell.

const ROUND = 12;
const SETTINGS_KEY = "punktskrift-drill";

const setup = byId("setup");
const game = byId("game");
const done = byId("done");
const levelChips = byId("levels");
const levelHint = byId("level-hint");
const modeSwitch = byId("modes");
const stage = byId("stage");
const answerBox = byId("answer");
const feedback = byId("feedback");
const nextButton = byId("next");

let lang = savedLanguage();
let mode = "read";
let levelId = "aj";
let round = null; // { level, queue, at, right, missed, again, answered, current }

// ---- Settings: language, mode and level, remembered between visits ----

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
    if (saved.mode === "read" || saved.mode === "write") mode = saved.mode;
    if (typeof saved.level === "string") levelId = saved.level;
  } catch { /* nothing saved, or storage off */ }
}

function saveSettings() {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify({ mode, level: levelId })); } catch { /* storage off */ }
}

const table = () => BRAILLE_TABLES[lang];
const currentLevels = () => levels(table());
const currentLevel = () => currentLevels().find(level => level.id === levelId) || currentLevels()[0];

function showLevels() {
  const list = currentLevels();
  if (!list.some(level => level.id === levelId)) levelId = list[0].id;
  levelChips.replaceChildren(...list.map(level => {
    const chip = makeElement("button", null, level.name);
    chip.type = "button";
    chip.setAttribute("role", "radio");
    chip.lang = level.id === "own" ? table().lang : "";
    chip.dataset.level = level.id;
    const on = level.id === levelId;
    chip.classList.toggle("on", on);
    chip.setAttribute("aria-checked", on);
    chip.addEventListener("click", () => { levelId = level.id; saveSettings(); showLevels(); });
    return chip;
  }));
  levelHint.textContent = currentLevel().hint;
}

function showMode() {
  for (const button of modeSwitch.children) {
    const on = button.dataset.mode === mode;
    button.classList.toggle("on", on);
    button.setAttribute("aria-checked", on);
  }
}

// ---- Drawing a question ----

// "145" → "dots 1 4 5"; "1" → "dot 1"
const dotsText = cell => (cell.length === 1 ? "dot " : "dots ") + [...cell].join(" ");

// How an item reads in print: "d", "4", "( )"
const printOf = it => [it.print, ...it.also].join(" ");

// A big embossed tile with the item's cell, and the number sign before it for digits
function drawTile(it, { showPrint = false } = {}) {
  const tile = makeElement("div", "tile");
  if (it.prefix) {
    const prefix = drawGlyph({ print: "", cells: [it.prefix], role: "num" }, table());
    tile.append(prefix);
  }
  const glyph = makeElement("span", "glyph");
  glyph.append(drawCell(it.cell), makeElement("span", "print", showPrint ? printOf(it) : "?"));
  tile.append(glyph);
  return tile;
}

// ---- Rounds ----

function shuffled(items) {
  const copy = items.slice();
  for (let k = copy.length - 1; k > 0; k--) {
    const j = Math.floor(Math.random() * (k + 1));
    [copy[k], copy[j]] = [copy[j], copy[k]];
  }
  return copy;
}

// 12 questions from the level: every item once before any comes twice
function makeQueue(items) {
  const queue = [];
  while (queue.length < ROUND) queue.push(...shuffled(items));
  return queue.slice(0, ROUND);
}

function startRound() {
  const level = currentLevel();
  round = { level, queue: makeQueue(level.items), at: 0, right: 0, missed: [], again: new Set(), answered: false, current: null };
  setup.hidden = true;
  done.hidden = true;
  game.hidden = false;
  ask();
}

function ask() {
  const it = round.queue[round.at];
  round.current = it;
  round.answered = false;
  byId("count").textContent = `${round.at + 1} of ${round.queue.length}`;
  byId("fill").style.width = `${(round.at / round.queue.length) * 100}%`;
  feedback.hidden = true;
  nextButton.hidden = true;
  answerBox.replaceChildren();
  if (mode === "read") askRead(it);
  else askWrite(it);
}

function askRead(it) {
  byId("ask").textContent = it.prefix ? "Which digit is this?" : it.kind === "sign" ? "Which mark is this?" : "Which letter is this?";
  stage.replaceChildren(drawTile(it));
  const choices = shuffled([it, ...neighbours(it, round.level.items)]);
  const list = makeElement("div", "choices");
  for (const choice of choices) {
    const button = makeElement("button", "choice", printOf(choice));
    button.type = "button";
    button.lang = table().lang;
    button.dataset.key = choice.key;
    button.addEventListener("click", () => answerRead(choice, button));
    list.append(button);
  }
  answerBox.append(list);
  list.firstChild.focus({ preventScroll: true });
}

function answerRead(choice, button) {
  if (round.answered) return;
  const it = round.current;
  const right = choice.key === it.key;
  for (const other of answerBox.querySelectorAll(".choice")) {
    other.disabled = true;
    if (other.dataset.key === it.key) other.classList.add("right");
  }
  if (!right) button.classList.add("wrong");
  stage.replaceChildren(drawTile(it, { showPrint: true }));
  settle(right, right
    ? `✓ Right: ${printOf(it)} is ${dotsText(it.cell)}.`
    : `✗ Not quite: that cell is ${printOf(it)}, ${dotsText(it.cell)}. You chose ${printOf(choice)}, ${dotsText(choice.cell)}.`);
}

// ---- Write: build the cell on a six-dot pad ----

let pad = null; // the six-dot pad in Write mode

function askWrite(it) {
  byId("ask").textContent = it.prefix ? "Write this digit. The number sign is already there." : it.kind === "sign" ? "Write this mark." : "Write this letter.";
  const target = makeElement("div", "target", printOf(it));
  target.lang = table().lang;
  stage.replaceChildren(target);

  const board = makeElement("div", "board");
  if (it.prefix) board.append(drawGlyph({ print: "", cells: [it.prefix], role: "num" }, table()));
  pad = makePad();
  board.append(pad.element);

  const check = makeElement("button", "primary", "Check");
  check.type = "button";
  check.id = "check";
  check.addEventListener("click", answerWrite);
  const keys = makeElement("p", "keys");
  keys.innerHTML = "Tap the dots, or use the brailler keys <kbd>F</kbd> <kbd>D</kbd> <kbd>S</kbd> for dots 1 2 3 and <kbd>J</kbd> <kbd>K</kbd> <kbd>L</kbd> for 4 5 6. <kbd>Enter</kbd> checks.";
  answerBox.append(board, check, keys);
  pad.buttons[1].focus({ preventScroll: true });
}

function toggleDot(dot) {
  if (!round.answered) pad.toggle(dot);
}

function answerWrite() {
  if (round.answered) return;
  const it = round.current;
  const yours = pad.cell();
  const right = yours === it.cell;
  const missed = [...it.cell].filter(dot => !yours.includes(dot));
  const extra = [...yours].filter(dot => !it.cell.includes(dot));

  // On the pad: a ring where a dot is missing, a cross on a dot that shouldn't be there
  for (let dot = 1; dot <= 6; dot++) {
    const button = pad.buttons[dot];
    button.disabled = true;
    if (missed.includes(String(dot))) button.classList.add("missed");
    if (extra.includes(String(dot))) button.classList.add("extra");
  }
  byId("check").hidden = true;
  answerBox.querySelector(".keys").hidden = true;

  let message;
  if (right) message = `✓ Right: ${printOf(it)} is ${dotsText(it.cell)}.`;
  else {
    const parts = [];
    if (missed.length) parts.push(`${missed.length === 1 ? "dot" : "dots"} ${missed.join(" ")} ${missed.length === 1 ? "is" : "are"} missing (ringed)`);
    if (extra.length) parts.push(`${extra.length === 1 ? "dot" : "dots"} ${extra.join(" ")} shouldn't be there (crossed)`);
    message = `✗ Not quite: ${printOf(it)} is ${dotsText(it.cell)}. ${capitalise(parts.join(", and "))}.`;
    if (!yours) message = `✗ ${printOf(it)} is ${dotsText(it.cell)}: the missing dots are ringed.`;
  }
  settle(right, message);
}

const capitalise = text => text.charAt(0).toUpperCase() + text.slice(1);

// A missed cell comes back three questions later, once, so it gets a second look while it's fresh.
const COME_BACK = 3;

function settle(right, message) {
  round.answered = true;
  const it = round.current;
  if (right) round.right++;
  else {
    if (!round.missed.includes(it)) round.missed.push(it);
    if (!round.again.has(it.key)) {
      round.again.add(it.key);
      round.queue.splice(Math.min(round.at + 1 + COME_BACK, round.queue.length), 0, it);
      message += " It will come back in a moment.";
    }
  }
  feedback.textContent = message;
  feedback.className = "fb " + (right ? "ok" : "bad");
  feedback.hidden = false;
  nextButton.hidden = false;
  nextButton.textContent = round.at + 1 < round.queue.length ? "Next" : "See how it went";
  nextButton.focus({ preventScroll: true });
}

function next() {
  round.at++;
  if (round.at < round.queue.length) ask();
  else finish();
}

function finish() {
  game.hidden = true;
  done.hidden = false;
  const total = round.queue.length;
  const verdict = round.right === total ? "A clean sheet." : round.right >= total * .75 ? "Nearly there." : "Worth another go.";
  const parts = [
    makeElement("p", "score", `${round.right} of ${total} right`),
    makeElement("p", "verdict", verdict),
  ];

  if (round.missed.length) {
    parts.push(makeElement("p", "lbl", "To look at again"));
    const sheet = makeElement("div", "missed");
    for (const it of round.missed) {
      const glyph = makeElement("span", "glyph");
      glyph.title = `${printOf(it)}: ${dotsText(it.cell)}`;
      const cells = makeElement("span", "cells");
      if (it.prefix) cells.append(drawCell(it.prefix));
      cells.append(drawCell(it.cell));
      glyph.append(cells, makeElement("span", "print", printOf(it)));
      sheet.append(glyph);
    }
    parts.push(sheet);
  }

  const again = makeElement("button", "primary", "Again");
  again.type = "button";
  again.addEventListener("click", startRound);
  parts.push(again);

  const list = currentLevels();
  const after = list[list.findIndex(level => level.id === round.level.id) + 1];
  if (after) {
    const onwards = makeElement("button", "ghost wide", `Next level: ${after.name}`);
    onwards.type = "button";
    onwards.addEventListener("click", () => { levelId = after.id; saveSettings(); showLevels(); startRound(); });
    parts.push(onwards);
  }
  const back = makeElement("button", "ghost wide", "Change language, mode or level");
  back.type = "button";
  back.addEventListener("click", stop);
  parts.push(back);

  done.replaceChildren(...parts);
  again.focus({ preventScroll: true });
}

function stop() {
  round = null;
  game.hidden = true;
  done.hidden = true;
  setup.hidden = false;
}

// ---- Keys: in Read mode type the answer's letter; in Write mode the brailler keys; Enter goes on ----

document.addEventListener("keydown", event => {
  if (!round || game.hidden || event.metaKey || event.ctrlKey || event.altKey) return;
  if (round.answered) {
    if (event.key === "Enter" && document.activeElement !== nextButton) { event.preventDefault(); next(); }
    return;
  }
  if (mode === "write") {
    const dot = BRAILLER_KEYS[event.key.toLowerCase()];
    if (dot) { event.preventDefault(); toggleDot(dot); return; }
    if (event.key === "Enter") { event.preventDefault(); answerWrite(); return; }
    if (event.key === "Backspace" || event.key === "Delete") {
      event.preventDefault();
      pad.clear();
    }
    return;
  }
  if (mode === "read" && event.key.length === 1) {
    const typed = event.key.toLowerCase();
    const button = [...answerBox.querySelectorAll(".choice")].find(b => b.textContent.split(" ").includes(typed));
    if (button) { event.preventDefault(); button.click(); }
  }
});

// ---- Wiring ----

buildLanguageSwitch(byId("langs"), lang, id => { lang = id; showLevels(); });
for (const button of modeSwitch.children) {
  button.addEventListener("click", () => { mode = button.dataset.mode; saveSettings(); showMode(); });
}
setup.addEventListener("submit", event => { event.preventDefault(); startRound(); });
nextButton.addEventListener("click", next);
byId("stop").addEventListener("click", stop);

loadSettings();
// drill.html#read or #write opens in that mode (the Primer links to Write mode)
if (location.hash === "#read" || location.hash === "#write") { mode = location.hash.slice(1); saveSettings(); }
showMode();
showLevels();
