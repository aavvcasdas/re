// s2.js — 手心的碎片 · bars 2–4 · 5.477 – 10.539 s · the close-up
// The scrap that covered the lens opens into a close-up: the same torn paper, big, held in two hands,
// and inside it a memory — two figures under one umbrella — lights up, and then goes out. A tear
// lands on the paper and the picture runs. The room behind is only its two lights: warm right, cold left.
//
// reads: ① 5.5–6.9 the scrap in his hands, big; something is drawn on it
//        ② 6.9–8.1 the memory inside lights up: two figures, one umbrella, a strip of sand
//        ③ 8.1–9.4 it goes out — 为何一切 变得如此 (the light dies on beat 12, where the line starts)
//        ④ 9.4–10.5 a tear lands and the picture runs into the paper  ·  out: a tear wipe
(() => {
  const [T0, T1] = SHOT(1), D = T1 - T0;
  const SX = 418, SY = 248, S = 122, ROT = .06;
  const LIT = [[6.90, 7.30], [8.008, 8.42]];         // the memory lights up, then dies on beat 12
  const TEAR = 9.30, LAND = 9.92;

  shots([[T0, (t, lt) => {
    const breathe = Math.sin(t * 1.15) * .012;
    camBegin(SX + 6 * Math.sin(t * .5), SY + 4 * Math.cos(t * .42), 1.62, breathe);

    // the room, but only its light: this close, the furniture is out of frame anyway
    room(t, { lampK: 1 });                                   // the room, but at this distance only its lights read
    pool(W * .88, H * .28, 300, 260, SC.lampPool, 40);        // the lamp, off to the right
    pool(W * .10, H * .26, 260, 240, '#7E9BD8', 30);          // the window, off to the left
    dust(t, { x: 560, y: 210, rx: 160, ry: 90, n: 9, k: .7 });

    // the memory inside: lit, then gone, then run by the tear
    const lit = seg(t, LIT[0][0], LIT[0][1]) * (1 - seg(t, LIT[1][0], LIT[1][1]));
    const wet = seg(t, LAND, LAND + 1.5);
    if (lit > .02) glow(SX, SY + 6, 210 * (.5 + .5 * lit), '#FFD9A0', .5 * lit);
    frag(t, SX, SY, S, ROT, 7, { col: SC.frag, edge: true, ink: SC.inkSoft, sw: 1.2 });
    if (lit > .02) {
      boilSeed('picborder');
      paint(rrPts(SX - 62, SY - 46, 124, 96, 5, 2), { wash: SC.fragLt, washOp: 90 * lit, ink: '#C9B995', sw: .7 });
      fragScene('umbrella', SX, SY + 2, 92, ROT, t, 7, 255 * lit);
    }
    // after the tear: what is left of the picture, running down the paper
    if (wet > .02) {
      push(); translate(SX, SY + 4 + wet * 26); scale(1, 1 + wet * .9); translate(-SX, -(SY + 4));
      fragScene('umbrella', SX, SY + 2, 92, ROT, t, 7, 74 * (1 - wet * .55));
      pop();
      boilSeed('run');
      paint(ribbon(through([[SX - 8, SY + 10], [SX - 2, SY + 40 + wet * 40], [SX + 6, SY + 70 + wet * 52]], 5), 9, 3),
            { wash: '#C9D8E4', washOp: 130 * (1 - wet * .4), ink: null });
    }
    // the tear itself, falling in from above (his eye is out of frame)
    if (t > TEAR && t < LAND + .1) {
      const k = easeIn(seg(t, TEAR, LAND)), ty = lerp(-40, SY - 6, k);
      boilSeed('fallingtear');
      paint(ribbon(through([[SX - 6, ty - 26], [SX - 2, ty - 8], [SX - 6, ty + 12]], 4), 7, 4),
            { wash: '#BBD4E8', washOp: 235, ink: null });
    }
    if (wet > .02) {                                     // the blotch where it landed
      boilSeed('blotch');
      paint(ellPts(SX - 4, SY + 8, 26 * wet + 6, 15 * wet + 4, 16, 2), { wash: '#CBD9E4', washOp: 92, ink: null });
      glow(SX - 4, SY + 8, 60 * wet, '#DDE9F2', .18 * (1 - wet));
    }

    // his hands, gripping the two sides: they tighten once, when the light goes out
    const grip = 1 + .10 * (1 - lit) * seg(t, 8.0, 8.6) + .05 * pulse(t, 8);
    for (const s of [-1, 1]) {
      boilSeed('hand' + s);
      const hx = SX + s * 104 * grip, hy = SY + 44 + Math.sin(t * 1.6 + s) * 3;
      paint(through([[hx - s * 44, hy + 30], [hx - s * 40, hy - 16], [hx + s * 6, hy - 24], [hx + s * 26, hy - 6],
                     [hx + s * 22, hy + 26], [hx - s * 10, hy + 36]], 5),
            { wash: PAL.clay, ink: SC.ink, sw: 1.1 });
      paint(ellPts(hx + s * 14, hy - 16, 13, 9, 12, 1), { wash: PAL.clayLt, ink: SC.ink, sw: .9 });   // the thumb
    }
    camEnd();

    // in: the scrap that covered the lens at the end of s1 shrinks back to this one, exactly onto it
    const k = 1 - seg(lt, 0, .52);
    if (k > 0) {
      const [sx, sy] = toScreen(SX, SY, LAST_CAM);
      frag(t, lerp(sx, W / 2, ease(k)), lerp(sy, H / 2, ease(k)), lerp(S * 1.6, 1250, easeIn(k)),
           lerp(ROT, -.08, ease(k)), 7, { col: SC.frag, edge: k > .3, ink: null });
    }
    // out: a sheet of torn paper takes the frame; s3 opens it
    tearOut(lt, D, .62, [SC.frag, SC.fragDk]);
  }]]);
})();
