// s6.js — 海 · bars 13–15 · 33.319 – 38.382 s · the picture becomes the world: summer, the two of them
// The sheet that grew past the frame opens INSIDE the picture it was made of: a bright summer sea.
// 你 stands at the water's edge and points at the horizon; he watches 你 instead of the sea. The sea
// keeps the beat with its foam. At the end a cloud slides across the sun and the colour goes out of
// the world — the memory turning grey is the cut into s7.
//
// reads: ① 33.3–34.6 the match cut lands: open water, sun, two small figures (L10 on the cut)
//        ② 34.6–36.5 你 points at the horizon — the whole sea, all of it (beat 54)
//        ③ 36.5–37.8 he does not look at the sea; he looks at 你 (beat 57)
//        ④ 37.8–38.4 a cloud takes the sun; the world drains to grey  ·  out: grey wipe
(() => {
  const [T0, T1] = SHOT(5), D = T1 - T0;
  const POINT = B(54), LOOK = B(57);                       // 34.579 / 36.477
  const HZ = 208, SAND = H * .70;

  shots([[T0, (t, lt) => {
    const grey = ease(seg(t, 37.75, T1));                  // the colour leaving, at the very end
    camBegin(lerp(500, 470, ease(lt / D)), lerp(286, 276, ease(lt / D)), lerp(1.14, 1.05, ease(lt / D)));
    sea(t, { hz: HZ, grey: grey, sunX: 700, sunY: 84 });
    // two gulls, keeping the sky alive
    boilSeed('gulls');
    for (let i = 0; i < 2; i++) {
      const gx = ((t * 26 + i * 420) % (W + 200)) - 100, gy = 96 + i * 34 + Math.sin(t * 1.3 + i) * 6;
      ln([[gx - 8, gy], [gx, gy - 5], [gx + 8, gy]], 1.1, SC.inkSoft, 'inkfine', .1);
    }
    beach(t, SAND, { grey });

    // 你, at the water's edge, pointing the whole sea out to him
    const aRy = kf(t, [[T0, .1], [POINT, .1], [POINT + .5, 1.35], [37.4, 1.30], [T1, .5]]);
    you(322, 470, 24, { view: 'q', flip: false, aR: aRy, aL: -.3,
                        ...emotions(t, [[T0, 'happy'], [POINT, 'happy', { lookX: .9, lookY: -.5 }]]),
                        armR: (u, sw) => { boilSeed('youhand'); paint(ellPts(0, 0, u * .55, u * .45, 10, 1.4), { wash: SC.you, ink: SC.ink, sw: sw * .6 }); },
                        boilKey: 'you' });
    // him, a step back and turned toward 你 — the sea is not what he came to look at
    const mood = emotions(t, [[T0, 'happy', { lookX: .3, lookY: .1 }], [LOOK, 'happy', { lookX: 1.0, lookY: .15 }]]);
    clawd(648, 474, 24, { ...mood, view: 'q', flip: true, aL: -.35, aR: -.5 + .05 * Math.sin(t * 1.2),
                          dy: (mood.dy || 0) - .1 * pulse(t, 53), boilKey: 'me' });
    // the wet shine under both of them
    boilSeed('shines');
    paint(ellPts(322, 476, 44, 7, 14, 1.6), { wash: SC.foam, washOp: 90 * (1 - grey), ink: null });
    paint(ellPts(648, 480, 46, 7, 14, 1.6), { wash: SC.foam, washOp: 80 * (1 - grey), ink: null });
    camEnd();

    // the cloud that ends summer, sliding over the sun
    const ck = seg(t, 37.5, T1 + .4);
    if (ck > 0) cloudAt(t, lerp(880, 700, ease(ck)), 84, 1.5, SC.cloud, 255 * ck, 4);
    wipeIn(lt, .55, [SC.skyHi, SC.cream]);                  // in: the picture's own colours sweep on
    wipeCover(lt, D, .5, [SC.cloud, SC.cloudDk]);            // out: the grey takes the frame, at the cut
  }]]);
})();
