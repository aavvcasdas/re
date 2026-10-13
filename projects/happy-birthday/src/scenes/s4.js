// s4.js — 合唱 (bars 12–16, 18.0–24.0 s)
// The present has been opened, the balloons have found a corner. Three Clawds in a row, all mouth
// open, singing at the cake; confetti comes down and the notes go up.
//
// reads: ① three of them, all singing, nothing else in the world
//        ② confetti and music notes: the whole room is in on it
//        ③ the cake sits under it all, still burning
(() => {
  const [T0, T1] = SHOT(3), D = T1 - T0, FY = H * .74;
  const SING = [[W * .26, 'sway', null, 1], [W * .50, 'bounce', 'rosy', .35], [W * .74, 'wave', 'green', .4]];
  shots([[T0, (t, lt) => {
    camBegin(W * .5, H * .47, lerp(1.0, 1.06, ease(seg(lt, 0, D))));
    room(t, { fy: FY, rugX: W * .55 });
    warmPool(W * .62, FY - H * .26, W * .26, 1, '#FFD08A');
    // the three of them, front row, singing: mouth open, notes leaving on the beat
    SING.forEach(([x, style, tint, tintK], i) => {
      boilSeed('sing' + i);
      const sing = emotions(t, [[T0, 'happy'], [T0 + .3 + i * .25, 'laugh'], [T0 + 2.2 + i * .4, 'happy', { mouth: 'open' }],
                                [T0 + 4.0 + i * .3, 'excited', { mouth: 'open' }]]);
      clawd(x, FY + H * .125 + i * H * .008, 19, { ...sing, ...move(style, t, i), mouth: 'open', tint, tintK, boilKey: 'sing' + i });
      // a note leaves each singer and climbs out of frame, growing
      for (let k = 0; k < 2; k++) {
        const ph = frac(t * .42 + i / 3 + k / 2), a = Math.sin(ph * Math.PI);
        if (a > .12) noteAt(t, x + Math.sin(ph * 5 + i) * 46 * ph, FY - H * .02 - ph * H * .58, 7 + ph * 5,
                            -.35 + Math.sin(ph * 4 + i) * .35, F.party[(i + k) % F.party.length], 235 * a);
      }
    });
    // the cake, on the table in the near-left corner of the room
    const top = tableAt(W * .155, H * .96, W * .24);
    cakeAt(t, W * .155, top - W * .058 * .52, W * .058, 3, { candles: 3, seed: 2 });
    confettiT(t, 30, { y0: -60, y1: H * .96 });
    boilSeed('glints');
    for (let i = 0; i < 5; i++) { const age = frac(t * .3 + i * .37) * 1.1; sparkle(t, W * (.08 + hash(i * 9.1) * .84), H * (.15 + hash(i * 4.4) * .5), 11, age, 1.1); }
    camEnd();
    lyricLine(SC.lines[4], t, lineT(4), lineT(4) + LINE, { x: W * .60, y: H * .895 });
    lyricLine(SC.lines[5], t, lineT(5), lineT(5) + LINE, { x: W * .60, y: H * .895 });
    fadeIn(lt, .55);
  }]]);
})();