// s1.js — 空房间 · bars 0–2 · 0 – 5.477 s · the room before anything happens
// A night room: the cold moon-window on the left, one warm floor-lamp on the right, and between
// them, on a cushion on the rug, him — with a shoebox of torn paper and its scraps spilled around.
// He picks one scrap up and holds it out. It is blank. His shoulders go down on beat 6, exactly
// where the second line starts.
//
// reads: ① 0.0–1.3 a room at night, one lamp, one small figure on the rug (the eye enters at the lamp)
//        ② 1.3–2.8 the box: torn scraps spilled around him; he is sorting them, alone
//        ③ 2.8–4.2 he lifts ONE scrap and looks at it
//        ④ 4.2–5.5 it is blank; he folds; a tear-track  ·  out: the scrap swings into the lens
(() => {
  const [T0, T1] = SHOT(0), D = T1 - T0;
  const U = 30, MX = ROOM.meX, MY = ROOM.meY;
  // the near arm (screen-left, in front of the body): on his knee, out to the box, up with a scrap
  const arm = t => kf(t, [[T0, -.55], [1.05, -.62], [1.75, -.22], [2.55, .38], [3.30, 1.00], [4.21, 1.04], [D, .66]]);
  // the scrap's world position at that arm's tip, for the swing into the lens
  const HAND = [MX - 4.88 * U - 2.2 * U * Math.cos(1.0), MY - 4.5 * U - 2.2 * U * Math.sin(1.0)];

  shots([[T0, (t, lt) => {
    const p = ease(lt / D);
    camBegin(lerp(552, 588, p), lerp(296, 306, p), lerp(1.10, 1.16, p));
    room(t, {});
    dust(t, { x: 700, y: 260, rx: 210, ry: 120, n: 13, k: .85 });

    sitBase(MX, MY, U);
    // him: sad, then a flicker of thinking as the scrap comes up, then cry on beat 6
    const mood = emotions(t, [[T0, 'sad'], [2.55, 'thinking', { lookX: -.85, lookY: -.25 }],
                              [4.21, 'cry', { lookX: -.65, lookY: -.15 }]]);
    const held = seg(t, 2.35, 2.75);
    const scrapHand = (u, sw) => {
      if (held <= .02) return;
      frag(t, u * 1.55, -u * .25, u * 1.45 * held, -.35 + Math.sin(t * 1.3) * .05, 7,
           { col: SC.frag, edge: true, ink: SC.inkSoft, sw: sw * .8, op: 255 * held });
    };
    clawd(MX, MY, U, { ...mood, view: 'q', flip: false, noLegs: true, aL: arm(t),
                       aR: -.55 + .06 * Math.sin(t * 1.1), armL: scrapHand,
                       dy: (mood.dy || 0) - .14 * pulse(t, 7), sq: (mood.sq || 0) + .05, boilKey: 'me' });
    sitLegs(MX, MY, U);
    // the tear, from the far eye, once the line says 哭泣
    const age = t - 4.42;
    if (age > 0) tearDrop(t, MX - 1.0 * U, MY - 5.05 * U, age, .9);

    floorScene(t, { boxK: 1, boxS: 1.15, scraps: 10 });
    camEnd();

    // in: the film opens out of ink
    fadeIn(lt, 1.25, SC.ink);
    // out: the scrap he is holding swings up into the lens and covers the frame — s2 opens inside it
    const k = seg(lt, D - .62, D);
    if (k > 0) {
      const [hx, hy] = toScreen(HAND[0], HAND[1], LAST_CAM);
      frag(t, lerp(hx, W / 2, ease(k)), lerp(hy, H / 2, ease(k)), lerp(40, 1250, easeIn(k)),
           lerp(-.35, -.08, k), 7, { col: SC.frag, edge: k > .35, ink: null });
    }
  }]]);
})();
