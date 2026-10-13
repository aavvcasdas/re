// s3.js — 夕阳下倒影 (bars 16–22, 41.3–56.8 s)
// Close on the wet sand at sunset: the sun's reflection breaks into a ladder of light
// across the shallow water; he walks through it, and it shatters and reforms around him.
//
// reads: ① the low sun and its reflection across the water ② he steps into the reflection
//        ③ the reflection breaks under his feet and closes again behind his — he is the only one in it
(() => {
  const [T0, T1] = SHOT(2), D = T1 - T0;
  const hz = H * .30;
  const sunX = W * .38;
  shots([[T0, (t, lt) => {
    const walk = ease(seg(lt, .4, D - .6));
    const gx = lerp(W * .10, W * .72, walk), gy = lerp(H * .86, H * .70, walk);
    const gu = H * .085 * (1 - .18 * walk);
    camBegin(W * .45, H * .58, 1.08 + .04 * lt / D);
    seascape(t, { hz, sky: ['#F8DDB8', '#F3CE9C', '#EEB77E', '#E79A5C'], sea: ['#6090A8', '#6E97AE', '#7FA0B6'], sand: F.wetSand, sandY: .58, sandWob: 5, sandPh: .9, dry: F.drySand });
    headland(hz, { x: W * .68, w: W * .30, h: H * .034, sky: F.dusk[2] });
    // the sun, low and big, and its column laid across the water and the wet sand
    moonAt(sunX, hz - H * .045, H * .048, { halo: .6, col: '#FFF3DA', key: 's3sun' });
    glitter(t, sunX, hz + 2, H * .96, '#FFEDC8', 1.05);
    // the running ladder of light on the very shallow water: rungs that shift and break
    for (let i = 0; i < 16; i++) {
      boilSeed('rung' + i);
      const u = i / 15, y = lerp(hz + 4, H * .90, u ** .9);
      const brk = clamp(1 - Math.abs(gx - sunX) / (W * .16)) * clamp(1 - Math.abs(gy - y) / (H * .16));
      const w = W * (.05 + .30 * u) * (1 + .25 * Math.sin(t * 1.7 + i * 1.3)) * (1 - .55 * brk);
      paint(ellPts(sunX + jit(W * .012) + (1 - u) * W * .02 * Math.sin(t * .6 + i), y, w, 1.6 + 2.6 * u, 10, .7),
            { wash: '#FFF0D2', washOp: (70 + 60 * Math.sin(t * 1.5 + i * 1.7)) * (1 - .5 * brk), ink: null });
    }
    waves(t, hz, 3, { col: F.inkSoft, light: '#F8E4C6', amp: .7, sw: .8 });
    // he walks through the light, seen from behind, small: a flat silhouette against it
    wanderer(gx, gy, gu, { walk: frac(lt * 1.1), dress: '#EFE4D2', armL: .2, armR: .26, lean: -.05, breath: 1, dark: F.ink });
    // his own broken reflection under his feet
    boilSeed('gref');
    paint(ellPts(gx, gy + gu * .06, gu * .34, gu * .10, 14, 1.6), { wash: '#C7AE8A', washOp: 120, ink: null });
    camEnd();
    irisIn(lt, .9, sunX, hz, '#E9A468');
    fadeOut(lt, D, 1.1, '#EEB77E');
  }]]);
})();
