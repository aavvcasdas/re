// c3.js — 32.86–44.81s | undertow → a salt bloom → the trace it leaves
(() => {
  const s9 = (t, lt, D) => {
    camBegin(W * .50, H * .48, lerp(1.00, 1.13, ease(seg(lt, .15, D))), .025 * Math.sin(lt * .7));
    fillFrame(F.deep);
    cutPoly([[-30, 360], [140, 306], [310, 339], [500, 296], [660, 335], [850, 300], [W + 30, 350], [W + 30, H + 30], [-30, H + 30]], F.deep2, 255, null);
    waterSheet(385, 205, t, F.sea, 9, 1.2, null);
    spiralLines(492, 337, t, 2.35, 310, F.seaLite);
    const q = ease(seg(lt, .35, D - .25));
    const a = -.82 + q * TAU * .72, radius = lerp(190, 65, q);
    const hx = 492 + Math.cos(a) * radius, hy = 337 + Math.sin(a) * radius * .70 + 65;
    seedSprite(hx, hy, HERO_U * .73, t, { face: 'overwhelmed', step: true, tilt: .10 * Math.sin(lt * 2), key: 'undertow-seed', heart: .25 });
    // The companion stays on the bank and reaches across the current; it cannot pull the memory out of the spiral.
    raySprite(784, 418, RAY_U * .72, t, { face: 'sad', tilt: -.06, key: 'undertow-ray' });
    ln([[734, 388], [688, 361], [654, 379], [621, 363]], 1.25, F.gold, 'inkfine', .68);
    for (let i = 0; i < 5; i++) dotAt(690 - i * 15, 374 + Math.sin(t + i) * 4, 2.2, F.goldLite, 160);
    camEnd();
    transition(lt, D, 8);
  };

  const s10 = (t, lt, D) => {
    camBegin(W * .50, H * .49, lerp(1.08, .94, ease(seg(lt, 0, D))), 0);
    fillFrame(F.paper);
    // Macro tide-pool plate: salt-coral blooms outward like a pressed print, not a sky full of fireworks.
    paint(ellPts(490, 297, 390, 275, 40, 2), { wash: F.paperHi, ink: F.seaLite, sw: .7 });
    contourSet(490, 297, 350, 235, 4, F.seaLite, t, .68, 2.8);
    const age = lt + .10 * Math.sin(t * .7);
    bloomAt(490, 286, age, 205, F.coral);
    for (let i = 0; i < 7; i++) {
      const a = i / 7 * TAU - Math.PI / 2, r = 210 + 18 * Math.sin(t + i);
      const x = 490 + Math.cos(a) * r, y = 286 + Math.sin(a) * r * .72;
      dotAt(x, y, 3 + (i % 3), i % 2 ? F.gold : F.sea, 175);
    }
    // A small dark impression survives after the colour has gone.
    const trace = ease(seg(lt, 1.8, 3.2));
    paint(ellPts(490, 286, 36 + trace * 9, 25 + trace * 5, 20, 1), { wash: F.rustDk, washOp: 125 * trace, ink: null });
    registrationMark(118, 92, 8, F.sea);
    registrationMark(W - 120, H - 96, 8, F.coral);
    camEnd();
    transition(lt, D, 9);
  };

  const s11 = (t, lt, D) => {
    camBegin(W * .50, H * .52, 1.0, 0);
    fillFrame(F.deep2);
    waterSheet(365, 205, t, F.sea, 8, 1.1, null);
    // A torn vellum sheet holds the flower for one beat; the incoming tide washes away its ink, not the memory.
    const vellum = [[112, 118], [232, 101], [344, 119], [467, 95], [579, 112], [702, 98], [823, 119],
      [840, 204], [821, 278], [845, 365], [718, 355], [598, 379], [470, 357], [348, 380], [223, 359], [125, 376], [114, 278]];
    cutPoly(vellum, F.paperHi, 255, null);
    ln([[112, 118], [232, 101], [344, 119], [467, 95], [579, 112], [702, 98], [823, 119]], .75, F.seaLite, 'inkfine', .25);
    ln([[125, 376], [223, 359], [348, 380], [470, 357]], .55, F.shellDk, 'inkfine', .25);
    contourSet(493, 265, 246, 170, 4, F.seaLite, t, .64, .9);
    bloomAt(490, 266, .96, 150, F.rust);
    const erase = ease(seg(lt, 1.15, 3.65));
    waterSheet(306 + erase * 90, 90, t, mixCol(F.paperHi, F.seaLite, .60), 7, 1.7, null);
    // Pigment pulls down in narrow threads, leaving a rough white negative-space flower.
    for (let i = 0; i < 7; i++) {
      const x = 420 + i * 22, y0 = 304 + (i % 3) * 7, len = erase * (26 + (i % 4) * 13);
      ln([[x, y0], [x - 3 + Math.sin(t + i) * 2, y0 + len], [x + 2, y0 + len + 8]], .8, i % 2 ? F.rustDk : F.coral, 'inkfine', .45);
    }
    seedSprite(345, 458, HERO_U * .47, t, { face: 'sad', key: 'imprint-seed', heart: .18 });
    raySprite(630, 448, RAY_U * .43, t, { face: 'quiet', key: 'imprint-ray', fade: .1 });
    camEnd();
    transition(lt, D, 10);
  };

  shots([[CUTS[8], s9], [CUTS[9], s10], [CUTS[10], s11]]);
})();
