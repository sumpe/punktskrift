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

The English contractions in the Primer (*you can do it*, *and*, *for*, *of*, *the*, *with*) were checked against liblouis's `en-ueb-g2.ctb`.

## The Primer's facts

The history and tools sections were checked against these Wikipedia articles (November 2026): [Braille](https://en.wikipedia.org/wiki/Braille), [Louis Braille](https://en.wikipedia.org/wiki/Louis_Braille), [Charles Barbier](https://en.wikipedia.org/wiki/Charles_Barbier), [Slate and stylus](https://en.wikipedia.org/wiki/Slate_and_stylus), [Perkins Brailler](https://en.wikipedia.org/wiki/Perkins_Brailler), [Braille embosser](https://en.wikipedia.org/wiki/Braille_embosser), [Refreshable braille display](https://en.wikipedia.org/wiki/Refreshable_braille_display) and [Braille Patterns](https://en.wikipedia.org/wiki/Braille_Patterns). Where they disagree (the year Louis Braille first showed his system, 1824 or 1825), the Primer says "at about fifteen".

## Look

The colours, type and layout follow Piotrek's [Polynoun Tincture](https://github.com/sumpe/tincture).
