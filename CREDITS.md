# Credits

## Braille tables

The cells in `js/tables.js` were read from the tables of [liblouis](https://liblouis.io/) ([GitHub](https://github.com/liblouis/liblouis)), the open-source braille translator used by NVDA, JAWS, VoiceOver, BRLTTY and many others. No liblouis code or table files are included here; only the cell assignments, which are the published braille standards of each country.

| Language | Standard | liblouis table | Maintained by / based on |
|---|---|---|---|
| English | Unified English Braille, grade 1 | `en-ueb-g1.ctb`, `en-ueb-chardefs.uti` | International Council on English Braille (ICEB) rules |
| Svenska | Svensk punktskrift, oförkortad | `sv-g0.utb`, `sv-6common.uti` | Insyn Scandinavia AB with **Punktskriftsnämnden** (the Swedish Braille Authority, part of MTM), following *Svenska skrivregler för punktskrift* (2009) |
| Deutsch | Deutsche Basisschrift | `de-g0.utb`, `de-g0-core.uti`, `de-chardefs6.cti`, `de-accents.cti` | **SBS**, Schweizerische Bibliothek für Blinde, Seh- und Lesebehinderte, following the Brailleschriftkomitee der deutschsprachigen Länder (BSKDL) |
| Polski | Polski brajl, pełnozapisowy | `Pl-Pl-g1.utb` | liblouis contributors (ViewPlus, JJB Software, Mesar Hameed, Łukasz Golonka) |
| Português | Grafia Braille para a Língua Portuguesa | `pt-pt-g1.utb` | liblouis contributors, following the *Grafia Braille para a Língua Portuguesa* (3rd ed., 2002) |

The euro sign in Polish (⠈⠑) comes from Wikipedia's article on [Polish Braille](https://en.wikipedia.org/wiki/Polish_Braille), since the liblouis Polish table has no entry for it.

If you read braille in one of these languages and spot a wrong cell, please open an issue.

## Look

The colours, type and layout follow Piotrek's [Polynoun Tincture](https://github.com/sumpe/tincture).
