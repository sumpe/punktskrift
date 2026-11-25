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
let round = null; // { level, queue, at, right, missed, answered, current }

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
  round = { level, queue: makeQueue(level.items), at: 0, right: 0, missed: [], answered: false, current: null };
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

// Placeholder until Write mode exists
function askWrite(it) {
  askRead(it);
}

function settle(right, message) {
  round.answered = true;
  if (right) round.right++;
  else round.missed.push(round.current);
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
  done.replaceChildren(makeElement("p", "score", `${round.right} of ${round.queue.length} right`));
  const again = makeElement("button", "primary", "Again");
  again.type = "button";
  again.addEventListener("click", startRound);
  const back = makeElement("button", "ghost wide", "Change level");
  back.type = "button";
  back.addEventListener("click", stop);
  done.append(again, back);
}

function stop() {
  round = null;
  game.hidden = true;
  done.hidden = true;
  setup.hidden = false;
}

// ---- Keys: type the answer's letter in Read mode, Enter for the next question ----

document.addEventListener("keydown", event => {
  if (!round || game.hidden || event.metaKey || event.ctrlKey || event.altKey) return;
  if (round.answered) {
    if (event.key === "Enter" && document.activeElement !== nextButton) { event.preventDefault(); next(); }
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
showMode();
showLevels();
