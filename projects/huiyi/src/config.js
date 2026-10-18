// config.js: project settings.
//   duration: the film's length in seconds — the full 纯享Beat track (2:22.13).
//   bpm:      95. Measured off the beat track itself (spectral-flux comb: 95.000 BPM, 4/4).
//             One bar = 4 beats = 2.526 s; every lyric line in assets/song.lrc lands on a bar line,
//             so cuts, landings, camera moves and fireworks all ride this grid.
//   offset:   the first downbeat, 0.62 s in (the track opens with a one-beat pickup).
//   flat:     drop the kit's watercolour fills (see FLAT in core.js) — the character kit is full of
//             them, which would put every frame at ~9 s on this software-GL box.
//   audio:    the beat track; --clip / --encode mux it in.
const PROJECT = { duration: 142.13, bpm: 95, offset: 0.62, flat: true, audio: 'assets/song.mp3' };
