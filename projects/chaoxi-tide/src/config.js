// config.js: project settings.
//   duration: the film's length in seconds — 64 bars of the song at 93 BPM (2:45).
//   bpm:      93, the tempo of 《潮汐》 (IN-K / 安苏羽 / 傅梦彤). Every idle, bounce,
//             wave line and cut rides this grid; BAR = 4 * BEAT = 2.5806 s.
//   offset:   the first downbeat. 0 = the film starts on bar 1.
//   audio:    put the song file in assets/ and set it here (or pass --audio=) to mux it in.
const PROJECT = { duration: 165.21, bpm: 93, offset: 0, audio: null };
