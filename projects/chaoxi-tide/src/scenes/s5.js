// s5.js — 蓝色的海底 (bars 28–32, 72.3–82.6 s)
// Under the surface. The shell she let go of sinks past the camera, turning slowly, and
// keeps falling into deeper blue while the light above shrinks to a coin.
//
// reads: ① we are underwater: blue, light shafts, the surface overhead ② the shell falls past us,
//        turning ③ it shrinks into the deep and the light above closes to a point
(() => {
  const [T0, T1] = SHOT(4), D = T1 - T0;
  shots([[T0, (t, lt) => {
    const fall = ease(seg(lt, .6, D - .5));
    camBegin(W * .5, H * .42, 1 + .10 * lt / D);
    // the water body: flat bands from lit surface to deep
    boilSeed('deep0');
    band(-40, H * .22, '#2C5A78');
    boilSeed('deep1');
    band(H * .20, H * .46, '#14405C');
    boilSeed('deep2');
    band(H * .44, H * .70, '#103650');
    boilSeed('deep3');
    band(H * .68, H + 60, '#0C2B42');
    // light shafts: thin, and they fade with depth (two stacked quads, no gradient available)
    for (let i = 0; i < 4; i++) {
      boilSeed('sh' + i);
      const x = W * (.12 + .26 * i), w = W * .016, sway = W * .014 * Math.sin(t * .45 + i);
      paint([[x - w, -30], [x + w, -30], [x + w * 1.5 + sway, H * .45], [x - w * 1.5 + sway, H * .45]], { wash: F.lightShaft, washOp: 22, ink: null });
      boilSeed('shb' + i);
      paint([[x - w * 1.4 + sway, H * .45], [x + w * 1.4 + sway, H * .45], [x + w * 1.8 + sway * 1.6, H + 30], [x - w * 1.8 + sway * 1.6, H + 30]], { wash: F.lightShaft, washOp: 8, ink: null });
    }
    // the surface, seen from below: a bright ceiling with a wobbling edge
    boilSeed('surface');
    bandEdgeUp(-60, W + 60, u => H * .062 + 7 * Math.sin(u * 2.6 + t * .9), '#EAF8F4', 9, 2, 250);
    for (let i = 0; i < 6; i++) { boilSeed('surf' + i); waveline(t * 1.2, H * .058 + i * 5, 4, i * 1.7, '#FBFEFB', .9, 4); }
    // the coin of light that stays with her
    boilSeed('coin');
    paint(ellPts(W * .52, H * .035, W * .085 * (1 - .35 * fall), H * .022 * (1 - .35 * fall), 22, 3), { wash: '#FFFDF0', washOp: 190, ink: null });
    glow(W * .52, H * .03, W * .22 * (1 - .25 * fall), '#EAF6E4', .30 * (1 - .5 * fall));
    // the shell, tumbling down and shrinking
    const sy = lerp(H * .18, H * .96, fall), sx = lerp(W * .50, W * .40, fall) + W * .02 * Math.sin(lt * .9);
    const sr = lerp(W * .10, W * .015, fall), rot = lt * .9;
    glow(sx - sr * .4, sy - sr * .5, sr * 2.6, '#BFE3E6', .18);          // it is lit from above
    scallop(sx, sy, sr, Math.sin(rot) * 1.1 + fall * 2.2,
            { col: mixCol('#F5B49A', '#8E5A50', .15 + .55 * fall), ridge: mixCol('#E0937A', '#4E4050', .5 * fall), key: '5' });
    // her bubbles: they rise from the shell as it falls
    if (fall > .05) for (let i = 0; i < 7; i++) {
      boilSeed('bub' + i);
      const u = frac(fall * (1 + .3 * hash(i)) + hash(i + 2));
      dotAt(sx + (hash(i + 11) - .5) * W * .05 - u * W * .01, sy - u * H * .22 - i * 4, (1.4 + 2.2 * hash(i)) * (1 - .4 * u), '#E8F6FA', 160 * (1 - u * .8));
    }
    // drifting motes and two silhouettes of kelp at the edges (depth)
    boilSeed('motes');
    for (let i = 0; i < 16; i++) {
      const u = frac(hash(i) + t * .012 * (1 + hash(i + 3)));
      dotAt(W * hash(i + 20) + W * .02 * Math.sin(t * .4 + i), lerp(H * .1, H * 1.02, u), W * .0016 * (1 + hash(i)), '#CFE6EA', 60 + 60 * hash(i + 5));
    }
    for (const s of [-1, 1]) {
      boilSeed('kelp' + s);
      const kx = W * (.5 + s * .47);
      paint(through([[kx, H + 30], [kx + s * W * .010, H * .78], [kx - s * W * .005, H * .60], [kx + s * W * .013, H * .42], [kx + s * W * .003, H * .24]], 5).concat([[kx + s * W * .028, H * .22], [kx + s * W * .034, H + 30]]),
            { wash: '#08202E', washOp: 235, ink: null });
    }
    camEnd();
    fadeIn(lt, 1.0, '#1E4C68');
    fadeOut(lt, D, 1.0, '#173A52');
  }]]);
})();
