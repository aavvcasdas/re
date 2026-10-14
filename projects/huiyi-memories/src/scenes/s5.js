// s5.js — 拼 · bars 9–13 · 23.195 – 33.319 s · the montage: the picture assembles itself
// The fragment that swallowed the frame opens onto the dark of the room, and the film does the thing
// the title promises: one torn piece at a time, ON THE BEAT, a picture snaps together in mid-air —
// a summer sea, a sun, two small figures. Empty cells wait as dashed outlines; each piece hovers,
// then flies home and stitches to its neighbours. When the last piece lands the sheet glows,
// and then grows past the frame — and the picture inside it becomes the world of s6.
//
// reads: ① 23.2–24.0 the giant fragment opens; twelve dashed cells hanging in the dark
//        ② 24.0–31.0 one piece snaps home on (almost) every beat; the picture appears row by row
//        ③ 31.0–32.4 the finished sheet, stitched, glowing a little
//        ④ 32.4–33.3 it grows past the frame  ·  match cut: the picture becomes the sea
(() => {
  const [T0, T1] = SHOT(4), D = T1 - T0;
  const COLS = 4, ROWS = 3, CW = 104, CH = 78;             // 416 × 234 of picture
  const CX = 480, CY = 246;
  const cellAt = i => [CX - COLS * CW / 2 + (i % COLS) * CW + CW / 2, CY - ROWS * CH / 2 + Math.floor(i / COLS) * CH + CH / 2];
  const SNAP = i => 23.95 + i * BEAT;                      // a piece home on every beat
  const DONE = SNAP(COLS * ROWS - 1) + .3;
  const hover = i => [cellAt(i)[0] + (hash(i * 3.3) - .5) * 640, cellAt(i)[1] + (hash(i * 7.7) - .5) * 400];

  // what each cell of the finished picture holds
  function pic(i, x, y, op) {
    const r = Math.floor(i / COLS), c = i % COLS;
    boilSeed('pic' + i);
    if (r === 0) {
      slab(x - CW / 2, y - CH / 2, CW, CH, SC.skyHi, 1, op);
      if (c === 3) paint(ellPts(x + CW * .18, y - CH * .1, 17, 17, 18, 1), { wash: SC.sun, washOp: op, ink: null });
      if (c === 1) paint(ellPts(x - 10, y - 12, 22, 7, 12, 1.6), { wash: SC.cream, washOp: op * .8, ink: null });
    } else if (r === 1) {
      slab(x - CW / 2, y - CH / 2, CW, CH * .5, SC.skyLo, 1, op);
      slab(x - CW / 2, y, CW, CH * .5, SC.sea, 1, op);
      ln([[x - CW / 2, y], [x + CW / 2, y]], 1, SC.inkSoft, 'inkfine', .06);
      slab(x - CW * .3 + Math.sin(i * 2.7) * 8, y + CH * .2, CW * .5, 3, SC.foam, 1, op * .9);
    } else {
      slab(x - CW / 2, y - CH / 2, CW, CH * .45, SC.seaLt, 1, op);
      slab(x - CW / 2, y - CH * .05, CW, CH * .55, SC.sand, 1, op);
      if (c === 1) { dotAt(x - 8, y + CH * .12, 15, PAL.clay, op); dotAt(x - 8, y - CH * .14, 9, PAL.clay, op); }
      if (c === 2) { dotAt(x + 10, y + CH * .14, 14, SC.you, op); dotAt(x + 10, y - CH * .12, 8.5, SC.you, op); }
      if (c === 3) paint(starPts(x + 6, y - CH * .18, 5, .32, 4), { wash: SC.gold, washOp: op * .9, ink: null });
    }
  }

  shots([[T0, (t, lt) => {
    const done = seg(t, DONE, DONE + .5), grow = easeIn(seg(t, 32.45, T1));
    camBegin(CX, CY + 6 * Math.sin(t * .5), lerp(1.06, .98, ease(seg(lt, 0, 3))));

    // the dark of the room behind the montage: walls, the lamp's glow, a little dust
    room(t, { window: false, frame: false, lampK: .55 });
    glow(CX, CY, 430, SC.lampPool, .10 + .04 * pulse(t, 9));
    dust(t, { x: CX, y: CY, rx: 380, ry: 200, n: 12, k: 1 });

    // the sheet, one cell at a time (scaled as one group at the end, so it grows over the room)
    push(); translate(CX, CY); scale(1 + grow * 7, 1 + grow * 7); translate(-CX, -CY);
    for (let i = 0; i < COLS * ROWS; i++) {
      const [x, y] = cellAt(i), ts = SNAP(i);
      if (t < ts) {                                        // the waiting cell: a dashed outline + its piece, adrift
        const P = rectPts(x - CW / 2 + 5, y - CH / 2 + 5, CW - 10, CH - 10, 2);
        stitch(P.concat([P[0]]), SC.fragLt, .9, 6, 6);
        const [hx, hy] = hover(i);
        frag(t, hx, hy, 30, t * .8 * (i % 2 ? 1 : -1) + i, i + 40, { col: SC.frag, op: 165 });
        continue;
      }
      const fly = easeIn(seg(t, ts - .34, ts));            // the last third of its beat: it flies home
      const [hx, hy] = hover(i);
      const px = lerp(hx, x, fly), py = lerp(hy, y, fly);
      const sc = 1 + .5 * spring(t, ts, 7, 16) * (1 - fly) + (1 - fly) * .5;
      push(); translate(px, py); scale(sc, sc); translate(-x, -y);
      pic(i, x, y, 255);
      boilSeed('piece' + i);
      paint(rectPts(x - CW / 2, y - CH / 2, CW, CH, 2), { wash: null, ink: SC.inkSoft, sw: .9 });
      pop();
      if (fly >= 1) {                                      // stitches to the neighbours already home
        if (i % COLS > 0 && t > SNAP(i - 1)) stitch([[x - CW / 2, y - CH / 2 + 7], [x - CW / 2, y + CH / 2 - 7]], SC.fragDk, 1.1, 6, 5);
        if (i >= COLS && t > SNAP(i - COLS)) stitch([[x - CW / 2 + 7, y - CH / 2], [x + CW / 2 - 7, y - CH / 2]], SC.fragDk, 1.1, 6, 5);
      }
      sparkle(t, x, y - CH / 2, 16, t - ts, .34);          // a spark on the snap
    }
    pop();
    if (done > .02) glow(CX, CY, 340 * done, '#FFE4B0', .34 * done * (.8 + .2 * pulse(t, 10)));
    camEnd();

    // in: the fragment that closed s4 shrinks back off the lens
    const k0 = 1 - seg(lt, 0, .5);
    if (k0 > 0) frag(t, W / 2, H / 2, lerp(500, 1400, easeIn(k0)), 0, 21, { col: SC.frag, edge: k0 > .3, ink: null });
  }]]);
})();
