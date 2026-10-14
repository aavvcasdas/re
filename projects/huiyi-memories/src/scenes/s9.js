// s9.js — 烟花 · bars 19–21 · 48.506 – 53.568 s · the sky goes off over the water
// The spark's swell bursts into the first firework, and for two bars the night sky over the water
// goes gold, rose, teal — every burst on a bar line, the big one held a beat longer than physics
// allows. The two of them are just two dark shapes at the tide line, faces up. Then it all dies back
// to ONE ember, falling, and the cut follows it down into the lamp of s10.
//
// reads: ① 48.5–50.4 three bursts answer each other across the sky (L15 on the rose one, beat 74)
//        ② 50.4–52.3 the big gold one, held; its light on the water and on their faces
//        ③ 52.3–53.0 two last small ones (L16, beat 82) while the big one's ash drifts
//        ④ 53.0–53.6 one ember falls out of all of it, down to the bottom of the frame
//        out: the ember blooms — and the bloom is s10's lamp
(() => {
  const [T0, T1] = SHOT(8), D = T1 - T0;
  const HZ = 252, SAND = H * .74;
  const F = [[48.90, 300, 150, SC.gold, 1.0, 1, {}],
             [49.138, 660, 118, SC.rose, 1.1, 2, {}],
             [50.40, 470, 186, SC.teal, .9, 3, {}],
             [51.03, 500, 118, SC.gold, 1.65, 4, { life: 2.3, multi: true, crackle: true }],
             [52.302, 742, 168, SC.violet, 1.0, 5, {}],
             [52.55, 236, 108, SC.teal, .8, 6, {}]];

  shots([[T0, (t, lt) => {
    camBegin(480 + 8 * Math.sin(t * .4), 262, lerp(1.04, 1.1, ease(seg(lt, 0, 2))));
    sea(t, { hz: HZ, nite: 1 });
    beach(t, SAND, { nite: 1 });

    // the bursts, and each one's light laid on the water under it
    for (const [bt, x, y, col, s, seed, o] of F) {
      firework(t, x, y, t - bt, col, s, seed, o);
      const age = t - bt;
      if (age > 0 && age < (o.life ?? 1.4)) glow(x, HZ + 40, 150 * s, col, .16 * (1 - age / (o.life ?? 1.4)));
    }
    // two dark shapes at the tide line, faces up: the whole audience
    clawd(398, 486, 17, { view: 'back', aL: -.2, aR: -.2, rot: 0, boilKey: 'meS' });
    you(572, 488, 16, { view: 'back', aL: -.2, aR: -.2, boilKey: 'youS' });
    boilSeed('shines9');
    paint(ellPts(398, 490, 34, 6, 12, 1.5), { wash: '#C8C4D8', washOp: 56, ink: null });
    paint(ellPts(572, 492, 32, 6, 12, 1.5), { wash: '#C8C4D8', washOp: 52, ink: null });

    // the one ember, falling out of the big burst's ash
    const ek = seg(t, 52.85, T1);
    if (ek > 0) {
      const ex = lerp(500, 480, ek) + Math.sin(t * 3) * 6 * (1 - ek), ey = lerp(150, 452, easeIn(ek));
      glow(ex, ey, 60, '#FFD9A0', .5);
      dotAt(ex, ey, 4.5, SC.gold, 255);
      if (ek > .8) glow(ex, ey, 340 * ease(seg(ek, .8, 1)), SC.lampPool, .55 * ease(seg(ek, .8, 1)));
    }
    camEnd();
    flash((1 - seg(lt, 0, .3)) * .8, SC.cream);            // in: inside the spark's burst
    if (lt > D - .1) flash(seg(lt, D - .1, D) * .7, SC.lampPool);  // out: the ember's bloom
  }]]);
})();
