# Guernica — Puzle de la memoria / A puzzle of memory

An interactive, bilingual (Spanish / English) jigsaw puzzle of Picasso's *Guernica* for a tech-expo booth.
Each time a piece is placed correctly, a new chapter appears in the side panel. The chapters tell the story of the Spanish Civil War
and include excerpts from Federico García Lorca, Rafael Alberti, Luis Cernuda, Jorge Guillén and Vicente Aleixandre.
A sound plays when the puzzle is completed.

## Run it

There's nothing to install or build. **Open `index.html` in Chrome or Edge.**

At the booth:
1. Open `index.html`, then press **F** (or click the fullscreen button) to go fullscreen.
2. Visitors pick a language on the start screen and press **Empezar / Start**.
3. After 2 minutes without activity, the puzzle goes back to the start screen with a new shuffle.

It works with a mouse and with touch screens, and several people can drag pieces at the same time.

## Completion sound

Put your file at `assets/audio/complete.mp3`, **or** choose a file from **Settings → Completion sound → Choose file…** while the app is running (the browser remembers it).
If there is no file, a built-in chime plays. See [assets/audio/README.md](assets/audio/README.md).

## Keyboard shortcuts (for booth staff)

| Key | Action |
| --- | --- |
| `H` | Show/hide the hint (faint image under the board) |
| `L` | Switch between Spanish and English |
| `F` | Fullscreen |
| `Shift` + `R` | Restart with a new shuffle |
| `Shift` + `D` | Demo: place one random piece (press repeatedly to preview the ending) |
| `Esc` | Close settings |

## Customize

| What | Where |
| --- | --- |
| Grid size, snap tolerance, sound path, volume, default language, idle timeout | `js/config.js` |
| Story chapters, poems, and all interface text (ES + EN) | `js/content.js` |
| Your profile page ("Who made this puzzle?"): intro, why you made it, links | `PROFILE` in `js/content.js` (page: `profile.html`) |
| Colors and layout | `css/styles.css` |
| Puzzle logic | `js/puzzle.js` |

The chapters are revealed in the order they appear in `js/content.js`, one for each correctly placed piece. The 6 × 3 grid has 18 pieces and there are 18 chapters.
If you change the grid, the chapters are spread evenly across the pieces.

## Rights note

- *Guernica* (1937) is by Pablo Picasso and is still under copyright (Succession Picasso, represented in Spain by VEGAP). Check whether showing a reproduction at a public or commercial event requires a license.
- Lorca's poems are in the public domain. The Alberti, Cernuda, Guillén and Aleixandre excerpts are short, attributed quotations of works that are still under copyright. The English versions are translations written for this exhibit.
