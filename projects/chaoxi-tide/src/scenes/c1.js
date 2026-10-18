// c1.js — 0–16.65s | first mark → first light → first horizon
(() => {
  const s1 = (t, lt, D) => {
    camBegin(W * .50, H * .52, lerp(1.20, .84, ease(seg(lt, 0, D))), 0);
    nightChart(t, .02);
    // An extreme map crop opens on one tiny, fresh footprint; the pull-back reveals the whole tide atlas.
    contourSet(W * .50, H * .67, 355, 210, 4, F.ink2, t, .78, .7);
    tideTrace(H * .57, t, 9, 2.3, F.gold, .9);
    const mark = ease(seg(lt, .25, .85));
    for (let i = 0; i < 4; i++) {
      const x = W * .5 - 24 + i * 16;
      paint(ellPts(x, H * .72 + i * 7, 3.4 * mark, 2.0 * mark, 10, .2), { wash: F.coral, washOp: 230 * mark, ink: null });
    }
    seedSprite(W * .50, H * .73, HERO_U * .74, t, { face: 'quiet', key: 'atlas-seed', heart: .55 });
    registrationMark(72, 74, 7, F.gold);
    registrationMark(W - 70, H - 94, 7, F.coralLite);
    camEnd();
    transition(lt, D, 0);
  };

  const s2 = (t, lt, D) => {
    camBegin(W * .47 + Math.sin(lt * .22) * 8, H * .53, lerp(.96, 1.08, ease(seg(lt, .1, D))), 0);
    tidalPool(t, .34);
    // The tired seed tends a tiny sea-fennel shoot where the dark water keeps returning.
    paint(ellPts(680, 413, 120, 31, 24, 2), { wash: mixCol(F.deep2, F.ink, .18), washOp: 230, ink: F.ink2, sw: .8 });
    waterSheet(404, 55, t, F.deep2, 5, 2.6, null);
    const sprout = ease(seg(lt, .45, 2.6));
    sproutAt(675, 422, 62, sprout, t);
    seedSprite(285 + 24 * ease(seg(lt, .2, 1.4)), 448, HERO_U * .94, t, {
      face: lt > 2.4 ? 'hopeful' : 'sad', reach: .65 * ease(seg(lt, .55, 1.1)), key: 'seed-tends-shoot', heart: .35,
    });
    tideTrace(365, t, 6, 1.1, F.foam, .7);
    camEnd();
    transition(lt, D, 1);
  };

  const s3 = (t, lt, D) => {
    camBegin(W * .51, H * .51, lerp(1.08, .97, ease(seg(lt, 0, D))), 0);
    fillFrame(mixCol(F.deep, F.plum, .24));
    waterSheet(323, 175, t, F.deep2, 13, 1.4, null);
    waterSheet(402, 170, t, F.sea, 8, 3.2, null);
    contourSet(670, 305, 340, 150, 5, F.sea, t, .8, 1.7);
    // A folded ray glides in from the right; its own silhouette becomes the first light source.
    const arrive = ease(seg(lt, .25, 2.15));
    const rx = lerp(W + 95, W * .67, arrive);
    paint(ellPts(rx + 8, 333, 156 * arrive, 82 * arrive, 28, 2), { wash: F.goldLite, washOp: 34 * arrive, ink: null });
    for (let i = 0; i < 4; i++) {
      const yy = 275 + i * 31;
      ln([[rx + 52, yy], [rx + 142 + i * 13, yy - 12], [rx + 209 + i * 15, yy - 4]], .55, F.goldLite, 'inkfine', .45);
    }
    raySprite(rx, 380 - arrive * 10, RAY_U * 1.45, t, { face: arrive > .55 ? 'happy' : 'quiet', glow: arrive, key: 'first-ray' });
    const hx = lerp(270, 365, ease(seg(lt, 1.05, 2.35)));
    seedSprite(hx, 455, HERO_U * 1.02, t, { face: arrive > .65 ? 'surprised' : 'quiet', reach: .9 * arrive, key: 'first-meet', heart: .55 });
    // A warm current links them only after the ray chooses to stay.
    if (lt > 1.05) {
      const q = ease(seg(lt, 1.05, 2.35));
      ln([[405, 417], [450, 391 - 14 * q], [510, 405], [560, 379 - 10 * q], [610, 386]], 1.25, F.gold, 'inkfine', .74);
      for (let i = 0; i < 5; i++) dotAt(425 + i * 36 + Math.sin(t + i) * 4, 401 - (i % 2) * 13, 2.3, F.goldLite, 185 * q);
      glow(550, 385, 70, F.goldLite, .16 * q);
    }
    camEnd();
    transition(lt, D, 2);
  };

  const s4 = (t, lt, D) => {
    camBegin(W * .50 + 15 * Math.sin(lt * .20), H * .49, lerp(.98, .90, ease(seg(lt, .15, D))), 0);
    warmCoast(t, .08);
    // A wide, low horizon turns the sea into a panorama; the pair stay small at the paper's lower edge.
    cutPoly([[-30, 477], [145, 455], [330, 480], [515, 446], [730, 476], [900, 445], [W + 30, 465], [W + 30, H + 40], [-30, H + 40]], F.deep2, 255, null);
    for (let i = 0; i < 8; i++) tideTrace(290 + i * 24, t + i * .16, 3.2, i * .63, i % 2 ? F.foam : F.goldLite, .55);
    seedSprite(385, 474, HERO_U * .72, t, { face: 'quiet', key: 'horizon-seed', heart: .65 });
    raySprite(490, 466, RAY_U * .70, t, { face: 'quiet', glow: .35, key: 'horizon-ray' });
    // Reflected light runs farther than either character can see.
    const k = ease(seg(lt, .7, 2.9));
    ln([[495, 326], [545, 340], [585, 327], [645, 350], [710, 333], [770, 358]], 1.2, F.goldLite, 'inkfine', .72);
    for (let i = 0; i < 5; i++) {
      const px = lerp(520 + i * 26, 775, k);
      paint(ellPts(px, 343 + Math.sin(t + i) * 5, 18 + 5 * k, 2.2, 12, .3), { wash: F.gold, washOp: 145, ink: null });
    }
    camEnd();
    transition(lt, D, 3);
  };

  shots([[CUTS[0], s1], [CUTS[1], s2], [CUTS[2], s3], [CUTS[3], s4]]);
})();
