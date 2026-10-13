// s2.js — 寻找昔日的足迹 (bars 8–16, 20.65–41.3 s)
// The trail again, seen from a higher, closer angle: she runs along it, catching up to
// the footprints she made; at the end she stops at a shell half-buried in the sand.
//
// reads: ① a line of prints crossing the frame ② she runs in after them, shrinking toward them
//        ③ the prints stop: she stops, kneels, and takes a shell out of the sand
(() => {
  const [T0, T1] = SHOT(1), D = T1 - T0;
  const hz = H * .40;
  const trail = [];
  for (let i = 0; i <= 11; i++) {
    const u = i / 11;
    trail.push([lerp(W * .07, W * .80, u ** .9), lerp(H * .63, hz + H * .09, u ** .82), lerp(W * .0062, W * .0018, u ** .8)]);
  }
  const at = u => { const f = clamp(u) * 11, i = Math.min(10, Math.floor(f)), k = f - i, a = trail[i], b = trail[i + 1]; return { x: lerp(a[0], b[0], k), y: lerp(a[1], b[1], k), s: lerp(a[2], b[2], k) }; };
  shots([[T0, (t, lt) => {
    const run = ease(seg(lt, .6, D * .62));
    const pos = at(lerp(.05, .72, run));
    const stop = seg(lt, D * .66, D * .78), kneel = ease(stop);
    const px = lerp(pos.x, W * .60, kneel), py = lerp(pos.y, H * .70, kneel);
    const psz = lerp(pos.s, W * .0034, kneel);
    camBegin(W * .45, H * .52, 1 + .05 * lt / D);
    seascape(t, { hz, sky: ['#F8E2C4', '#F4D3A8', '#EFBF88', '#E9A468'], sea: F.duskSea, sand: F.wetSand, sandY: .52, sandWob: 5, sandPh: 1.2, dry: F.drySand });
    headland(hz, { x: W * .06, w: W * .26, h: H * .038, sky: F.dusk[2] });
    moonAt(W * .80, hz - H * .05, H * .034, { halo: .4, col: '#FFF1D4', key: 's2sun' });
    waves(t, hz, 3, { col: F.inkSoft, light: '#F6DFC2', amp: .7 });
    // prints: some already fading, the newest sharpest (they are hers)
    boilSeed('prints2');
    prints(trail.map(p => [p[0], p[1], p[2]]), 0,
           { s: W * .0026, col: '#9E7F55', showDead: true, op: 240,
             born: { t: lt, t0: .2, t1: 3.4, at: trail.map((p, i) => i / 11) } });
    // she runs along the line, from behind: legs wide, hair back, dress lifting
    girl(px, py, Math.max(H * .105, psz * 13), {
      walk: frac(lt * 1.5), dress: '#EFE2CC', hair: '#3C3548', hairSway: .7 + .4 * Math.sin(lt * 1.1),
      armL: .5, armR: .62, lean: -.12 - .10 * (1 - kneel), breath: 1, squat: kneel * .6,
      holding: kneel > .55 ? 'shell' : null,
    });
    // the shell she finds: it fades in under her hands as she kneels
    if (kneel > .3) {
      boilSeed('shell');
      const k = ease(seg(kneel, .3, .95)), sx = W * .615, sy = H * .705;
      scallop(sx, sy, W * .0058 * (.5 + k), .2, { col: mixCol('#F0A98E', '#EFD6B4', 1 - k), key: '2', ridges: k > .6 });
      glow(sx, sy, W * .020 * k, '#FFD9A0', .25 * k);
    }
    gull(t * 1.3, W * (.30 - .06 * seg(lt, 0, D)), hz - H * .16, W * .009, { flap: 4.8 });
    camEnd();
    wipeIn(t, T0, .8);
  }]]);
})();
