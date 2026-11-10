# CLAUDE.md — Guernica puzzle

This file is Claude's project memory. **Whenever the user states a new requirement, preference or decision about this project, record it in "User requirements" below (with the date) before finishing the task.** Treat everything listed here as standing instructions.

## What this is
A bilingual (ES/EN) jigsaw puzzle of Picasso's *Guernica* for a **tech-expo booth**. Each correctly placed piece reveals a chapter of
Spanish Civil War history or poetry. Completing the puzzle plays a sound.

## User requirements
- 2026-11-10 — Puzzle made from the Guernica image (`assets/guernica.jpg`) for showing off at a tech expo.
- 2026-11-10 — Every correctly placed piece reveals text about the Spanish Civil War.
- 2026-11-10 — Include work by Federico García Lorca, Rafael Alberti, Luis Cernuda, Jorge Guillén and Vicente Aleixandre.
- 2026-11-10 — Provide a way to play a sound file when the puzzle is completed.
- 2026-11-10 — Everything must be in both English and Spanish.
- 2026-11-10 — Keep this CLAUDE.md updated so Claude remembers everything the user says.
- 2026-11-10 — Finish-screen button label (`UI.playAgain`): Spanish is "Escucha otra vez"; English stays "Play again" (user said not to change the English). The button still restarts the game; only the label changed.
- 2026-11-10 — When the user asks to change text in one language, change only that language. Don't mirror the change into the other language unless asked.
- 2026-11-10 — The Spanish must read as native **Spain** Spanish. Verify it against sources from Spain only: RAE (rae.es, the DPD and the Ortografía), institutions (Instituto Cervantes, Biblioteca Virtual Miguel de Cervantes, Ministerio de la Presidencia, Fundación García Lorca), or Spanish Wikipedia/Wikisource. Don't use Latin American sources for usage.

- 2026-11-10 — The site will also be published on GitHub Pages (project site). Keep every path relative; no root-absolute `/…` URLs. Live URL (checked 2026-11-10): **`https://vperez-stars.github.io/Guernica/`** with a capital G. The lowercase `/guernica/` returns 404, so always use the capitalized form.
- 2026-11-10 — Use the favicons from the user's Portfolio-Site project (`../Portfolio-Site`, "VP" monogram), copied to `assets/icons/`. That project's `site.webmanifest` uses root paths, so this project has its own manifest with relative paths.
- 2026-11-10 — This project uses a **light version** of the VP favicon: bone `#e9e4d8` letters on a dark rounded tile `#151513`, generated from the Portfolio-Site 512 px icon. The Portfolio-Site originals (black VP on solid white) were not changed. `favicon.ico` holds PNG-encoded 16 and 32 px images. The source glyph is cropped at its left and right edges, so the copies are too.
- 2026-11-10 — Creator profile page `profile.html` ("¿Quién ha hecho este puzle?" / "Who made this puzzle?"). It has an intro ("Sobre mí" / "About me"), a "why I made this project" section, and links to the portfolio (`https://vperez-stars.github.io/Portfolio-Site/`), LinkedIn (`linkedin.com/in/ventura-perez`), email (`vperez@icstars.org`) and GitHub (`github.com/vperez-stars`). These details come from `../Portfolio-Site/index.html`. The intro and "why" texts are drafts Claude wrote for the user to rewrite. Don't invent personal details or motives beyond them. The Spanish avoids gendered forms for the user (e.g., "Me dedico al desarrollo de software" rather than "desarrollador").

## Spanish style rules (RAE, verified 2026-11-10)
- Thousands: use a non-breaking space, never a point: `35 000`. Four-digit numbers take no separator: `1654`. Decimals use a comma: `3,49`.
- Numeric ranges take a hyphen with no spaces (`1936-1939`), not an en dash. With month names, write "mayo y junio" or "de julio a noviembre".
- Titles and positions are lowercase: *generalísimo*, *jefe del Estado*. Write *Gobierno* with a capital when it means the institution.
- Nicknames take a lowercase article: *la Pasionaria*, *el Greco*.
- Prize names are capitalized: *Premio Nobel de Literatura*, *Premio Cervantes*.
- Titles of works go in italics. In `content.js`, write them as `_Cántico_`; `rich()` in `puzzle.js` renders them as `<em>`.
- Use «comillas angulares» for quotations.

## Poem excerpts: verification status (2026-11-10)
| Excerpt | Status | Source |
| --- | --- | --- |
| Lorca, *Romance sonámbulo*, lines 1-4 | Verified word for word | 1928 first edition, Revista de Occidente (scan on es.wikisource, validated page) |
| Lorca, *Despedida* (finale) | Verified word for word | Fundación Federico García Lorca (garcia-lorca.org) |
| Alberti, *Galope*, lines 1-5 | Verified word for word ("cuatralbo" is correct) | El Debate (Madrid). Spanish Wikipedia: poem appears in *Capital de la gloria*, published Sept 1937, title given as "Galope, a galopar". El Debate prints it as "A galopar". |
| Cernuda, *Un español habla de su tierra*, 4 lines | Verified; every line starts with a capital, and line 3 ends with a comma | escritores.org, citing *Obra completa* I, 310 |
| Guillén, "El mundo está bien hecho." (*Beato sillón*) | Phrase verified; the line break in the poem is not | RAE, *Boletín* (Bousoño, homage to Guillén); Spanish Wikipedia |
| Aleixandre, *Ciudad del paraíso*, line 1 | Verified by an exact-phrase match | Search hits including the Ministerio de Educación (redined) document. Lines 2-3 could NOT be verified and were removed. |
- Cervantes Virtual and dle.rae.es block automated fetches. Never try to get around a bot check (e.g., by spoofing the User-Agent).
- Fallbacks verified word for word in an official source (Ministerio de la Presidencia, *80 aniversario del exilio republicano*, "La palabra en la música"): Alberti, "Canción 8" (*Baladas y canciones del Paraná*, 1954), and Cernuda, "1936" (*Desolación de la Quimera*, 1962).

## Architecture
- Static site with no build step and no dependencies. **It must keep working when `index.html` is opened directly from disk (`file://`)**, because expo machines may be offline. Use plain `<script>` tags, not ES modules, `fetch`, or CDN fonts/libraries.
- `js/config.js`: booth settings (`window.PUZZLE_CONFIG`). Grid is 6×3 = 18 pieces.
- `js/content.js`: all text (`window.GUERNICA_CONTENT`): `UI` strings, 18 chronological `CARDS`, `PROFILE` (the creator page), and the `FINALE` poem (Lorca, *Despedida*).
- `profile.html` + `js/profile.js`: creator profile page. Its text and links live in `GUERNICA_CONTENT.PROFILE` (`content.js`). It is linked from the puzzle's top bar (`#btn-profile`) and from the start screen. It shares the language choice through `localStorage` `guernica.lang`. After `idleResetSeconds` without activity it returns to `index.html` (kiosk).
- `js/puzzle.js`: engine. Pieces are canvases with jigsaw-shaped `Path2D` outlines. Hit-testing uses `isPointInPath` on the stage (pieces have `pointer-events: none`). Pointer Events support multi-touch. Piece positions are stored in grid units (`ux`, `uy`) so they survive a resize.
- `css/styles.css`: monochrome palette taken from the painting. `--lamp` is the only accent color.
- Completion sound priority: file chosen in Settings (kept in IndexedDB) → `assets/audio/complete.mp3` → built-in WebAudio chime.

## Content rules
- Every user-facing string needs both `es` and `en`. Add UI keys to **both** `UI.es` and `UI.en`.
- Chapters are revealed in array order, so keep `CARDS` chronological. With the default grid, the number of cards equals `cols × rows`.
- Poems: always show the Spanish original. The English translation appears below it when the language is EN.
- Copyright: Lorca (d. 1936) is in the public domain and can be quoted in full. Alberti, Cernuda, Guillén and Aleixandre are still under copyright, so keep their excerpts to about 5 lines or fewer, with author, poem and book attribution. Never invent or "reconstruct" lines. If unsure of exact wording, use a different excerpt.
- Keep historical claims accurate and neutral. Where numbers are disputed (e.g., the Guernica death toll), present the range.

## Verifying changes
- Run `node --check js/*.js` for syntax.
- To check visually, take a headless Edge screenshot at 1600×900. Use `Shift+D` (demo place) to jump to the middle of a game or to the ending.
