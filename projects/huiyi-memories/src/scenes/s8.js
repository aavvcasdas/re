// s8.js — 夜话 · bars 17–19 · 43.444 – 48.506 s · the night beach, and the thing left unsaid
// The warm iris opens onto the same beach at night: moon road on the water, the two of them small
// at the tide line. On the downbeat of bar 18 — the line 我们说着—— a spark leaves 你's raised hand,
// the un-said sentence, and climbs the sky in a slow spiral while they both watch it. At the top it
// swells and the cut lands inside its burst: the first firework of s9.
//
// reads: ① 43.4–45.9 night water, moon road, two small figures close together (the iris opens warm)
//        ② 45.9–47.6 a gold spark leaves 你's hand and climbs in a spiral (bar 18 downbeat)
//        ③ 47.6–48.5 it reaches the top of the sky and swells — both faces up
//        out: cut inside the swell, a flash → s9's first burst
(() => {
  const [T0, T1] = SHOT(7), D = T1 - T0;
  const LIFT = BARt(18);                                   // 45.976 — the spark leaves on the bar
  const HZ = 236, SAND = H * .72;
  // the spark's climb: a slow spiral up the middle of the sky
  const sparkAt = t => {
    const k = seg(t, LIFT, T1 - .35), a = k * 9.5;
    return [452 + Math.sin(a) * (52 - k * 30) - k * 22, lerp(320, 64, easeOut(k))];
  };

  shots([[T0, (t, lt) => {
    const k = seg(t, LIFT, T1 - .35);
    camBegin(lerp(470, 500, ease(lt / D)), lerp(292, 268, ease(lt / D)), lerp(1.05, 1.12, ease(seg(t, LIFT, T1))));
    sea(t, { hz: HZ, nite: 1 });
    beach(t, SAND, { nite: 1 });

    // 你, with the sentence in your hand; him, close enough to hear what isn't said
    const aRy = kf(t, [[T0, -.35], [LIFT - .5, -.3], [LIFT, 1.25], [T1, 1.1]]);
    you(330, 474, 23, { view: 'q', flip: false, aR: aRy, aL: -.3,
                        ...emotions(t, [[T0, 'happy', { lookX: .4 }], [LIFT + .4, 'happy', { lookX: .3, lookY: -.9 }]]),
                        armR: (u, sw) => { boilSeed('youhand'); paint(ellPts(0, 0, u * .55, u * .45, 10, 1.4), { wash: SC.you, ink: SC.ink, sw: sw * .6 }); },
                        boilKey: 'you' });
    clawd(596, 478, 23, { ...emotions(t, [[T0, 'happy', { lookX: .8 }], [LIFT + .4, 'surprised', { lookX: .4, lookY: -.9 }]]),
                          view: 'q', flip: true, aL: -.4, aR: -.5, boilKey: 'me' });
    boilSeed('shines8');
    paint(ellPts(330, 480, 42, 7, 14, 1.6), { wash: '#C8C4D8', washOp: 70, ink: null });
    paint(ellPts(596, 484, 44, 7, 14, 1.6), { wash: '#C8C4D8', washOp: 64, ink: null });

    // the spark: a gold star with a ribbon of its own trail behind it
    if (t > LIFT) {
      const [sx, sy] = sparkAt(t);
      const trail = [];
      for (let i = 0; i < 7; i++) trail.push(sparkAt(Math.max(LIFT, t - i * .09)));
      boilSeed('sparktrail');
      paint(ribbon(through(trail, 6), 5, 1), { wash: SC.gold, washOp: 150, ink: null });
      glow(sx, sy, 90 + 130 * ease(seg(t, T1 - .8, T1)), '#FFD9A0', .5 + .3 * pulse(t, 72));
      paint(starPts(sx, sy, 9 + 3 * pulse(t, 72) + 26 * ease(seg(t, T1 - .6, T1)), .3, 4), { wash: SC.gold, washOp: 255, ink: null });
      paint(starPts(sx, sy, (9 + 26 * ease(seg(t, T1 - .6, T1))) * .5, .32, 4, .4), { wash: SC.cream, washOp: 240, ink: null });
    }
    camEnd();
    irisOpen(lt, .75, 690, 300, '#FFE4B0');                // in: out of s7's column of light
    if (lt > D - .14) flash(seg(lt, D - .14, D) * .8, SC.cream);   // out: inside the spark's swell
  }]]);
})();
