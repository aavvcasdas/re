// s5.js — 许愿 (bars 16–20, 24.0–30.0 s)
// Close on the cake. Clawd leans in, makes his wish and blows: the flames go out one at a time, each
// leaving a curl of smoke, and the room's light changes over from candle-warm to moonlight.
//
// reads: ① he leans in and thinks about it for a beat
//        ② one puff, three flames out, three threads of smoke
//        ③ the dark blue light that comes in when the candles stop — he did it
(() => {
  const [T0, T1] = SHOT(4), D = T1 - T0;
  const S = 66, CAKE_X = 425, TY = H * 1.00, OUT = [25.72, 25.96, 26.20];
  shots([[T0, (t, lt) => {
    camBegin(540, 420, 1.12);
    room(t, { fy: H * .74, rug: false, picture: false, shelf: false, lamp: false });
    const top = tableAt(CAKE_X, TY, W * .46);
    const cy = top - S * .52, cBase = cy - S * .25, cx = i => CAKE_X + (i - 1) * S * .62;
    const lit = OUT.reduce((k, ti) => k + (1 - seg(t, ti, ti + .18)), 0);
    // the light: candle-warm, then a cold pool out of the window as the room settles
    warmPool(CAKE_X, cy - S * 1.8, S * 3.2, 1 - ease(seg(t, 25.72, 26.7)), '#FFD08A');
    warmPool(W * .775, TY - H * .20, W * .14, ease(seg(t, 26.0, 27.2)), '#C3D6E8');
    cakeAt(t, CAKE_X, cy, S, lit, { candles: 3, seed: 2 });
    // three curls of smoke, rising where the flames were
    for (let i = 0; i < 3; i++) smokeAt(t, cx(i), cBase - S * .9, t - OUT[i] - .12, 4.2);
    // the breath itself: three puffs travelling from his mouth to the wicks
    const blow = seg(t, 25.55, 25.95);
    if (blow > .01 && blow < 1) {
      boilSeed('puff');
      for (let i = 0; i < 3; i++) {
        const p = ease(clamp(blow - i * .07)), px = lerp(700, cx(2 - i) + 34, p), py = lerp(486, cBase - S * .5, p);
        paint(ellPts(px, py, 12 + 34 * p, 9 + 22 * p, 14, 2), { wash: F.cream, washOp: 130 * Math.sin(p * Math.PI), ink: null });
      }
    }
    // Clawd, on the right, in the front view so the take reads: lean in, hold the breath, blow, relax
    const host = emotions(t, [[T0, 'happy'], [T0 + 1.1, 'determined'], [25.55, 'excited', { mouth: 'O', squint: .6 }],
                              [26.3, 'relieved'], [27.0, 'starstruck'], [28.2, 'happy', { emote: 'heart' }]]);
    const lean = ease(seg(t, 25.15, 25.6)) * (1 - ease(seg(t, 26.1, 27.0)));
    const puff = 1 + .06 * Math.exp(-Math.abs(t - 25.75) * 8) * Math.cos((t - 25.75) * 30);
    clawd(760, 620, 27, { ...host, dx: -1.15 * lean + (host.dx || 0), rot: -.10 * lean, sx: puff, sy: 2 - puff,
                          dy: (host.dy || 0) - .3 * lean, boilKey: 'host' });
    camEnd();
    lyricLine(SC.lines[6], t, lineT(6), lineT(6) + LINE);
    lyricLine(SC.lines[7], t, lineT(7), lineT(7) + LINE);
    irisIn(lt, .8, W * .45, H * .60);
  }]]);
})();
