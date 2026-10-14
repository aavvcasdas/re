// config.js: project settings.
//   duration: 78.881 s — exactly 31 bars of the song, cut on a bar line (bar 0 … bar 31).
//   bpm:      94.82. Measured from the audio itself (scripts/beat_grid.py + a kick-onset comb over
//             every section of the file: 94.82 in all four, so nothing drifts).
//   offset:   0.415 s — the song's first downbeat inside the clip. Verified twice against the
//             arrangement: the bass/drums drop lands on beat 28 = bar 7 = 18.133 s to within 7 ms,
//             and the chorus crash lands on bar 13 = 33.32 s.
//   flat:     drop the kit's watercolour fills (FLAT in core.js): one `fill` is +3.2 s a frame here.
//   audio:    assets/song.m4a — the first 78.881 s of the instrumental, faded in and out on bar lines.
const PROJECT = { duration: 78.881, bpm: 94.82, offset: 0.415, flat: true, audio: 'assets/song.m4a' };
