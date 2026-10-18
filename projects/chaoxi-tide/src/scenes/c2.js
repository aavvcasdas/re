// c2.js — 16.65–32.86s | intimacy by attention, not by an identical pose
(() => {
  const s5 = (t, lt, D) => {
    camBegin(W * .50, H * .50, lerp(1.04, 1.12, ease(seg(lt, .2, D))), 0);
    fillFrame(F.paperHi);
    // A close-up on the ray's folded ribs; the reply is a current of marks, never a speech bubble.
    contourSet(660, 272, 300, 210, 5, mixCol(F.seaLite, F.sea, .55), t, .7, 2.4);
    raySprite(665, 402, RAY_U * 1.12, t, { face: 'happy', glow: .25, key: 'words-ray' });
    seedSprite(314, 441, HERO_U * .91, t, { face: 'quiet', reach: .12, key: 'words-seed', heart: .48 });
    const p = ease(seg(lt, .45, 2.7));
    const path = [[535, 347], [495, 318 - 12 * p], [448, 333], [410, 306 - 8 * p], [365, 323], [341, 349]];
    ln(path, 1.65, F.gold, 'inkfine', .72);
    for (let i = 0; i < 9; i++) {
      const q = frac(p * 1.2 - i * .082);
      const at = Math.min(path.length - 1, Math.floor(q * (path.length - 1)));
      const f = q * (path.length - 1) - at, a = path[at], b = path[Math.min(at + 1, path.length - 1)];
      dotAt(lerp(a[0], b[0], f), lerp(a[1], b[1], f), 2.2 + (i % 3) * .4, F.goldLite, 200);
    }
    const caught = ease(seg(lt, 2.1, 3.4));
    dotAt(347, 364, 4 + 4 * caught, F.goldLite, 225 * caught);
    glow(348, 364, 46, F.goldLite, .18 * caught);
    camEnd();
    transition(lt, D, 4);
  };

  const s6 = (t, lt, D) => {
    camBegin(W * .50 + Math.sin(lt * .28) * 5, H * .52, 1.0, 0);
    fillFrame(F.plum);
    cutPoly([[-30, 88], [190, 110], [370, 82], [555, 119], [750, 80], [W + 30, 105], [W + 30, 246], [-30, 230]], F.deep2, 255, null);
    waterSheet(344, 230, t, F.deep, 7, 1.3, null);
    waterSheet(420, 160, t, F.sea, 6, 3.7, null);
    rainStrokes(t, 42, F.cloud, .68);
    // No shelter prop: companionship is the only warm shape in an open, rain-filled frame.
    cutPoly([[-25, 480], [155, 463], [320, 482], [504, 461], [700, 481], [872, 465], [W + 25, 480], [W + 25, H + 35], [-25, H + 35]], F.deep2, 255, null);
    for (let i = 0; i < 5; i++) {
      const cx = 478, cy = 469, rx = 34 + i * 22 + Math.sin(t * 1.2 + i) * 4;
      paint(ellPts(cx, cy, rx, 5 + i * .6, 30, .45), { ink: i % 2 ? F.seaLite : F.gold, sw: .55, curv: .15 });
    }
    // They sit shoulder to shoulder and watch rain circles form and vanish in the same shallow pool.
    for (let i = 0; i < 3; i++) {
      const dx = 350 + i * 132;
      const dropY = 356 + ((t * 42 + i * 67) % 96);
      dotAt(dx, dropY, 2.4, F.mist, 165);
    }
    seedSprite(427, 460, HERO_U * .80, t, { face: 'sad', tilt: .04, key: 'rain-seed', heart: .25 });
    raySprite(526, 446, RAY_U * .78, t, { face: 'quiet', tilt: -.02, key: 'rain-ray' });
    // A shared pool of reflected light stays between them through the whole rain take.
    paint(ellPts(478, 474, 115, 8, 20, 1), { wash: F.gold, washOp: 60, ink: null });
    camEnd();
    transition(lt, D, 5);
  };

  const s7 = (t, lt, D) => {
    camBegin(W * .5, H * .52, lerp(1.05, .91, ease(seg(lt, .1, D))), .04 * Math.sin(lt * .18));
    fillFrame(F.sand);
    // Top-down estuary: two distinct ink tracks braid together but neither disappears.
    cutPoly([[-30, 80], [210, 60], [430, 104], [620, 72], [W + 30, 115], [W + 30, 223], [640, 205], [380, 234], [150, 207], [-30, 230]], F.paperHi, 255, null);
    waterSheet(265, 92, t, F.seaLite, 12, .4, null);
    waterSheet(332, 102, t, F.sea, 10, 2.0, null);
    waterSheet(422, 128, t, F.sea2, 9, 3.6, null);
    const q = ease(seg(lt, .15, D - .35));
    const warmPath = [[-5, 342], [140, 360], [290, 344], [425, 365], [590, 353], [770, 380], [970, 364]];
    const coolPath = [[-5, 430], [150, 410], [285, 433], [425, 390], [600, 411], [785, 388], [970, 405]];
    ln(warmPath, 2.1, mixCol(F.rust, F.gold, .28), 'inkfine', .65);
    ln(coolPath, 1.8, F.deep2, 'inkfine', .65);
    const hx = lerp(150, 645, q), hy = 357 + Math.sin(lt * 1.8) * 14;
    seedSprite(hx, hy, HERO_U * .67, t, { face: 'happy', step: true, key: 'braid-seed', heart: .7 });
    raySprite(hx + 82, hy + 50, RAY_U * .61, t, { face: 'happy', key: 'braid-ray', glow: .25 });
    // Paired small prints, unevenly spaced like actual footsteps.
    for (let i = 0; i < 9; i++) {
      const qf = clamp(q - i * .055);
      const px = lerp(150, 645, qf) - 22 - i * 25;
      const py = 356 + Math.sin(i * .5) * 12;
      paint(ellPts(px, py, 4, 2.4, 10, .2, -.28), { wash: i % 2 ? F.rust : F.deep2, washOp: 190, ink: null });
      paint(ellPts(px + 16, py + 30, 3.3, 2.1, 10, .2, .22), { wash: F.sea, washOp: 175, ink: null });
    }
    contourSet(540, 373, 330, 50, 3, mixCol(F.paper, F.ink2, .3), t, .55, 1.1);
    camEnd();
    transition(lt, D, 6);
  };

  const s8 = (t, lt, D) => {
    camBegin(W * .50, H * .50, lerp(1.0, 1.10, ease(seg(lt, .25, D))), 0);
    tidalPool(t, .03);
    // Motes of laughter gather into an open shell bell; each arrival opens one more printed rib.
    const open = ease(seg(lt, .2, 2.0));
    shellBellAt(510, 390, 76, t, open, open);
    seedSprite(264 + 58 * ease(seg(lt, .6, 2.7)), 446, HERO_U * .76, t, { face: 'happy', reach: .55, key: 'collect-seed', heart: .68 });
    raySprite(760 - 64 * ease(seg(lt, .55, 2.8)), 424, RAY_U * .67, t, { face: 'happy', key: 'collect-ray', glow: .28 });
    for (let i = 0; i < 8; i++) {
      const startX = i % 2 ? 730 : 296, startY = 350 + (i % 4) * 15;
      const a = t * .8 + i * 1.11, q = ease(seg(lt, .45 + (i % 4) * .20, 2.9));
      const ex = 510 + Math.cos(a) * 38, ey = 330 + Math.sin(a) * 24;
      dotAt(lerp(startX, ex, q), lerp(startY, ey, q), 2 + (i % 3) * .6, i % 2 ? F.goldLite : F.coralLite, 205 * q);
    }
    if (lt > 2.15) {
      for (let i = 0; i < 5; i++) waveMark(510 + (i - 2) * 20, 285 - (lt - 2.15) * 10 + i * 4, 10 + i, F.goldLite);
    }
    camEnd();
    transition(lt, D, 7);
  };

  shots([[CUTS[4], s5], [CUTS[5], s6], [CUTS[6], s7], [CUTS[7], s8]]);
})();
