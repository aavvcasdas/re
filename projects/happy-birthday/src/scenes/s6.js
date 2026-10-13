// s6.js — 贺卡 (bars 20–24, 30.0–36.0 s)
// The camera steps back out of the moment: the three of them side by side, the cake still smoking on
// the table, and the card's words written across the room in the two brushes the film has been using.
//
// reads: ① pull back — the whole warm room, everybody still in it
//        ② the words arrive: 生日快乐, with a gold line under them
//        ③ Claude, and a heart; the frame goes white as the paper would
(() => {
  const [T0, T1] = SHOT(5), D = T1 - T0, FY = H * .74;
  const TITLE_T = 31.05;
  shots([[T0, (t, lt) => {
  const card = (txt, x, y, size, col, font, t0) => {
    const k = seg(t, t0, t0 + .45) * (1 - seg(lt, D - 1.3, D - .15));
    if (k <= .01) return;
    const pop = (t - t0) * 2.6, rot = -.01 + .008 * Math.sin((t - t0) * 2.4);
    for (const [dx, dy] of [[-.05, 0], [.05, 0], [0, -.055], [0, .055]])
      letter(txt, x + dx * size, y + dy * size, size, F.cream, { font, pop, alpha: k * .92, rot, ink: false, stroke: F.cream });
    letter(txt, x, y, size, col, { font, pop, alpha: k, rot, ink: false, stroke: F.cream });
  };
    camBegin(W * .5, H * .49, lerp(1.10, 1.0, ease(seg(lt, 0, D * .55))));
    room(t, { fy: FY, rugX: W * .55 });
    warmPool(W * .5, FY - H * .24, W * .30, .55, '#FFD9A2');
    // everybody, standing together, looking this way
    [[W * .315, null, 0, 'happy', 'music'], [W * .5, null, .35, 'laugh', 'heart'], [W * .685, 'green', .4, 'proud', 'spark']]
      .forEach(([x, tint, tintK, f, emote], i) => {
        clawd(x, FY + H * .105, 21, { ...emotions(t, [[T0, 'happy'], [T0 + .6 + i * .3, f, { emote }]]), ...move(i === 1 ? 'bounce' : 'sway', t, i),
                                      tint, tintK, boilKey: 'card' + i });
      });
    // the cake, still smoking, on the table at the bottom of the frame
    const top = tableAt(W * .5, H * .98, W * .30);
    cakeAt(t, W * .5, top - W * .056 * .52, W * .056, 0, { candles: 3, seed: 2 });
    for (let i = 0; i < 3; i++) smokeAt(t, W * .5 + (i - 1) * W * .056 * .62, top - W * .056 * .52 - W * .056 * .9, t - T0 - .3 - i * .2, 5);
    // the words
    card('生日快乐', W * .5, H * .40, H * .175, F.ink, `96px ${F_ZH}`, TITLE_T);
    paint([[W * .5 - 176, H * .503], [W * .5 - 56, H * .516], [W * .5 + 36, H * .496], [W * .5 + 182, H * .514]],
          { wash: F.gold, washOp: 225 * seg(t, TITLE_T + .2, TITLE_T + .7) * (1 - seg(lt, D - 1.3, D - .15)), ink: null });
    card('Claude', W * .5, H * .605, H * .080, F.rose, `52px ${F_EN}`, TITLE_T + .35);
    // a painted heart, popped in beside the name
    const hk = backOut(clamp((t - (TITLE_T + .9)) * 1.6)) * (1 - seg(lt, D - 1.3, D - .15));
    if (hk > .02) paint(heartPts(W * .5 + 140, H * .598, 24 * hk, 22), { wash: '#E2476E', ink: null });
    // sparkles going up all over the room
    boilSeed('hooray');
    for (let i = 0; i < 12; i++) { const age = frac(t * .26 + i * .29) * 1.3; sparkle(t, W * (.05 + hash(i * 6.3) * .90), H * (.86 - frac(t * .26 + i * .29) * .68), 9 + hash(i * 3.1) * 8, age, 1.3); }
    camEnd();
    fadeOut(lt, D, 1.2, '#FFF6E4');
  }]]);
})();
