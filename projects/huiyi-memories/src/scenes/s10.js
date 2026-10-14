// s10.js — 一盏灯 · bars 21–23 · 53.568 – 58.630 s · the ember becomes the lamp
// The bloom of the falling ember is the lamp of the room again: same cushion, same rug, same box —
// but he is calmer. In his hands, one small finished picture (the sea, the two of them: the sheet
// from s5, folded down to a scrap). He looks at it for one line, and then he sets it down in front
// of him, out of his hands, on purpose. The moment it lands, a seam of light starts to open up the
// middle of the frame — the time difference, arriving.
//
// reads: ① 53.6–55.0 the bloom dies into the lamp; him on the cushion, holding one warm scrap
//        ② 55.0–56.9 he looks at it — the sea, the two dots, the sun (L17, beat 87)
//        ③ 56.9–58.0 he sets it down in front of him, deliberately; his hands stay empty
//        ④ 58.0–58.6 a vertical seam of light opens up the middle of the frame (L18, beat 92)
//        out: the seam is 26px wide at the cut — s11 opens inside the split
(() => {
  const [T0, T1] = SHOT(9), D = T1 - T0;
  const U = 30, MX = ROOM.meX, MY = ROOM.meY;
  const DOWN = 56.90, SEAM = B(92);                        // 57.997

  shots([[T0, (t, lt) => {
    const seam = ease(seg(t, SEAM, T1));
    camBegin(lerp(560, 545, ease(lt / D)), lerp(300, 292, ease(lt / D)), lerp(1.16, 1.06, ease(lt / D)));
    room(t, {});
    dust(t, { x: 640, y: 260, rx: 220, ry: 120, n: 10, k: .8 });

    sitBase(MX, MY, U);
    const heldK = 1 - seg(t, DOWN - .35, DOWN);
    const mood = emotions(t, [[T0, 'thinking', { lookX: -.6, lookY: .35 }],
                              [55.6, 'sad', { lookX: -.5, lookY: .45 }],
                              [DOWN + .3, 'sad', { lookX: -.35, lookY: .8 }]]);
    const aL = kf(t, [[T0, 1.0], [DOWN - .35, 1.0], [DOWN, -.42], [T1, -.5]]);
    clawd(MX, MY, U, { ...mood, view: 'q', flip: false, noLegs: true, aL, aR: -.5 + .05 * Math.sin(t * 1.1),
                       armL: (u, sw) => {
                         if (heldK <= .02) return;
                         frag(t, u * 1.5, -u * .3, u * 1.5 * heldK, -.12, 21,
                              { col: SC.frag, edge: true, ink: SC.inkSoft, sw: sw * .7, scene: 'sea', sceneOp: 255 * heldK });
                         glow(u * 1.5, -u * .3, u * 3.4, '#FFD9A0', .22 * heldK);
                       },
                       dy: (mood.dy || 0) + .04, sq: (mood.sq || 0) + .05, boilKey: 'me' });
    sitLegs(MX, MY, U);
    // the picture, set down on the rug in front of him, still warm
    if (heldK < .98) {
      const kk = 1 - heldK;
      frag(t, 512, ROOM.boxY + 16, 24, -.1, 21, { col: SC.frag, edge: true, ink: SC.inkSoft, sw: .9, scene: 'sea', sceneOp: 255 * kk });
      glow(512, ROOM.boxY + 14, 90, '#FFD9A0', .2 * kk);
    }
    floorScene(t, { boxK: .5, scraps: 6 });

    // the seam: one vertical line of morning, prising the frame in two
    if (seam > 0) {
      const w = lerp(1.5, 26, seam);
      boilSeed('seam');
      slab(W / 2 - w / 2, -30, w, H + 60, '#FFF6E0', 2, 235);
      glow(W / 2, H / 2, 130 * seam, '#FFF0D0', .3 * seam);
      for (let i = 0; i < 4; i++)                          // the last stitches across it, straining
        ln([[W / 2 - 20, 110 + i * 92], [W / 2 + 20, 114 + i * 92]], 1.1, SC.fragDk, 'inkfine', .05);
    }
    camEnd();
    flash((1 - easeOut(seg(lt, 0, .55))) * .85, SC.lampPool);   // in: the ember's bloom, dying into the lamp
  }]]);
})();
