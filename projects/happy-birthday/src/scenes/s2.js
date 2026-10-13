// s2.js — 点蜡烛 (bars 4–8, 6.0–12.0 s)
// Close on the table. Clawd leans in with a lit taper and the three candles catch one after another,
// on the beat, each with its own little flare. Then he stands back and sings.
//
// reads: ① the taper reaches the first wick — a spark, a flame, a glow
//        ② candle two, candle three: the room warms up as they catch
//        ③ he straightens, the cake is lit, and he listens to himself singing
(() => {
  const [T0, T1] = SHOT(1), D = T1 - T0;
  const S = 68, CAKE_X = 430, CAKE_Y0 = H * 1.02, LIGHTS = [6.55, 7.35, 8.15], TAPER_OFF = 9.5;
  shots([[T0, (t, lt) => {
    camBegin(528, 428, 1.06);
    room(t, { fy: H * .74, winX: W * .80, winY: H * .115, rug: false, shelfX: W * .045 });
    // the table and the cake: three cold candles across the frosting
    const top = tableAt(CAKE_X, CAKE_Y0, W * .50);
    const cy = top - S * .52, cBase = cy - S * .25, cx = i => CAKE_X + (i - 1) * S * .62;
    const lit = LIGHTS.reduce((k, ti) => k + seg(t, ti, ti + .30), 0);
    // each flame catching: a flare at the wick, and the room picking up its warmth
    for (let i = 0; i < 3; i++) {
      const age = t - LIGHTS[i];
      if (age > -.05 && age < 1.2) {
        boilSeed('flare' + i);
        sparkle(t, cx(i), cBase - S * .86, S * .55 * (0.4 + (1 - clamp(age / 1.2))), age, 1.2);
        glow(cx(i), cBase - S * .8, S * (1.6 + 3 * clamp(1 - age / 1.2)), '#FFBA5C', .45 * clamp(1 - age / 1.2));
      }
    }
    warmPool(CAKE_X, cy - S * 1.9, S * 3.4, ease(seg(t, 6.55, 9.2)), '#FFD08A');
    cakeAt(t, CAKE_X, cy, S, lit, { candles: 3, seed: 2 });
    // Clawd leans in from the right with the taper, then stands back
    const lead = ease(seg(t, T0, T0 + .5)), back = ease(seg(t, TAPER_OFF, TAPER_OFF + .9));
    const host = emotions(t, [[T0, 'happy'], [6.5, 'excited', { emote: 'spark' }], [7.3, 'excited', { emote: 'spark' }],
                              [8.1, 'starstruck'], [9.5, 'happy', { mouth: 'open', emote: 'music' }]]);
    const tip = () => (u, sw) => {
      if (t > TAPER_OFF + .3) return;
      push();
      paint(rectPts(-0.2 * u, -.13 * u, 2.9 * u, .26 * u, .5), { wash: F.woodDk, ink: null });
      const fx = 2.6 * u, fy = -.06 * u, k = 1 - seg(t, TAPER_OFF, TAPER_OFF + .3);
      paint([[fx - .22 * u, fy + .08 * u], [fx - .1 * u, fy - .38 * u], [fx, fy - .62 * u], [fx + .1 * u, fy - .38 * u], [fx + .22 * u, fy + .08 * u]],
            { wash: F.flame, washOp: 255 * k, ink: null });
      glow(fx, fy - .26 * u, 2.6 * u, '#FFC871', .5 * k);
      pop();
    };
    clawd(742, 620, 28, { ...host, dy: (host.dy || 0) - .5 * lead + .5 * back, aL: lerp(1.16, .3, ease(seg(t, 8.0, 9.0))) - .34 * back + .05 * ring(t, LIGHTS, 7, 16),
                          view: 'q', flip: true, armL: tip(), boilKey: 'host' });
    camEnd();
    irisIn(lt, .85, W * .44, H * .58);
    lyricLine(SC.lines[0], t, lineT(0), lineT(0) + LINE);
    lyricLine(SC.lines[1], t, lineT(1), lineT(1) + LINE);
  }]]);
})();
