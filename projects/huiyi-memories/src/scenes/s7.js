// s7.js — 雨 · bars 15–17 · 38.382 – 43.444 s · the grey years, and him sweeping the clouds apart
// The same sea, drained: rain, a lid of cloud. He walks into the weather and, with both arms, sweeps
// the cloud apart — and where it opens, one column of summer light falls on 你. Bright scraps stick
// inside the light; the dark ones fall outside it. That is the whole argument of the song in one
// image: he cannot stop the rain, he can only keep one place in it dry for you.
//
// reads: ① 38.4–40.3 grey sea, rain, two small figures under a lid of cloud (the wipe drags off)
//        ② 40.3–41.6 he throws both arms out and SWEEPS the cloud apart (L12 on the sweep, beat 63)
//        ③ 41.6–43.4 one column of light on 你; bright scraps stick in it, dark scraps fall outside
//        out: the light column widens into an iris of warm cream → s8's night opens out of it
(() => {
  const [T0, T1] = SHOT(6), D = T1 - T0;
  const SWEEP = B(63);                                     // 40.279 — L12 and the sweep on the same beat
  const HZ = 208, SAND = H * .70;

  shots([[T0, (t, lt) => {
    const open = ease(seg(t, SWEEP, SWEEP + 1.1));         // the cloud parting
    const colX = 690, colW = lerp(26, 150, open);
    camBegin(lerp(480, 520, ease(lt / D)), 282, lerp(1.06, 1.13, ease(lt / D)));
    sea(t, { hz: HZ, grey: 1 - open * .25, sunK: 0 });
    beach(t, SAND, { grey: 1 });

    // the light column, behind the figures: one warm slab from the hole in the cloud to the sand
    if (open > .02) {
      boilSeed('lightcol');
      paint([[colX - colW * .35, 40], [colX + colW * .35, 40], [colX + colW * .62, SAND + 30], [colX - colW * .62, SAND + 30]],
            { wash: SC.lampPool, washOp: 120 * open, ink: null });
      glow(colX, 70, 220 * open, '#FFE0A0', .6 * open);
      paint(ellPts(colX, SAND + 16, colW * .62, 14, 18, 2), { wash: SC.lampPool, washOp: 140 * open, ink: null });
    }

    // the lid of cloud, in two halves that he pushes apart
    const half = lerp(60, 360, open);
    const lidHalf = (cx, seed, op) => {
      boilSeed('lid' + seed);
      paint(ellPts(cx - 90, 66, 120, 34, 16, 3), { wash: SC.cloudDk, washOp: op, ink: null });
      paint(ellPts(cx + 40, 58, 130, 40, 16, 3), { wash: SC.cloudDk, washOp: op, ink: null });
      paint(ellPts(cx - 20, 40, 150, 36, 16, 3), { wash: SC.cloud, washOp: op * .9, ink: null });
      paint(ellPts(cx + 10, 84, 170, 26, 16, 3), { wash: SC.cloudDk, washOp: op * .8, ink: null });
    };
    lidHalf(250 - half, 1, 250);
    lidHalf(700 + half, 3, 250);
    if (open < .95) {                                      // the seam he is prising open
      boilSeed('lidseam');
      paint(ellPts(480, 56, 120 * (1 - open) + 8, 40 * (1 - open) + 6, 14, 3), { wash: SC.cloudDk, washOp: 240 * (1 - open), ink: null });
    }
    rainAt(t, { n: 46, k: 1 - open * .55 });

    // 你, standing in the light once it comes
    you(colX, 470, 24, { view: 'q', flip: true, ...emotions(t, [[T0, 'sad'], [SWEEP + .8, 'happy', { lookY: -.6 }]]),
                         aL: -.3, aR: -.4, boilKey: 'you' });
    if (open > .3) memoryHalo(colX, 440, 60 * open, open * .8, '#FFE4B0');
    // him, in the weather, both arms out in one long sweep on the beat
    const aSweep = kf(t, [[T0, -.3], [SWEEP - .45, 1.5], [SWEEP, 1.62], [SWEEP + .9, .35], [T1, .15]]);
    const mood = emotions(t, [[T0, 'determined', { lookX: .5, lookY: -.4 }], [SWEEP + .9, 'determined', { lookX: .95, lookY: .1 }]]);
    clawd(452, 474, 26, { ...mood, view: 'q', flip: false, aL: aSweep, aR: aSweep,
                          armL: (u, sw) => { boilSeed('sweeph'); paint(ellPts(0, 0, u * .6, u * .48, 10, 1.4), { wash: PAL.clay, ink: SC.ink, sw: sw * .6 }); },
                          armR: (u, sw) => { boilSeed('sweeph2'); paint(ellPts(0, 0, u * .6, u * .48, 10, 1.4), { wash: PAL.clay, ink: SC.ink, sw: sw * .6 }); },
                          dy: (mood.dy || 0) - .12 * pulse(t, 63), boilKey: 'me' });
    // bright scraps stick inside the light, one per beat; dark ones fall outside it
    for (let i = 0; i < 4; i++) {
      const ts = SWEEP + .9 + i * BEAT;
      if (t > ts) {
        const k = easeOut(seg(t, ts, ts + .5));
        frag(t, colX + (hash(i * 5.1) - .5) * colW * .8, lerp(60, 150 + i * 62, k), 13, Math.sin(t + i) * .2, i + 70,
             { col: i % 2 ? SC.fragLt : '#FFE9C0', edge: true, op: 255 * open });
      }
    }
    for (let i = 0; i < 5; i++) {
      const ts = T0 + .4 + i * .8, fall = seg(t, ts, ts + 1.6);
      if (fall > 0 && fall < 1) frag(t, (i % 2 ? 120 + i * 40 : 860 - i * 30), lerp(60, SAND + 10, easeIn(fall)), 12,
                                     fall * 3 + i, i + 80, { col: SC.greyDk, op: 200 * (1 - fall * .3) });
    }
    camEnd();
    wipeIn(lt, .6, [SC.cloud, SC.cloudDk]);                // in: the grey sheet drags off
    irisClose(lt, D, .7, colX, 300, '#FFE4B0');            // out: the light itself closes the frame
  }]]);
})();
