// s8.js — 疯狂的寻觅你的身影 (bars 48–56, 123.9–144.5 s)
// Night, and she is walking the beach looking for someone who is not there: the camera
// holds wide, she crosses the whole frame, and the sea keeps giving back her own prints.
//
// reads: ① the night coast, one small figure walking with a light ② the prints behind her
//        are her own, and the sea takes them as she passes ③ she stops, looks out at the water, and goes on
(() => {
  const [T0, T1] = SHOT(7), D = T1 - T0;
  const hz = H * .42;
  const walkY = H * .545;                                  // the wet-sand line she walks along
  shots([[T0, (t, lt) => {
    const k = seg(lt, .3, D - .3);
    const gx = lerp(W * .88, W * .10, ease(k));             // right → left across the whole frame
    const speed = .55 + .45 * Math.abs(Math.sin(k * Math.PI * 1.4));   // she speeds up and slows
    const stop = clamp(Math.max(seg(lt, D * .42, D * .52) - seg(lt, D * .66, D * .80), 0));  // one stop to look
    camBegin(W * .5 + W * .02 * Math.sin(lt * .2), H * .52, 1.04 + .02 * lt / D);
    seascape(t, {
      hz, sky: ['#0F142A', '#161C38', '#1F2548', '#28305A'], sea: ['#24365A', '#2C4066', '#354972'],
      sand: '#7E8AA0', dry: '#95A0B4', sandY: .60, sandWob: 6, sandPh: 1.4, sandOp: 245,
      hzCol: '#6E86A8', hzSw: 1.2,
    });
    starField(t, 34, { top: .40, col: '#E8EFFF', s: .95 });
    moonAt(W * .16, H * .13, H * .030, { halo: .35, crescent: true, sky: '#161C38', key: 's8moon' });
    glitter(t, W * .16, hz + 4, H * .9, '#D2DEEE', .4);
    waves(t, hz, 4, { col: '#8CA4C0', light: '#BCCBE0', amp: .8, sw: .85 });
    // her prints: laid down behind her and taken by the water shortly after
    const trail = [], N = 9;
    for (let i = 0; i < N; i++) {
      const u = (i + 1) / N;                                // 1 = oldest, at the far right
      const px = gx + (W * .88 - W * .10) * -(1 - ease(clamp(k))) * 0 + lerp(gx, W * .90, u);  // behind her = toward where she came from
      trail.push([px, walkY + H * .012 + H * .004 * Math.sin(i * 2.1), W * .0016]);
    }
    boilSeed('prints8');
    prints(trail, ease(seg(lt, 1.2, D - .4)), {
      s: W * .0020, col: '#4E5666', showDead: false, op: 210,
      deaths: trail.map((p, i) => .35 + .5 * (i / N)),
    });
    // the foam that keeps taking them, one long slow slide up the sand
    boilSeed('foam8');
    const fy = H * .60 - H * .020 * ease(seg(lt, 1.5, D - .6)) - H * .003 * pulse(t, 5);
    bandEdge(-60, W + 60, u => fy + 7 * Math.sin(u * 3.0 + t * .35) + jit(3), '#B9C9DC', 9, 2, 130);
    waveline(t, fy + 4, 2.6, 1.1, '#D6E2F0', .9, 5);
    // she walks: seen from behind, small, a lamp in her right hand
    girl(gx, walkY - H * .012, H * .115, {
      walk: frac(lt * 1.15 * speed), dress: '#CFCADC', hair: '#2C2840', hairSway: .3 + .2 * Math.sin(lt * .9),
      armL: .22, armR: .95 - .35 * stop, lean: -.03, dark: '#38344A',
    });
    // the lamp: a warm coin above her hand, with its glow — the only warm thing in the frame
    boilSeed('lamp');
    const lx = gx + H * .040, ly = walkY - H * .078 - H * .010 * stop + H * .004 * Math.sin(lt * 1.6);
    glow(lx, ly, H * .105, '#FFC98A', .70);
    paint(ellPts(lx, ly, H * .009, H * .011, 12, .4), { wash: '#FFE6B4', ink: null });
    ln([[lx - H * .006, ly + H * .010], [lx + H * .006, ly + H * .010]], 1.0, '#8A7A6A', 'inkfine', .4);
    // her lamp's light falling on the sand
    boilSeed('lamppool');
    paint(ellPts(lx, walkY + H * .012, H * .085, H * .016, 26, 6), { wash: '#F6DEB4', washOp: 80, ink: null });
    // when she stops, she turns a little toward the water
    if (stop > .4) {
      boilSeed('look');
      ln([[gx - H * .012, walkY - H * .062], [gx - H * .030, walkY - H * .070]], 1.2, '#C8C2D4', 'inkfine', .5);
    }
    camEnd();
    fadeIn(lt, .9, '#0F142A');
    irisOut(lt, D, 1.0, W * .18, H * .16, '#141A34');
  }]]);
})();
