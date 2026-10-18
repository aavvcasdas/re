// c4.js — 44.81–55.98s | the tide returns what was put down; the last light is kept for oneself
(() => {
  const s12 = (t, lt, D) => {
    camBegin(W * .50 + Math.sin(lt * .18) * 8, H * .51, lerp(.97, 1.03, ease(seg(lt, 0, D))), 0);
    warmCoast(t, .70);
    cutPoly([[-30, 434], [170, 405], [330, 432], [520, 398], [720, 435], [880, 404], [W + 30, 426], [W + 30, H + 35], [-30, H + 35]], F.sand, 255, null);
    const returnWave = ease(seg(lt, 1.55, 3.1));
    waterSheet(477 - returnWave * 46, 80, t, mixCol(F.seaLite, F.sea, .24), 7, 2.2, null);
    // The shell bell is set down. The character walks away, then the ebb puts it back against their foot.
    const away = ease(seg(lt, .30, 1.65)), back = ease(seg(lt, 2.0, 3.1));
    const hx = lerp(425, 245, away) + 155 * back;
    seedSprite(hx, 455, HERO_U * .79, t, { face: back > .3 ? 'surprised' : 'sad', step: lt > .3 && lt < 2.2, reach: .25 * back, key: 'return-seed', heart: .30 });
    const shellX = lerp(469, 555, away) - 86 * back;
    shellBellAt(shellX, 464 - 18 * returnWave, 27, t, .22 + .1 * Math.sin(t), .12 + .45 * back);
    // Waterline retreats first, then quietly curls back around the object.
    tideTrace(452 - returnWave * 40, t, 6, 1.9, F.foam, .75);
    for (let i = 0; i < 5; i++) {
      const x = 430 + i * 22, y = 451 - returnWave * 28 + Math.sin(t + i) * 3;
      ln([[x, y], [x + 9, y - 5], [x + 18, y]], .65, F.goldLite, 'inkfine', .6);
    }
    camEnd();
    transition(lt, D, 11);
  };

  const s13 = (t, lt, D) => {
    camBegin(W * .50, H * .50, lerp(1.02, 1.10, ease(seg(lt, .1, D))), 0);
    nightChart(t, .44 + .34 * ease(seg(lt, 2.4, 3.8)));
    // The seed has spent its warmth outward. The light comes back, but it is the seed that chooses to keep it.
    const drain = ease(seg(lt, .1, 1.65)), returnK = ease(seg(lt, 2.0, 3.1));
    seedSprite(416, 452, HERO_U * 1.03, t, {
      face: returnK > .45 ? 'relieved' : 'overwhelmed',
      fade: Math.max(0, drain * (1 - returnK)), heart: .18 + .82 * returnK,
      crack: drain > .5 && returnK < .7, tilt: .05 * (1 - returnK), key: 'self-light-seed',
    });
    raySprite(610, 438, RAY_U * .89, t, { face: 'quiet', glow: .3 + .6 * returnK, key: 'self-light-ray' });
    shellBellAt(602, 353, 48, t, .7, .3 + .5 * (1 - drain));
    // The outgoing thread thins; a separate, slower thread returns a single ember to the seed's own chest.
    if (lt < 2.0) {
      const q = ease(seg(lt, .25, 1.9));
      ln([[431, 383], [472, 349], [519, 369], [560, 343], [592, 358]], 1.2, F.rust, 'inkfine', .66);
      for (let i = 0; i < 5; i++) dotAt(438 + i * 31, 376 - Math.sin(t + i) * 9, 2.2, F.coralLite, 185 * (1 - q));
    }
    if (lt > 1.55) {
      const q = ease(seg(lt, 1.55, 3.15));
      const xx = lerp(588, 416, q), yy = lerp(356, 388, q) - Math.sin(q * Math.PI) * 48;
      dotAt(xx, yy, 3.8 + q * 2.2, F.goldLite, 240);
      if (q > .78) glow(416, 388, 82 * q, F.goldLite, .28 * q);
    }
    // A new, small ring surrounds the seed — not the other character — before the film ends.
    const ring = ease(seg(lt, 2.85, 3.8));
    if (ring > 0) {
      const pts = []; for (let i = 0; i <= 42; i++) { const a = i / 42 * TAU; pts.push([416 + Math.cos(a) * 32 * ring, 392 + Math.sin(a) * 16 * ring]); }
      ln(pts, 1.1, F.goldLite, 'inkfine', .3);
    }
    camEnd();
    transition(lt, D, 12);
  };

  const s14 = (t, lt, D) => {
    camBegin(W * .50, H * .51, lerp(.91, .68, ease(seg(lt, 0, D))), .015 * Math.sin(lt * .35));
    nightChart(t, .78);
    contourSet(W * .50, H * .67, 355, 210, 4, F.gold, t, .82, .7);
    // The opening map returns: now two independent tracks cross the same vast sheet and continue past frame.
    tideTrace(H * .56, t, 8, 2.3, F.goldLite, .9);
    ln([[85, 404], [210, 389], [312, 398], [426, 373], [544, 386], [675, 354], [810, 366], [956, 337]], 1.25, F.coral, 'inkfine', .72);
    ln([[48, 355], [176, 372], [298, 348], [416, 365], [537, 342], [656, 359], [784, 330], [918, 346]], 1.15, F.seaLite, 'inkfine', .72);
    seedSprite(474, 387, HERO_U * .43, t, { face: 'happy', key: 'ending-seed', heart: .9 });
    raySprite(513, 369, RAY_U * .39, t, { face: 'happy', glow: .5, key: 'ending-ray' });
    const fade = ease(seg(lt, D - .85, D));
    vignette(F.paper, fade);
    camEnd();
  };

  shots([[CUTS[11], s12], [CUTS[12], s13], [CUTS[13], s14]]);
})();
