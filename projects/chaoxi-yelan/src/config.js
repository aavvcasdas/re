// config.js: project settings.
//   duration: 55.99 s — the audio extracted from the uploaded 潮汐.mp4 (ffmpeg -vn -c:a libmp3lame -b:a 192k),
//             used unmodified as assets/song.mp3. It is the full-length version: the 31.84 s clip that
//             projects/chaoxi-tide uses is exactly its opening (onset-envelope cross-correlation peaks at lag 0).
//   bpm:      118. Measured by tools/beat_grid.py on this file (audiomap.json): the 13 sung phrase starts from
//             assets/song.lrc sit on the 118 BPM grid with ±5 ms residual (offset 0.456 s = the first downbeat;
//             the vocal opens one beat earlier, as a pickup). Two phrases start on a half-beat.
//   offset:   first downbeat 0.456 s.
//   flat:     fold watercolour fills into the wash (see FLAT in core.js) — software-GL rendering budget.
//   night:    this film is drawn on NIGHT paper. core.js picks the dark ground + screen-blended paper grain,
//             and light is painted with glow() instead of pigment.
//   audio:    the song; --encode muxes it in unmodified.
const PROJECT = { duration: 55.99, bpm: 118, offset: 0.456, flat: true, night: true, audio: 'assets/song.mp3' };
