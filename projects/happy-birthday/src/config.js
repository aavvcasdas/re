// config.js: project settings.
//   duration: the film's length in seconds — 24 bars of the song in 3/4 (0:36).
//   bpm:      120. 《生日快乐 / Happy Birthday》 is a waltz: three beats to the bar, one chord per bar.
//             Every bounce, candle, cut and lyric line rides this grid; BAR = 3 * BEAT = 1.5 s.
//   offset:   the first downbeat. 0 = the film starts on bar 1.
//   flat:     drop the kit's watercolour fills (see FLAT in core.js) — this film is acted by `clawd()`,
//             which is 8.9 s/frame in full watercolour and ~1.2 s/frame flat.
//   audio:    put the song file in assets/ and set it here (or pass --audio=) to mux it in.
const PROJECT = { duration: 36, bpm: 120, offset: 0, flat: true, audio: null };
