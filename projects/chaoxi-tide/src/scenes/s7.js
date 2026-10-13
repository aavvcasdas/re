// s7.js — 退守的爱情 / 还剩下回忆 (bars 40–48, 103.25–123.9 s)
// Back on the beach, night. He draws two figures in the wet sand with a stick; a wave
// comes up the beach and takes one of them; he is left with the other.
//
// reads: ① night beach, he is kneeling in the wet sand drawing ② two figures stand in the sand
//        ③ the water slides up and erases one ④ he looks at what is left, and the tide keeps coming
(() => {
  const [T0, T1] = SHOT(6), D = T1 - T0;
  const hz = H * .40;
  const dA = [W * .48, H * .70], dB = [W * .655, H * .755];
  shots([[T0, (t, lt) => {
    const draw = ease(seg(lt, .4, D * .40));
    const wash1 = ease(seg(lt, D * .52, D * .74));      // the first wave takes figure B
    const wash2 = ease(seg(lt, D * .80, D - .3));       // and comes back for the rest
    camBegin(W * .50, H * .66, 1.06 + .03 * lt / D);
    // night: a deep sky, a silver sea, dark wet sand — one palette, cool
    seascape(t, {
      hz, sky: ['#12172E', '#1A2040', '#242B52', '#2E3663'], sea: ['#2A3C60', '#33466C', '#3C5078'],
      sand: '#8E9AAE', dry: '#A4AEC0', sandY: .62, sandWob: 6, sandPh: 2.1, sandOp: 245,
      hzCol: '#7E96B4', hzSw: 1.3,
    });
    starField(t, 30, { top: .38, col: '#E8EFFF', s: .9 });
    // the moon over the water and its cold column
    moonAt(W * .78, H * .145, H * .036, { halo: .45, col: '#F4F1E4', key: 's7moon' });
    glitter(t, W * .78, hz + 4, H * .95, '#DCE6F4', .55);
    waves(t, hz, 4, { col: '#9FB4CE', light: '#C8D6E8', amp: .85, sw: .9 });
    // the foam edge that comes up the beach twice
    const fy = H * .62 - H * .030 * wash1 - H * .026 * wash2 - H * .003 * pulse(t, 5);
    boilSeed('foam7');
    bandEdge(-60, W + 60, u => fy + 7 * Math.sin(u * 3.3 + t * .4) + jit(3), '#D8E3EE', 9, 2, 140 + 70 * (wash1 + wash2) * .5);
    for (let i = 0; i < 2; i++) { boilSeed('foam7l' + i); waveline(t, fy + 3 + i * 5, 2.4, i * 2.3, '#EAF1F8', .9, 4); }
    // the two figures he draws: stick lines in the sand
    const fig = (c, k, x, y) => {
      if (k <= .01) return;
      boilSeed('fig' + c);
      const s = H * .115 * (.86 + .14 * k), l = (pts, w) => ln(pts, w, '#5A6478', 'inkfine', .62);
      l([[x, y - s * 1.52 * k], [x, y - s * .95 * k]], 1.1);                                   // head-torso
      l([[x - s * .62, y - s * 1.16 * k], [x, y - s * 1.34 * k], [x + s * .62, y - s * 1.16 * k]], 1.0);   // arms
      l([[x, y - s * .95 * k], [x - s * .42, y]], 1.1); l([[x, y - s * .95 * k], [x + s * .42, y]], 1.1); // legs
      l([[x - s * .30, y - s * 1.85 * k], [x - s * .34, y - s * 1.62 * k], [x + s * .05, y - s * 1.60 * k],
         [x + s * .30, y - s * 1.84 * k], [x - s * .30, y - s * 1.85 * k]], .9);                 // head, a circle-ish
    };
    fig('A', clamp(draw * 1.6), dA[0], dA[1]);
    fig('B', clamp((draw - .35) * 1.7), dB[0], dB[1]);
    // the water taking B: the prints' sand darkens first, then the line is gone
    if (wash1 > .02) {
      boilSeed('eraseB');
      paint(ellPts(dB[0], dB[1] - H * .028, W * .13 * ease(wash1), H * .105 * ease(wash1), 24, 7), { wash: '#CBD8E6', washOp: 130 * ease(wash1), ink: null });
    }
    // he kneels left of the drawing with the stick, and stays looking at what is left
    const gx = lerp(W * .30, W * .345, draw), gy = H * .80;
    wanderer(gx, gy, H * .275, {
      dress: '#DCD6E2', squat: .30 - .06 * draw, breath: 1,
      armL: .85 - .55 * draw, armR: .30, head: -.10 + .12 * wash1, dark: '#3A3648',
    });
    boilSeed('stick');
    ln([[gx + H * .030, gy - H * .098], [gx + H * .052 - H * .022 * draw, gy - H * .058]], .7, '#7A7A88', 'inkfine', .4);
    camEnd();
    fadeIn(lt, .8, '#12172E');
    fadeOut(lt, D, 1.0, '#1A2040');
  }]]);
})();
