# Piotrek's Punktskrift Braille Press

Write a sentence and press it into a page of braille. The cells are embossed one by one onto warm paper, with the print in small type under each cell.

A sibling of Piotrek's Polynoun and Polyverb Tinctures (now in [The Tincture Project](https://github.com/sumpe/tincture)), and dressed the same way.

## What it does

- **Five braillers in one.** It writes uncontracted braille (one cell per letter, no word shortcuts) in **English, Svenska, Deutsch, Polski and Português**. Each language uses its own national cells for accented letters, capitals, numbers and punctuation. So *ö* is ⠪ in Swedish and German but ⠘⠒⠕ (diaeresis, then o) in English, and a full stop is ⠲ in English but ⠄ in the other four.
- **Indicators, labelled.** Capital signs, the number sign and the letter sign get their own cells, as in real braille. The small print under them says *cap*, *caps*, *num* or *let*, and hovering explains it.
- **The press at work.** Cells pop up one after another. Press again, hit Esc or click the sheet to finish at once. With reduced motion turned on, the page appears whole.
- **Embossed, not printed.** The dots are drawn in the paper's own colour and shaped only by light and shadow, in both light and dark mode. Real braille proportions: dots 2.5 mm apart, cells 6 mm, lines 10 mm.
- **Print on or off.** A toggle hides the print, leaving the bare sheet.
- **Share, copy, print.** The address holds the language and the sentence (`#sv/hej%20piotrek`). *Copy braille* copies the Unicode braille (⠓⠑⠚), which braille displays and screen readers understand. *Print* prints just the sheet at real braille size, with the dots in ink.
- **Honest about gaps.** A character the chosen braille has no cell for becomes an empty outlined cell, and a note under the sheet names it.

## Use

Nothing to install: open `index.html` in a browser. Enter presses; Shift+Enter starts a new line. Leave the sentence empty to press the language's greeting.

## Files

- `index.html`: the page.
- `css/site.css`: colours (light and dark), type, nav and footer, copied from Polynoun.
- `css/press.css`: the slip, the language switch, the sheet, the dots, the animation and the print layout.
- `js/tables.js`: one braille table per language. The header comment explains every field.
- `js/braille.js`: `translate(text, table)` turns text into lines → words → glyphs → cells. It handles capitals, numbers and signs that depend on context. `toUnicode()` gives the braille as text, and `tableProblems()` checks a table.
- `js/press.js`: lays the cells out on the sheet and runs the animation, the link, copy and print.
- `tests/index.html` and `tests/cases.js`: open the page in a browser (straight from disk works). It checks that every table cell is a real braille cell, that no two letters share one, and that known sentences in each language come out as expected.

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
