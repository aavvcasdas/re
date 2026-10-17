// c4.js — 寻觅(26.64–31.84 s,S12 + 尾奏)
// 疯狂的寻觅 你的身影 / (乐器收束,月光海面)
(() => {
  const HERO_U = 26;
  const T12 = beatNo(51.5), T13 = beatNo(55);   // 26.64 28.42

  // ---- 第 13 镜(26.64–28.42):疯狂的寻觅 ----
  // reads: ① Clawd 在暮色沙滩上狂奔(全镜) ② 左右张望(0.4–1.5) ③ 海鸟惊起(1.0–1.78)
  const s13 = (t, lt, D) => {
    camBegin(W * .5 + Math.sin(t * 1.2) * 10, H * .56, lerp(1.0, 1.1, ease(seg(lt, .2, D))), 0);
    shoreAt(t, { hy: H * .38, dusk: .95 });
    // 奔跑 + 张望
    const look = Math.sin(lt * 3.2);
    hero(lerp(W * .18, W * .62, easeOut(seg(lt, 0, 1.78))), H * .84, HERO_U, {
      ...emotions(t, [[T12, 'determined', { lookX: .7 }], [T12 + .55, 'moved', { lookX: -.7 }], [T12 + 1.05, 'determined', { lookX: .8, lookY: -.15 }]]),
      view: 'side', walk: lt * 4.4, aL: .6, aR: .35, rot: look * .02, boilKey: 'h13',
    });
    // 扬沙
    boilSeed('s13dust');
    for (let i = 0; i < 6; i++) {
      const ph = frac(lt * 1.6 + i * .17);
      dotAt(lerp(W * .18, W * .62, easeOut(seg(lt, 0, 1.78))) - 30 - ph * 52, H * .88 + Math.sin(i + ph * 5) * 4, 1.8 + hash(i * 2.2) * 2.2, F.sand, 150 * (1 - ph));
    }
    // 惊起的海鸟
    for (let i = 0; i < 4; i++) {
      const ph = ease(seg(lt, .35 + i * .18, 1.78));
      gullAt(W * (.3 + i * .16) + ph * (60 + i * 30), H * (.3 - ph * .16 + hash(i * 3.1) * .06), 11 + hash(i) * 5, t * 3.4 + i * 1.7);
    }
    camEnd();
  };

  // ---- 第 14 镜(28.42–31.84):月光海面,纸船漂远 ----
  // reads: ① 月亮升上来(0–0.8) ② 纸船随浪漂远(全镜) ③ 光收一收,画面沉静(2.2–3.42 收尾)
  const s14 = (t, lt, D) => {
    camBegin(W * .5, H * .5, lerp(.98, .92, ease(seg(lt, .2, D))), 0);
    seaView(t, { hy: H * .55, dusk: 1 });
    // 夜色压深
    band(-40, H + 40, mixCol('#2E3A58', F.ink, .35), Math.min(210, ease(seg(lt, 0, 1.6)) * 150 + 60));
    // 月亮
    const my = lerp(H * .30, H * .22, ease(seg(lt, 0, 2.2)));
    paint(ellPts(W * .68, my, 34, 34, 18, 1), { wash: '#FFF4D8', ink: null });
    glow(W * .68, my, 150, '#FFE9B8', .5);
    // 月光在水面的一道
    boilSeed('s14glint');
    for (let i = 0; i < 7; i++) {
      const y = H * (.58 + i * .055);
      paint(ellPts(W * .68 + Math.sin(t * .4 + i) * 12, y, W * (.05 + hash(i * 2.2) * .07), 2.6, 12, .6), { wash: '#FFE9B8', washOp: 90 + i * 8, ink: null });
    }
    // 纸船漂远(越来越小)
    const bx = lerp(W * .42, W * .60, ease(seg(lt, 0, 3.42))), by = H * .60 + Math.sin(t * .8) * 5;
    const bs = 1 - ease(seg(lt, 0, 3.42)) * .45;
    paint([[bx, by - 10 * bs], [bx + 16 * bs, by], [bx, by + 8 * bs], [bx - 16 * bs, by]], { wash: F.cream2, ink: mixCol(F.ink, F.seaDk, .3), sw: 1 });
    paint([[bx - 2 * bs, by - 10 * bs], [bx + 2 * bs, by - 26 * bs], [bx + 10 * bs, by - 10 * bs]], { wash: mixCol(F.cream2, F.blue, .3), ink: mixCol(F.ink, F.seaDk, .3), sw: 1 });
    rippleAt(bx, by + 10 * bs, 22 * bs, frac(t * .45), F.cream2);
    // 远处的星
    boilSeed('s14star');
    for (let i = 0; i < 10; i++) dotAt(W * hash(i * 3.7), H * hash(i * 5.1) * .32, 1.2, F.cream2, 140 + 60 * Math.sin(t * 1.4 + i));
    // 收尾:轻轻收一格暗
    fadeOut(lt, D + .35, 1.15, mixCol(F.ink, '#1E2A44', .5));
    camEnd();
  };

  shots([[T12, s13], [T13, s14]]);
})();
