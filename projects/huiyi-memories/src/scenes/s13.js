// s13.js — 结局 · bars 29–31 · 73.817 – 78.879 s · the rhyme: same room, same frame, morning
// Opens inside the window: dawn sky, and the plane a speck with a ribbon behind it. Then the camera
// gives the room back — the same room as the first shot, window left, lamp right, rug, box — but it
// is morning, the lamp is out, the box is empty, and he is standing. He reaches up and puts ONE
// small finished picture into the frame on the wall, where the faded one was. Wide. The last chord
// fades out of the world in warm cream.
//
// reads: ① 73.8–75.0 inside the window: the dawn sky and the plane, a speck, going
//        ② 75.0–76.4 the camera pulls back into the room; he reaches up to the empty frame
//        ③ 76.4–77.4 the picture goes into the frame: the sea, the sun, the two of them — kept
//        ④ 77.4–78.9 wide on the morning room, exactly the first composition, all of it changed
//        out: fade to warm cream, on the last chord
(() => {
  const [T0, T1] = SHOT(12), D = T1 - T0;
  const U = 30, MX = ROOM.meX, MY = 470;
  const PIN = 75.5;

  shots([[T0, (t, lt) => {
    const back = ease(seg(t, 74.9, 76.3));                // 0 = inside the window, 1 = the whole room
    camBegin(lerp(212, 520, back), lerp(150, 296, back), lerp(2.3, .98, back));
    const dawn = .85 + .15 * ease(lt / D);
    room(t, { dawn, lampK: .12, stars: 0 });

    // the plane, a speck in the morning, with its ribbon — only while we are close to the window
    if (back < .8) {
      const k = seg(t, T0, T0 + 2.6);
      const px = lerp(ROOM.winX + ROOM.winW * .40, ROOM.winX + ROOM.winW * .78, easeOut(k));
      const py = lerp(ROOM.winY + ROOM.winH * .40, ROOM.winY + ROOM.winH * .22, easeOut(k));
      const tr = [];
      for (let i = 0; i < 6; i++) {
        const kk = Math.max(0, k - i * .06);
        tr.push([lerp(ROOM.winX + ROOM.winW * .40, ROOM.winX + ROOM.winW * .78, easeOut(kk)),
                 lerp(ROOM.winY + ROOM.winH * .40, ROOM.winY + ROOM.winH * .22, easeOut(kk))]);
      }
      boilSeed('specktrail');
      paint(ribbon(through(tr, 5), 3.4, .8), { wash: SC.cream, washOp: 150 * (1 - back), ink: null });
      paperPlane(t, px, py, lerp(9, 4, k), -.18, { col: SC.frag, dk: SC.fragDk });
    }

    // him, standing in the morning, putting the picture where the faded one was
    const mood = emotions(t, [[T0, 'happy', { lookX: .5, lookY: -.8 }], [76.6, 'happy', { lookX: .3, lookY: -.3 }]]);
    const aR = kf(t, [[T0, .2], [PIN - .5, .3], [PIN, 1.42], [76.5, 1.3], [77.0, .1], [T1, -.2]]);
    const frameK = ease(seg(t, 76.2, 77.2));
    clawd(MX, MY, U, { ...mood, view: 'q', flip: true, aL: -.4, aR,
                       armR: (u, sw) => {
                         boilSeed('pinhand');
                         paint(ellPts(0, 0, u * .6, u * .48, 10, 1.4), { wash: PAL.clay, ink: SC.ink, sw: sw * .6 });
                         if (frameK < .9) frag(t, 0, -u * .9, u * 1.1 * (1 - frameK), -.1, 21,
                                               { col: SC.frag, edge: true, scene: 'sea', sceneOp: 255 * (1 - frameK) });
                       },
                       dy: (mood.dy || 0) - .15 * seg(t, PIN - .4, PIN) * (1 - seg(t, 76.6, 77.1)), boilKey: 'me' });
    // the frame on the wall takes the picture (frameAt draws it from frameK)
    frameAt(ROOM.picX, ROOM.picY, ROOM.picW, ROOM.picH, frameK, t);
    if (frameK > .02 && frameK < 1) sparkle(t, ROOM.picX + ROOM.picW / 2, ROOM.picY + ROOM.picH / 2, 26, (frameK - .02) * 1.4, .8);
    floorScene(t, { boxK: 0, scraps: 2, lamp: .12, dawn });
    camEnd();
    flash((1 - easeOut(seg(lt, 0, .3))) * .4, '#FFF0D8');   // in: the blink from s12's throw
    fadeOut(lt, D, 1.5, '#F7EFDD');                         // out: the last chord, in warm cream
  }]]);
})();
