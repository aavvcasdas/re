// s9.js — 残月忧郁 星夜静谧 潮落叹息 (bars 56–64, 144.5–165.16 s)
// The tide pools after the water has gone out. The low moon is in them, and so are the
// stars. She comes to the biggest pool, and the two of them are in the water together —
// then the moon goes in and only the sky is left.
//
// reads: ① the tide is out: pools stand on the sand, the moon and stars in each ② she comes
//        to a pool and kneels to it; her reflection is beside the moon's ③ the wind takes the
//        surface; the moon slides out of the pool, and only the sky stays in it
(() => {
  const [T0, T1] = SHOT(8), D = T1 - T0;
  const hz = H * .34;
  const MX = W * .30, MY = H * .235;                       // the moon in the sky
  const pool = [W * .56, H * .74, W * .20, H * .095];       // cx, cy, rx, ry
  shots([[T0, (t, lt) => {
    const arrive = ease(seg(lt, .5, D * .30));
    const wind = ease(seg(lt, D * .52, D * .76));           // the surface breaks
    const leave = ease(seg(lt, D * .80, D - .2));           // the moon goes out of the pool
    const gx = lerp(W * .88, pool[0] - pool[2] * .55, arrive);
    const gy = lerp(H * .80, pool[1] + pool[3] * .95, arrive);
    camBegin(W * .48, H * .58, 1.10 + .05 * lt / D);
    // the sky after the tide: colder still, the last of the night
    seascape(t, {
      hz, sky: ['#0C1124', '#141A34', '#1C2444', '#252E54'], sea: ['#1E2E4E', '#26395C', '#2F4468'],
      sand: '#6E7A90', dry: '#8590A6', sandY: .50, sandWob: 7, sandPh: .8, sandOp: 248,
      hzCol: '#5E7898', hzSw: 1.1,
    });
    starField(t, 40, { top: .34, col: '#E4ECFF', s: 1.0 });
    moonAt(MX, MY, H * .034, { halo: .5, crescent: true, sky: '#141A34', key: 's9moon' });
    waves(t, hz, 3, { col: '#7C94B4', light: '#AEC0D8', amp: .7, sw: .8 });
    // the wet sand plain: three long pale streaks where the water left
    for (let i = 0; i < 3; i++) {
      boilSeed('sheen9' + i);
      const y = H * (.54 + .07 * i);
      paint(ellPts(W * (.3 + .18 * i), y, W * .34, H * .022, 26, 8), { wash: '#8C98AE', washOp: 120 - 16 * i, ink: null });
    }
    // the pools: three small ones and the big one she kneels at
    const pool2 = [[W * .16, H * .62, W * .075, H * .034], [W * .34, H * .86, W * .10, H * .042], [W * .82, H * .66, W * .055, H * .026]];
    for (let i = 0; i < pool2.length; i++) {
      const [cx, cy, rx, ry] = pool2[i];
      boilSeed('pool9' + i);
      paint(ellPts(cx, cy, rx, ry, 30, 6), { wash: '#2B3C5E', ink: null });
      boilSeed('poolrim9' + i);
      paint(ellPts(cx, cy + ry * .10, rx * 1.14, ry * 1.30, 30, 4), { wash: '#7E8899', washOp: 150, ink: null });
      // the sky, the moon and stars in each pool
      boilSeed('poolsky' + i);
      paint(ellPts(cx, cy - ry * .18, rx * .82, ry * .52, 22, 4), { wash: '#3A4C72', washOp: 200, ink: null });
      boilSeed('poolmoon' + i);
      const mk = i === 2 ? 0 : (i === 1 ? .45 : .30);
      paint(ellPts(lerp(cx, cx - rx * .35, mk), cy - ry * .22, Math.min(ry * .34, rx * .16), Math.min(ry * .5, rx * .10), 18, .8),
            { wash: '#EFE9D6', washOp: 200 * (1 - .7 * (i === 0 ? wind : 0)), ink: null });
      for (let s = 0; s < 4; s++) {
        boilSeed('poolst' + i + s);
        dotAt(cx + (hash(i * 5 + s) - .5) * rx * 1.5, cy - ry * .2 + (hash(i * 9 + s) - .5) * ry * .8, .9, '#EAF0FF', 150);
      }
    }
    // the big pool
    boilSeed('pool9big');
    paint(ellPts(pool[0], pool[1], pool[2], pool[3], 34, 7), { wash: '#2E4064', ink: null });
    boilSeed('poolrim9big');
    paint(ellPts(pool[0], pool[1] + pool[3] * .10, pool[2] * 1.14, pool[3] * 1.34, 34, 5), { wash: '#848E9C', washOp: 155, ink: null });
    boilSeed('poolsky9big');
    paint(ellPts(pool[0], pool[1] - pool[3] * .18, pool[2] * .84, pool[3] * .54, 26, 4), { wash: '#3E5178', washOp: 205, ink: null });
    // the moon in the big pool — it slides out of the water as the wind takes the surface
    boilSeed('poolmoon9big');
    const mkx = pool[0] - pool[2] * .30 + pool[2] * .34 * leave, mky = pool[1] - pool[3] * .22 - pool[3] * .55 * leave;
    paint(ellPts(mkx, mky, pool[3] * .38, pool[3] * .34, 22, .9), { wash: '#F1EBD8', washOp: 210 * (1 - .85 * leave), ink: null });
    // wind on the surface: short strokes that multiply with `wind`
    for (let i = 0; i < Math.round(2 + 8 * wind); i++) {
      boilSeed('wind9' + i);
      const a = hash(i + 3) * TAU, r = pool[2] * (.25 + .62 * hash(i + 7));
      const x = pool[0] + Math.cos(a) * r, y = pool[1] + Math.sin(a) * r * .40;
      ln([[x - W * .010, y], [x + W * .010, y + jit(1.0)]], .45, '#CBD6E6', 'inkfine', .5);
    }
    for (let s = 0; s < 6; s++) { boilSeed('pst' + s); dotAt(pool[0] + (hash(s) - .5) * pool[2] * 1.6, pool[1] - pool[3] * .2 + (hash(s + 4) - .5) * pool[3] * .9, 1.0, '#EAF0FF', 140); }
    // she comes to the pool and kneels; her shape doubles in the water beside the moon's
    const kx2 = lerp(W * .90, pool[0] - pool[2] * .62, arrive);
    girl(pool[0] - pool[2] * .62, pool[1] + pool[3] * 1.02, H * .215, {
      dress: '#C9C4D6', hair: '#2A2640', hairSway: .18, squat: .34, breath: 1,
      armL: .55, armR: .5, head: .12, dark: '#363248',
    });
    boilSeed('gref9');
    paint(ellPts(pool[0] - pool[2] * .58, pool[1] + pool[3] * .30, pool[2] * .17, pool[3] * .34, 20, 2),
          { wash: '#8E8CA8', washOp: 120 - 60 * wind, ink: null });
    camEnd();
    fadeIn(lt, .8, '#0C1124');
    irisOut(lt, D, 1.4, MX + H * .02, MY, '#0C1124');
  }]]);
})();
