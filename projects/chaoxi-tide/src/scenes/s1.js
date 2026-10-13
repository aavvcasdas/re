// s1.js — 潮线 (bars 0–8, 0.0–20.65 s)
// Dusk coast. A trail of footprints leads from the near sand down the wet beach toward the
// water; the wanderer walks the tide line along it (from behind, going away); the incoming
// water slides up the sand and takes the trail away behind his.
//
// reads: ① a wide dusk coast, one line of footprints leading toward the sea
//        ② he walks the trail, seen from behind, going away
//        ③ the water slides up the beach and erases the prints, one by one
(() => {
  const [T0, T1] = SHOT(0), D = T1 - T0;
  const hz = H * .475;
  // the trail: far end at the water, near end big in the foreground (perspective)
  const NFAR = 14;
  const trail = [];
  for (let i = 0; i <= NFAR; i++) {
    const u = i / NFAR;                                   // 0 = far (sea), 1 = near (viewer)
    const x = lerp(W * .30, W * .90, u ** .82);
    const y = lerp(hz + H * .075, H * .995, u ** .78);
    trail.push([x, y, lerp(W * .0030, W * .0125, u ** .85)]);   // x, y, size
  }
  const at = u => {                                        // point on the trail, u in 0..1
    const f = clamp(u) * NFAR, i = Math.min(NFAR - 1, Math.floor(f)), k = f - i;
    const a = trail[i], b = trail[i + 1];
    return { x: lerp(a[0], b[0], k), y: lerp(a[1], b[1], k), s: lerp(a[2], b[2], k) };
  };
  shots([[T0, (t, lt) => {
    const walk = seg(lt, .8, D - .5);                      // he walks the trail away from us
    const pos = at(lerp(.86, .34, ease(walk)));            // near → far, so he shrinks as he goes
    camBegin(W * .52, H * .47, 1 + .035 * lt / D);
    seascape(t, { hz, sky: ['#F7DFBE', '#F3D0A2', '#EEBC84', '#E79E63'], sea: F.duskSea, sand: F.wetSand, sandY: .60, sandWob: 6, sandPh: .4, sandOp: 255, dry: F.drySand });
    headland(hz, { x: W * .56, w: W * .40, h: H * .045, sky: F.dusk[2] });
    // the sun on the water: low, hazy, with its column
    moonAt(W * .265, hz - H * .062, H * .040, { halo: .5, haloCol: '#FFD9A0', col: '#FFF1D4', key: 's1sun' });
    glitter(t, W * .265, hz + 3, H * .86, '#FFE6B8', .75);
    waves(t, hz, 4, { col: F.inkSoft, light: '#F6DFC2', amp: .8, sw: .85 });
    // the trail: prints shrink and fade toward the sea; the water eats them from the far end
    const erase = ease(seg(lt, 4.2, D - 2.2));
    boilSeed('prints');
    prints(trail.map(p => [p[0] + jit(p[2] * .4), p[1] + jit(p[2] * .3)]), erase,
           { s: W * .0062, col: '#A78A61', showDead: true, deaths: trail.map((p, i) => i / NFAR) });
    // the foam that does the erasing: slides up the sand on the beat, its edge breaking
    boilSeed('foam');
    const fy = H * .60 - H * .022 * erase - H * .0035 * pulse(t, 5);
    bandEdge(-60, W + 60, u => fy + 7 * Math.sin(u * 3.2 + t * .45) + jit(3), '#F0E5CE', 9, 2, 160 + 60 * erase);
    for (let i = 0; i < 2; i++) { boilSeed('foamln' + i); waveline(t, fy + 3 + i * 5, 2.6, i * 2.1, '#FCF5E6', .9, 4); }
    // he walks the trail, from behind, going away; his size follows the trail's perspective
    wanderer(pos.x, pos.y, Math.max(H * .03, pos.s * 8.5), {
      walk: frac(lt * 1.05), dress: '#EFE2CC', hair: '#3C3548',
      armL: .18, armR: .3, lean: -.05, breath: 1,
    });
    // a wet-sand reflection under him (a short vertical smear) + the light he carries
    boilSeed('refl');
    paint(ellPts(pos.x + pos.s * 1.5, pos.y + pos.s * 5, pos.s * 2.6, pos.s * 9, 10, 1), { wash: '#B29772', washOp: 70, ink: null });
    gull(t * 1.1, W * (.70 - .05 * seg(lt, 0, D)), hz - H * .20, W * .010, { flap: 4.2 });
    gull(t * 1.4, W * (.62 - .04 * seg(lt, 0, D)), hz - H * .155, W * .007, { flap: 5.1, ph: 2 });
    camEnd();
    wipeIn(t, T0, .9);
  }]]);
})();
