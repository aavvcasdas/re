// s12.js — 纸飞机 · bars 26–29 · 66.224 – 73.817 s · wordless: fold it, throw it, let it go
// No words left in the song. Dawn is coming up the wall of the room while he stands where the
// cushion was and folds the whole assembled picture down: half, on the bar; half again, on the bar;
// and what is left in his hand is a paper plane. On the downbeat of bar 28 he throws it — out across
// the room, through the window, into the morning. The camera lets it go.
//
// reads: ① 66.2–67.5 dawn on the wall; him standing with the finished sheet in both hands
//        ② 67.5–70.6 two folds, each on a bar-line beat; the picture disappears into paper
//        ③ 70.6–71.3 the plane in his hand, drawn back — one beat of held breath
//        ④ 71.3–73.8 THROWN (bar 28 downbeat): across the room, out the window, gone
//        out: a blink of morning light on the cut → s13 in the sky
(() => {
  const [T0, T1] = SHOT(11), D = T1 - T0;
  const U = 30, MX = ROOM.meX, MY = 470;
  const FOLD1 = BARt(26) + 2 * BEAT, FOLD2 = BARt(27) + 2 * BEAT;   // 67.490 / 70.021
  const THROW = BARt(28);                                           // 71.287
  const HAND = [MX - 4.6 * U, MY - 6.2 * U];
  const WIN = { x: ROOM.winX, y: ROOM.winY, w: ROOM.winW, h: ROOM.winH };

  shots([[T0, (t, lt) => {
    const dawn = ease(seg(lt, .3, 5.6)) * .85;
    const thrown = seg(t, THROW, THROW + 1.9);
    // the camera stays with him, then lets the plane take it left, then gives him back the frame
    const pan = Math.sin(ease(seg(t, THROW, THROW + 1.5)) * Math.PI);
    camBegin(lerp(560, 420, pan) + 6 * Math.sin(t * .4), lerp(296, 262, pan * .8), lerp(1.06, 1.14, pan * .5 + .0));

    room(t, { dawn, lampK: 1 - dawn * .85 });
    dust(t, { x: 500, y: 240, rx: 260, ry: 140, n: 12, k: 1 + dawn });

    // him, standing now, with the sheet in both hands; then the folds; then the throw
    const mood = emotions(t, [[T0, 'thinking', { lookX: -.4, lookY: .3 }],
                              [FOLD2 + .4, 'determined', { lookX: -.6, lookY: -.2 }],
                              [THROW + .3, 'happy', { lookX: -.9, lookY: -.7 }]]);
    const aR = kf(t, [[T0, .55], [FOLD1 - .3, .55], [FOLD1, 1.05], [FOLD2 - .3, .95], [FOLD2, 1.15],
                      [THROW - .35, .55], [THROW, 1.5], [THROW + .5, .9], [T1, .5]]);
    const aL = kf(t, [[T0, .75], [FOLD1, .95], [FOLD2, .85], [THROW - .35, .5], [THROW, .2], [T1, -.3]]);
    sitBase(MX, 452, U, dawn);                              // the cushion, empty on the rug behind him
    clawd(MX, MY, U, { ...mood, view: 'q', flip: true, aL, aR,
                       dy: (mood.dy || 0) - .1 * pulse(t, 104), boilKey: 'me' });
    // the sheet in his hands: the whole picture, folding away on the beats
    if (thrown <= .01) {
      const f1 = ease(seg(t, FOLD1, FOLD1 + .55)), f2 = ease(seg(t, FOLD2, FOLD2 + .55));
      const wS = lerp(118, 59, f1), hS = lerp(82, 41, f2);
      const [hx, hy] = [MX - 4.9 * U, MY - 6.0 * U];
      push(); translate(hx, hy); rotate(-.14 + f1 * .1 + Math.sin(t * 1.2) * .02);
      boilSeed('sheet');
      slab(-wS / 2, -hS / 2, wS, hS * .45, mixCol(SC.skyHi, SC.dawnHi, dawn * .5), 2);
      slab(-wS / 2, -hS * .05, wS, hS * .3, SC.sea, 2);
      slab(-wS / 2, hS * .22, wS, hS * .28, SC.sand, 2);
      if (f1 < .5) { dotAt(-wS * .12, hS * .28, 7, PAL.clay, 255 * (1 - f1 * 2)); dotAt(wS * .1, hS * .3, 6, SC.you, 255 * (1 - f1 * 2)); }
      if (f1 > .02 && f1 < 1) ln([[0, -hS / 2], [0, hS / 2]], 1.1, SC.fragDk, 'inkfine', 0);   // the fold
      if (f2 > .02 && f2 < 1) ln([[-wS / 2, 0], [wS / 2, 0]], 1.1, SC.fragDk, 'inkfine', 0);
      paint(rectPts(-wS / 2, -hS / 2, wS, hS, 2), { wash: null, ink: SC.inkSoft, sw: .9 });
      pop();
    }
    // the plane: in his hand for one held breath, then away
    if (t > FOLD2 + .5) {
      const p = thrown > 0 ? arcPt(HAND, [WIN.x + WIN.w * .42, WIN.y + WIN.h * .42], 90, easeOut(Math.min(1, thrown / .68))) : HAND;
      const s = thrown > 0 ? lerp(30, 5, easeIn(Math.min(1, thrown / .85))) : 30;
      const rot = thrown > 0 ? lerp(-.5, -.22, Math.min(1, thrown)) + Math.sin(t * 9) * .04 : -.5 + Math.sin(t * 2) * .05;
      if (thrown < .86) {
        paperPlane(t, p[0], p[1], s, rot, { col: SC.frag, dk: SC.fragDk, trail: thrown > .05 });
        if (thrown > .05) {                                 // a ribbon of morning behind it
          const tr = [];
          for (let i = 0; i < 6; i++) {
            const kk = Math.max(0, Math.min(1, (thrown - i * .07) / .68));
            tr.push(arcPt(HAND, [WIN.x + WIN.w * .42, WIN.y + WIN.h * .42], 90, easeOut(kk)));
          }
          boilSeed('planetrail');
          paint(ribbon(through(tr, 5), 4, 1), { wash: SC.dawnLo, washOp: 130, ink: null });
        }
      }
    }
    floorScene(t, { boxK: .25, scraps: 3, lamp: 1 - dawn * .85, dawn });
    camEnd();
    tearIn(lt, .6, [SC.frag, SC.fragDk]);                   // in: the sheet from s11 drags off
    if (lt > D - .12) flash(seg(lt, D - .12, D) * .55, '#FFF0D8');  // out: a blink of morning on the cut
  }]]);
})();
