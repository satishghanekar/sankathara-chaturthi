# Fonts

Copied from Google Fonts so the site needs nothing from Google and works offline.
Each font is split by script the way Google serves it (`-devanagari`, `-kannada`, `-latin`, `-latin-ext`, and `-400`/`-700` where a font has separate weights);
`css/00-fonts.css` lists them with `@font-face` and `unicode-range`, so a browser only downloads the parts a page uses.
`sw.js` and `js/features/offline.js` (the `FONTS` list, from `js/parts.js`) keep the default ones for offline use; the optional text fonts are kept once someone picks them.

| Files | Font | Used for |
|---|---|---|
| `inter-*` | Inter (variable, weights 400–700) | English text, menus |
| `noto-sans-deva-*` | Noto Sans Devanagari (variable, 400–700) | Marathi menus and buttons |
| `tiro-marathi-*` | Tiro Devanagari Marathi | Marathi and Hindi texts, headings |
| `tiro-sanskrit-*` | Tiro Devanagari Sanskrit | Atharvashirsha (Vedic swara marks) |
| `noto-serif-*` | Noto Serif Devanagari + Noto Serif (variable) | Text font: Classic (saved for offline on the first visit) |
| `kalam-*` | Kalam (400, 700) | Text font: Handwritten (saved for offline on the first visit) |
| `noto-sans-kannada-kannada` | Noto Sans Kannada (variable), Kannada letters only | Kannada letters in the Standard font, and the dandas and Vedic marks in every font |
| `noto-serif-kannada-kannada` | Noto Serif Kannada (variable) | Text font Classic, in Kannada (saved for offline on the first visit) |
| `hubballi-kannada` | Hubballi (400) | Text font Handwritten, in Kannada (saved for offline on the first visit) |
| `noto-sans-telugu-telugu`, `noto-sans-gujarati-gujarati` | Noto Sans Telugu, Noto Sans Gujarati (variable), their letters only | Telugu and Gujarati letters in the Standard font (kept once first used) |
| `noto-serif-telugu-telugu`, `noto-serif-gujarati-gujarati` | Noto Serif Telugu, Noto Serif Gujarati (variable) | Text fonts Classic and Handwritten, in Telugu and Gujarati (kept once first used). The Gujarati faces have no ᳚: `js/render.js` writes it ॑॑ there |

All of them are under the SIL Open Font License 1.1 (https://openfontlicense.org), which allows using and
redistributing them with a website. Inter © The Inter Project Authors; Noto Sans Devanagari © Google LLC;
Tiro Devanagari Marathi and Sanskrit © Tiro Typeworks Ltd.; Noto Serif, and Noto Sans and Noto Serif Kannada, Telugu and Gujarati © Google LLC; Hubballi © Erin McLaughlin; Sura © Carolina Giovagnoli; Kalam © Indian Type Foundry.
