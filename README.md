# Punktskrift Braille Press

Write a sentence and press it into a page of braille. The cells are embossed one by one onto warm paper, with the print in small type under each cell. Then learn to read them.

Three pages, live at **https://sumpe.github.io/punktskrift/**:

- **[Press](index.html)**: type a sentence and watch it embossed in braille.
- **[Drill](drill.html)**: a game for learning the cells. *Read* shows a cell and you pick its letter; *Write* shows a letter and you build its cell on a six-dot pad, or with the brailler keys F D S J K L.
- **[Primer](primer.html)**: how braille works, in six short sections, each with something to try.

A sibling of Piotrek's Polynoun and Polyverb Tinctures (now in [The Tincture Project](https://github.com/sumpe/tincture)), and dressed the same way.

## What it does

- **Five braillers in one.** It writes uncontracted braille (one cell per letter, no word shortcuts) in **English, Svenska, Deutsch, Polski and Português**. Each language uses its own national cells for accented letters, capitals, numbers and punctuation. So *ö* is ⠪ in Swedish and German but ⠘⠒⠕ (diaeresis, then o) in English, and a full stop is ⠲ in English but ⠄ in the other four.
- **Indicators, labelled.** Capital signs, the number sign and the letter sign get their own cells, as in real braille. The small print under them says *cap*, *caps*, *end*, *num* or *let*. Hovering over one, or tapping it, brings up a short explanation for people who don't read braille.
- **The press at work.** Cells pop up one after another. Press again, hit Esc or click the sheet to finish at once. With reduced motion turned on, the page appears whole.
- **Embossed, not printed.** The dots are drawn in the paper's own colour and shaped only by light and shadow, in both light and dark mode. Real braille proportions: dots 2.5 mm apart, cells 6 mm, lines 10 mm.
- **Print on or off.** A toggle hides the print, leaving the bare sheet.
- **Share, copy, print.** The address holds the language and the sentence (`#sv/hej%20piotrek`). *Copy braille* copies the Unicode braille (⠓⠑⠚), which braille displays and screen readers understand. *Print* prints just the sheet at real braille size, with the dots in ink.
- **Honest about gaps.** A character the chosen braille has no cell for becomes an empty outlined cell, and a note under the sheet names it.

## The Drill

- **Levels in the order braille is taught:** *a–j* (the top four dots), *k–t* (the same shapes plus dot 3), *u–z* (plus dots 3 and 6), the language's own letters (*å ä ö é*, *ä ö ü ß*, *ą ć ę ł ń ó ś ź ż*, *à á â ã ç é ê í ó ô õ ú*), digits, punctuation, and everything mixed.
- **Read:** a big embossed cell and four answers. The wrong answers are cells one or two dots away from the right one, because those are the real mix-ups (*d f h j*, *e i*). Typing the letter works too.
- **Write:** tap the six dots, or use the Perkins brailler finger layout: F D S for dots 1 2 3, J K L for 4 5 6, Enter to check. A missing dot gets a dashed ring and an extra one a cross.
- **Rounds** of 12. A missed cell comes back three questions later; the end of the round shows the score and the cells to look at again. Right and wrong always show with ✓ and ✗ and words, never colour alone.
- `drill.html#write` opens straight in Write mode.

## The Primer

1. **The cell:** the six dots and their numbers. Tap dots on a pad to see what that cell is in the chosen language.
2. **The alphabet's pattern:** ten shapes used three times, with the added dots haloed. Point at a letter to see its row-mates. Why *w* doesn't fit.
3. **Capitals, numbers, signs:** the indicators, shown in the chosen language's own cells, and a small press to type into.
4. **Every country its own braille:** the same words in all five brailles, and what contracted braille is.
5. **Where it came from:** Haüy, Barbier and Louis Braille.
6. **How braille is written:** slate and stylus (with a view of a word as it's punched, backwards and mirrored), the Perkins Brailler, embossers, refreshable displays and Unicode braille.

The chosen language carries across all three pages.

## Use

Nothing to install: open `index.html` in a browser. Enter presses; Shift+Enter starts a new line. Leave the sentence empty to press the language's greeting.

## Files

- `index.html`, `drill.html`, `primer.html`: the three pages.
- `css/site.css`: colours (light and dark), type, nav and footer, copied from Polynoun.
- `css/braille.css`: what all pages share: accents, the slip and its controls, the sheet, cells, dots, the dot pad, the explanation slip.
- `css/press.css`, `css/drill.css`, `css/primer.css`: each page's own layout.
- `js/tables.js`: one braille table per language. The header comment explains every field.
- `js/braille.js`: `translate(text, table)` turns text into lines → words → glyphs → cells. It handles capitals, numbers and signs that depend on context. `toUnicode()` gives the braille as text, and `tableProblems()` checks a table.
- `js/lessons.js`: the Drill's levels (`levels()`), reading a cell back (`lettersFor()`) and close wrong answers (`neighbours()`).
- `js/common.js`: shared by the pages: drawing cells and whole translations, the language switch and its memory, the dot pad, the explanation slip.
- `js/press.js`, `js/drill.js`, `js/primer.js`: each page's own behaviour.
- `tests/index.html` and `tests/cases.js`: open the page in a browser (straight from disk works). It checks that every table cell is a real braille cell, that no two letters share one, that known sentences in each language come out as expected, and that every Drill level is sound (real cells, none shared, close wrong answers).

Scripts are plain `<script src>` files, not modules, so everything works straight from disk and on GitHub Pages.

## Adding a language

1. Add `BRAILLE_TABLES.xx = { … }` to `js/tables.js`, after the others, since the switch follows that order. Fill in every field described at the top of the file and name your source.
2. Add `CASES.xx = [ … ]` to `tests/cases.js`, with a few sentences that exercise its letters, capitals, numbers and punctuation, in dot numbers.
3. Open `tests/index.html`. Every check should pass.

## Limits

- **Uncontracted only.** English grade 2, German Vollschrift and Kurzschrift, and Swedish *kortskrift* all use shortcuts for common words and letter groups. Those are deliberately left out.
- **English** follows UEB grade 1 but doesn't add grade 1 indicators except after numbers. That suits a page that is uncontracted throughout.
- **Caps phrases** (one sign for three or more words in capitals) exist only in English and Swedish. The other languages mark each word.
- **Maths** (fractions, operators beyond + = × ÷) isn't covered.

## Credits

See [CREDITS.md](CREDITS.md) for the sources of the braille tables.

## License

MIT, see [LICENSE](LICENSE).
