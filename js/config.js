/*
 * Exhibit settings — edit these for your booth. No build step needed.
 */
window.PUZZLE_CONFIG = {
  // Puzzle image (relative to index.html).
  image: 'assets/guernica.jpg',

  // Grid. 6 × 3 = 18 pieces = 18 story chapters in js/content.js.
  cols: 6,
  rows: 3,

  // How close (as a fraction of a piece's size) a drop must be to snap into place.
  snapTolerance: 0.28,

  // Sound played when the puzzle is completed. Drop your file at this path.
  // If it is missing and no file was chosen in Settings, a built-in chime plays.
  completionSound: 'assets/audio/complete.mp3',
  volume: 0.9,          // 0 – 1
  soundEnabled: true,   // master switch (also toggleable in Settings)
  snapSound: true,      // soft click when a piece locks into place

  // Starting language: 'es' or 'en'. The last language chosen on the device is remembered.
  defaultLang: 'es',

  // Faint image under the board. ghostOpacity is the normal level, hintOpacity when "Hint" is on.
  ghostOpacity: 0.10,
  hintOpacity: 0.45,

  // Kiosk mode: return to the start screen after this many seconds without interaction (0 = never).
  idleResetSeconds: 120
};
