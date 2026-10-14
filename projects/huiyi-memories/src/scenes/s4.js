// s4.js — 风暴 · bars 7–9 · 18.133 – 23.195 s · SMASH: the room becomes a storm of paper
// The drop lands and every memory in the room is airborne at once. He is on his feet in the middle
// of it, and one big fragment — the one worth catching — comes in from the top right. He catches it
// on beat 30, and his face goes from shock to resolve on beat 31, exactly where the line begins.
//
// reads: ① 18.13–19.4 the drop: white flash, the whole room's paper in the air, him standing in it
//        ② 19.4–21.3 one big fragment arcs in and he CATCHES it (beat 30), two hands on it
//        ③ 21.3–23.2 he holds it up and his face changes — 我要把回忆拼好给你 (L6, beat 33)
//        out: the fragment in his hands grows and swallows the frame → s5 assembles it
(() => {
  const [T0, T1] = SHOT(3), D = T1 - T0;
  const U = 30, MX = 600, MY = 470;
  const CATCH = B(30), HARD = B(31);                       // 19.614 / 20.247
  const HOLD = [MX - 4.7 * U, MY - 5.9 * U];               // where the caught fragment lives: beside his face, not on it

  shots([[T0, (t, lt) => {
    const k = easeIn(seg(t, 18.35, CATCH));                // 0 until it launches, 1 when he has it
    const held = seg(t, CATCH, CATCH + .12);
    const [ox, oy] = shakeXY(t, 7 * (1 - seg(lt, 0, 1.1)));
    camBegin(600 - 40 * ease(seg(lt, 0, 2.2)) + ox, 300 - 12 * ease(seg(lt, 0, 2.2)) + oy,
             lerp(1.24, 1.08, ease(seg(lt, 0, 2.2))));

    // the room, but drowned: only the walls and the lamp's glow survive the storm
    room(t, { window: false, frame: false, lampK: .8 });
    glow(600, 250, 420, SC.lampPool, .12 + .05 * pulse(t, 7));
    dust(t, { x: 560, y: 240, rx: 340, ry: 170, n: 16, k: 1.4 });

    // the storm: two counter-rotating swarms so the paper circles him instead of raining past
    fragSwarm(t, { n: 16, x0: 560, y0: 250, rx: 400, ry: 210, s: 16, rise: .8, spin: 1.1, seed: 11 });
    fragSwarm(t, { n: 12, x0: 560, y0: 260, rx: 330, ry: 170, s: 22, rise: .55, spin: -.8, seed: 12,
                   kinds: ['sea', 'firework', 'umbrella'] });

    // him, on his feet: shock on the drop, resolve on beat 31
    const mood = emotions(t, [[T0, 'surprised'], [HARD, 'determined', { lookX: -.5, lookY: -.4 }]]);
    const aL = kf(t, [[T0, -.4], [18.9, .5], [CATCH, 1.15], [T1, 1.05]]);
    const aR = kf(t, [[T0, .3], [18.9, -.3], [CATCH, .95], [T1, .85]]);
    const hands = (u, sw) => {
      boilSeed('catchhand');
      paint(ellPts(0, 0, u * .6, u * .48, 12, 1.5), { wash: PAL.clay, ink: SC.ink, sw: sw * .7 });
    };
    clawd(MX, MY, U, { ...mood, view: 'q', flip: true, aL, aR, armL: hands, armR: hands,
                       dy: (mood.dy || 0) - .2 * pulse(t, 7), boilKey: 'me' });
    // the one fragment worth catching: arcs in, then sits in both hands and goes up with them
    if (held < .999) {
      const px = lerp(980, HOLD[0], k), py = lerp(60, HOLD[1], k) - Math.sin(k * Math.PI) * 90;
      frag(t, px, py, lerp(30, 62, k), lerp(2.2, -.2, k), 21, { col: SC.frag, edge: true, ink: SC.inkSoft, sw: 1.1 });
      if (k > .1) ln([[980, 60], [px, py]], .8, SC.fragLt, 'inkfine', .12);   // the trail it came in on
    } else {
      frag(t, HOLD[0], HOLD[1] - pulse(t, 31) * 3, 62, -.2 + Math.sin(t * 1.4) * .04, 21,
           { col: SC.frag, edge: true, ink: SC.inkSoft, sw: 1.1 });
      glow(HOLD[0], HOLD[1], 130, '#FFD9A0', .3);
    }
    floorScene(t, { boxK: .55, scraps: 4, lamp: .8 });
    camEnd();

    flash((1 - seg(lt, 0, .35)) * .9, SC.cream);           // in: the smash's white head
    const g = seg(lt, D - .5, D);                          // out: the caught fragment takes the frame
    if (g > 0) {
      const [hx, hy] = toScreen(HOLD[0], HOLD[1], LAST_CAM);
      frag(t, lerp(hx, W / 2, ease(g)), lerp(hy, H / 2, ease(g)), lerp(62, 1400, easeIn(g)), lerp(-.2, 0, g), 21,
           { col: SC.frag, edge: g > .3, ink: null });
    }
  }]]);
})();
