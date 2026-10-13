// s3.js — 朋友们 (bars 8–12, 12.0–18.0 s)
// Two friends come in from the left: one on a string of balloons, one with a present held in both
// nubs. Clawd turns away from his cake to meet them.
//
// reads: ① two Clawds walk in out of the dark, on the beat, presents first
//        ② he turns around and waves them over to the table
//        ③ the three of them, gathered at the lit cake
(() => {
  const [T0, T1] = SHOT(2), D = T1 - T0, FY = H * .74;
  const TX = W * .715, TY = H * .90, S = W * .052;
  shots([[T0, (t, lt) => {
  // Both props hang off a hand, so they're painted by arm hooks: the hook gets (u, sw) at the arm TIP in
  // arm space. They close over the shot's `t` (define them inside!), because a hook built outside the shot
  // captures the global `t` — the window object — and every coordinate it computes comes out NaN.
  const gift = () => u => {                // a wrapped present, drawn at the end of an arm
    push(); translate(0, -.55 * u);
    paint(rectPts(-.95 * u, -1.1 * u, 1.9 * u, 1.9 * u, .35), { wash: F.teal, ink: null });
    paint(rectPts(-.95 * u, -.42 * u, 1.9 * u, .5 * u, .25), { wash: F.gold, ink: null });
    paint(rectPts(-.22 * u, -1.1 * u, .44 * u, 1.9 * u, .2), { wash: F.gold, ink: null });
    paint([[-.5 * u, -1.1 * u], [-.75 * u, -1.6 * u], [-.1 * u, -1.35 * u]], { wash: F.gold, ink: null });
    paint([[.5 * u, -1.1 * u], [.78 * u, -1.6 * u], [.1 * u, -1.35 * u]], { wash: F.gold, ink: null });
    pop();
  };
  const strings = () => u => {             // a small bunch of balloons, tied to the hand
    push(); translate(0, -.4 * u);
    balloonAt(t, -.1 * u, -2.5 * u, 1.6 * u, F.rose, 1.1);
    balloonAt(t, .95 * u, -2.05 * u, 1.3 * u, F.gold, 2.4);
    pop();
  };
    const stringsHook = strings(), giftHook = gift();     // built here, so the hook closes over THIS t
    camBegin(W * .5, H * .5, lerp(1.035, 1.0, ease(seg(lt, 0, D))));
    room(t, { fy: FY });
    warmPool(TX, TY - H * .22, W * .17, 1, '#FFD08A');       // the lit cake, warming the wall behind it
    // friend A — balloons — walks in and stops left of the cake; friend B follows with the present
    const stA = stroll(t, 12.3, 15.2, -W * .13, W * .175, 24);
    clawd(stA.x, FY + H * .115, 24, { ...emotions(t, [[T0, 'happy'], [12.6, 'excited', { emote: 'spark' }], [15.4, 'happy', { emote: 'hearts' }]]),
                                      view: stA.view, flip: stA.flip, walk: stA.walk, dy: stA.dy, tint: 'rosy', tintK: .35,
                                      armR: stringsHook, boilKey: 'friendA' });
    // the host, standing at the cake: turns from the cake to the door and waves them in
    const host = emotions(t, [[T0, 'happy'], [15.1, 'surprised'], [15.4, 'excited', { emote: '!' }], [16.2, 'happy', { emote: 'hearts' }]]);
    clawd(455, FY + H * .150, 27, { ...host, dy: (host.dy || 0) - .35 * Math.abs(Math.sin(t * TAU / 1.5)) * seg(t, 15.3, 15.6),
                                    ...turn(t, 15.15, 15.85, .25, .75), boilKey: 'host' });
    // friend B — the present — walks in behind and stops in front of the table
    const stB = stroll(t, 12.6, 15.6, -W * .22, W * .345, 25);
    clawd(stB.x, FY + H * .195, 25, { ...emotions(t, [[T0, 'happy'], [13.0, 'nervous'], [15.6, 'happy', { emote: 'music' }]]),
                                      view: stB.view, flip: stB.flip, walk: stB.walk, dy: stB.dy, tint: 'green', tintK: .4,
                                      armL: giftHook, boilKey: 'friendB' });
    const top = tableAt(TX, TY, W * .32);
    cakeAt(t, TX, top - S * .52, S, 3, { candles: 3, seed: 2 });
    // the light that arrives with them, and confetti shaken out of the doorway
    boilSeed('welcome');
    for (let i = 0; i < 8; i++) sparkle(t, W * .09 + hash(i * 3.3) * W * .16, FY - H * .05 - hash(i * 7.7) * H * .34,
                                        W * .012 * (.6 + hash(i * 2.1)), t - 12.35 - i * .07, .9);
    camEnd();
    lyricLine(SC.lines[2], t, lineT(2), lineT(2) + LINE);
    lyricLine(SC.lines[3], t, lineT(3), lineT(3) + LINE);
    flushLetters();
    wipeIn(lt, .75, [F.rose, F.gold]);
  }]]);
})();
