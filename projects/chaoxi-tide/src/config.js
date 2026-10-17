// config.js: project settings.
//   duration: 31.84 s — the uploaded 潮汐.MP3, used byte-for-byte as assets/song.mp3 (unmodified).
//   bpm:      118. Kick-comb + lyric-line fit on the clip itself: 118 BPM, 4/4, beat 0.5085 s.
//             Every lyric phrase starts on a beat (two on the half-beat), so cuts ride the same grid.
//   offset:   first downbeat at 0.456 s (the vocal opens with a one-beat pickup before it).
//   flat:     drop the watercolour fills (see FLAT in core.js) — software-GL rendering budget.
//   audio:    the song; --encode muxes it in unmodified.
const PROJECT = { duration: 31.84, bpm: 118, offset: 0.456, flat: true, audio: 'assets/song.mp3' };
