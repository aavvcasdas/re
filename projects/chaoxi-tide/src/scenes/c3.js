// c3.js — 距离(18.76–26.64 s,S9–S11)
// 我们的距离 遥不可及 / 退守的爱情 / 还剩下回忆
(() => {
  const HERO_U = 26, DEAR_U = 24;
  const T9 = beatNo(36.5), T10 = beatNo(44), T11 = beatNo(48);   // 19.02 22.83 24.86

  // ---- 第 10 镜(19.02–22.83):遥不可及(全片最长的一口气) ----
  // reads: ① 两座崖隔着海(0–1.2) ② 左边 Clawd、右边小小的蓝色身影(0.8–2.2) ③ 镜头缓缓拉远,距离越来越远(1.2–3.81)
  const s10 = (t, lt, D) => {
    camBegin(W * .5, H * .5, lerp(1.12, .86, ease(seg(lt, .3, D))), 0);
    boilSeed('s10sky');
    band(-40, H * .38, mixCol('#C8D2E0', '#8E86A8', .35), 255);
    band(H * .22, H * .5, mixCol('#D8C8C0', '#A08E9E', .45), 255);
    // 海(夹在两崖之间)
    boilSeed('s10sea');
    band(H * .5, H * .8, mixCol(F.seaLt, F.sea, .5), 255);
    band(H * .62, H + 40, mixCol(F.sea, F.seaDk, .4), 255);
    for (let i = 0; i < 7; i++) {
      const y = H * (.55 + i * .06), x = frac(hash(i * 3.3) + t * .025) * (W + 200) - 100;
      paint(ellPts(x, y, W * (.1 + hash(i * 4.4) * .16), 2.2 + i * .35, 12, .6), { wash: mixCol(F.seaLt, F.cream2, .35), washOp: 110, ink: null });
    }
    // 左右两座崖
    cliffAt(-W * .06, W * .42, H * .55, mixCol('#5E5470', '#3E3450', .2), 1);
    cliffAt(W * .66, W * .40, H * .58, mixCol('#5E5470', '#3E3450', .35), 1);
    // 左崖 Clawd 望着右边
    hero(W * .16, H * .52, HERO_U * .9, {
      ...emotions(t, [[T9, 'moved', { lookX: .9 }], [T9 + 2.2, 'sad', { lookX: .85, lookY: .2 }]]),
      view: 'q', aL: .1, aR: .55, boilKey: 'h10', noShadow: true,
    });
    // 右崖:小小的蓝色身影(远、看不清)
    const twinkle = .75 + Math.sin(t * 2.2) * .25;
    dear(W * .82, H * .555, DEAR_U * .52, { ...feel('moved', t), view: 'q', flip: true, aL: .3, aR: .3, boilKey: 'd10', noShadow: true });
    dotAt(W * .845, H * .50, 1.6, F.cream2, 160 * twinkle);
    // 海鸟一横排
    for (let i = 0; i < 4; i++) gullAt(W * (.32 + i * .1) + Math.sin(t * .5 + i * 2) * 12, H * (.24 + hash(i * 2) * .08), 9, t * 2.4 + i);
    // 空气里的一点点雾
    boilSeed('s10mist');
    for (let i = 0; i < 6; i++) dotAt(W * (.3 + hash(i * 3.1) * .45), H * (.52 + hash(i * 5.5) * .16), 30 + hash(i) * 26, F.cream2, 22);
    camEnd();
  };

  // ---- 第 11 镜(22.83–24.86):退守的爱情 ----
  // reads: ① 湿沙上一颗心形水洼(0–0.8) ② 退潮,水洼被浪抹开(0.8–1.7) ③ 只剩一片湿痕(1.7–2.03)
  const s11 = (t, lt, D) => {
    camBegin(W * .5, H * .58, lerp(1.14, 1.06, ease(seg(lt, .2, D))), 0);
    shoreAt(t, { hy: H * .30, dusk: .55 });
    // 心形水洼
    const fade = ease(seg(lt, .75, 1.75));
    heartPoolAt(W * .5, H * .72, 78, 1 - fade * .35);
    // 退潮:水线往画面下方退,心被拉长、抹散
    boilSeed('s11tide');
    const ry = lerp(H * .78, H * .95, ease(seg(lt, 0, 2.03)));
    ln([[-20, ry], [W * .5, ry + Math.sin(t * 2.2) * 4], [W + 20, ry - 3]], 2.6, mixCol(F.seaLt, F.cream2, .5), 'inkfine', 1);
    // 抹散的水痕
    if (fade > 0) {
      for (let i = 0; i < 5; i++) {
        const y = H * .72 + (i - 2) * 11, w = 30 + fade * (60 + hash(i * 3) * 60);
        paint(ellPts(W * .5 + (hash(i * 2.2) - .5) * 30, y, w, 3.4, 12, .5), { wash: mixCol(F.seaLt, F.cream2, .45), washOp: 150 * fade, ink: null });
      }
    }
    // 一点退潮留下的亮沙
    paint(ellPts(W * .5, H * .735, W * .16 * (1 + fade * .5), H * .02, 18, 3), { wash: mixCol(F.sand, F.cream2, .4), washOp: 100 + fade * 40, ink: null });
    camEnd();
  };

  // ---- 第 12 镜(24.86–26.64):还剩下回忆 ----
  // reads: ① 沙上一朵纸花(0–0.6) ② 搁浅的漂流瓶在旁边(0.3–1.2) ③ 远处小小的背影离开(全镜)
  const s12 = (t, lt, D) => {
    camBegin(W * .5, H * .56, lerp(1.08, 1.14, ease(seg(lt, .3, D))), 0);
    shoreAt(t, { hy: H * .32, dusk: .85 });
    // 纸花(大一点、微微开合)插在湿沙上
    paperFlowerAt(W * .40, H * .72, 46, F.cream2, F.rose, .85 + Math.sin(t * .9) * .1);
    ln([[W * .40, H * .74], [W * .41, H * .80]], 2, '#7A9A6A', 'ink', .4);
    // 搁浅的瓶子,横躺着
    push(); translate(W * .62, H * .74); rotate(1.35 + Math.sin(t * .5) * .02);
    bottleAt(0, 0, 20, 0, 1);
    pop();
    // 花旁边的湿沙反光
    paint(ellPts(W * .5, H * .78, W * .14, H * .02, 16, 3), { wash: mixCol(F.fwGold, F.sand, .4), washOp: 130, ink: null });
    // 远处小小的背影正离开(「回忆」的主体走了,物还在)
    hero(W * .86, H * .52, HERO_U * .42, { ...feel('moved', t), view: 'back', aL: -.1, aR: -.1, boilKey: 'h12', noShadow: true });
    // 一只小蟹横着爬过(彩蛋)
    boilSeed('s12crab');
    const cx = W * .16 + frac(t * .06) * W * .2, cy = H * .82;
    dotAt(cx, cy, 6, F.clay, 255); dotAt(cx - 8, cy + 2, 2.6, F.clay); dotAt(cx + 8, cy + 2, 2.6, F.clay);
    ln([[cx - 6, cy - 5], [cx - 11, cy - 9]], 1, F.clayDk); ln([[cx + 6, cy - 5], [cx + 11, cy - 9]], 1, F.clayDk);
    camEnd();
  };

  shots([[T9, s10], [T10, s11], [T11, s12]]);
})();
