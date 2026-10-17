// c2.js — 旧梦(8.08–18.76 s,S4–S8)
// 你说过向往大海的神秘 / 也憧憬我们遗失的过去 / 分享给大海秘密 / 蓝色的海底 / 远山的风景
(() => {
  const HERO_U = 26, DEAR_U = 24;
  const T4 = beatNo(15), T5 = beatNo(19), T6 = beatNo(23), T7 = beatNo(28), T8 = beatNo(32);

  // ---- 第 5 镜(8.08–10.12):崖边看海 ----
  // reads: ① 两人坐在崖沿面对大海(全镜) ② 水面上一只纸船(0.3–1.4) ③ 远景拉出「神秘」(1.0–2.04)
  const s5 = (t, lt, D) => {
    camBegin(W * .5, H * .5, lerp(1.08, .98, ease(seg(lt, .2, D))), 0);
    seaView(t, { hy: H * .38, dusk: .55 });
    // 暖金记忆色调
    band(-40, H + 40, '#FFC978', 36);
    // 崖台:右下角探出去的大岩台(前景)
    const cliffTop = H * .60;
    paint([[-20, H + 40], [-20, cliffTop + 30], [W * .18, cliffTop + 8], [W * .42, cliffTop - 6], [W * .62, cliffTop + 4], [W * .78, cliffTop + 40], [W * .78, H + 40]], { wash: '#5E5470', ink: F.ink, sw: 1.4 });
    // 崖面纹理
    ln([[W * .1, cliffTop + 40], [W * .3, cliffTop + 26], [W * .5, cliffTop + 44]], 1.2, mixCol('#5E5470', F.ink, .35), 'inkfine', .8);
    ln([[W * .28, cliffTop + 80], [W * .52, cliffTop + 66]], 1.1, mixCol('#5E5470', F.ink, .35), 'inkfine', .8);
    // 两人并排坐在崖沿,腿悬空晃
    const dangle = Math.sin(t * 1.3) * .18, dangle2 = Math.sin(t * 1.3 + .8) * .18;
    hero(W * .30, cliffTop - 30, HERO_U * .95, {
      ...emotions(t, [[T4, 'happy', { lookX: .15, lookY: -.15 }]]), view: 'q',
      aL: .15, aR: .5, rot: .02, boilKey: 'h5', noShadow: true,
    });
    dear(W * .47, cliffTop - 26, DEAR_U * .95, {
      ...emotions(t, [[T4, 'happy', { lookX: .1, lookY: -.15 }]]), view: 'q',
      aL: .45, aR: .15, rot: -.02, boilKey: 'd5', noShadow: true,
    });
    // 悬空晃的小脚(用小色块补在崖沿下方)
    for (const [fx, ph] of [[W * .275, dangle], [W * .325, dangle2], [W * .445, dangle2], [W * .495, dangle]]) {
      slab(fx - 5, cliffTop + 2 + ph * 8, 10, 16, F.clayDk, .6);
    }
    // 海面上的纸船
    const bx = W * .72 + Math.sin(t * .35) * 22, by = H * .46 + Math.sin(t * .8) * 4;
    paint([[bx, by - 10], [bx + 16, by], [bx, by + 8], [bx - 16, by]], { wash: F.cream2, ink: F.ink, sw: 1 });
    paint([[bx - 2, by - 10], [bx + 2, by - 26], [bx + 10, by - 10]], { wash: mixCol(F.cream2, F.blue, .3), ink: F.ink, sw: 1 });
    rippleAt(bx, by + 10, 26, frac(t * .5), F.cream2);
    // 海鸟
    gullAt(W * .16 + Math.sin(t * .7) * 30, H * .16, 13, t * 3.2);
    gullAt(W * .78 + Math.sin(t * .5 + 2) * 24, H * .12, 10, t * 2.6 + 1);
    camEnd();
  };

  // ---- 第 6 镜(10.12–12.15):遗失的过去 ----
  // reads: ① 沙上一张旧照片(0–0.8) ② 照片上画着两个小人(0.4–1.5) ③ 潮水逼近、Clawd 跑来捡起(1.2–2.03)
  const s6 = (t, lt, D) => {
    camBegin(W * .5, H * .58, lerp(1.16, 1.04, ease(seg(lt, .3, D))), 0);
    shoreAt(t, { hy: H * .34, dusk: .15 });
    // 照片(纸片):微斜放在湿沙上
    const px = W * .46, py = H * .72, tilt = -.12 + Math.sin(t * .6) * .012;
    const lift = ease(seg(lt, 1.45, 1.95));    // 被捡起来
    push(); translate(px, py - lift * H * .12); rotate(tilt - lift * .22); scale(1 - lift * .12, 1 - lift * .12);
    paint(rectPts(-72, -52, 144, 104, 3, .4), { wash: F.cream2, ink: '#B98A5E', sw: 1.6 });
    paint(rectPts(-58, -40, 116, 76, 2, .3), { wash: mixCol(F.seaLt, F.sky, .5), ink: null });
    // 照片里的两个小人(火柴盒小画)
    slab(-26, -2, 18, 26, F.clay, .5); slab(-22, -18, 10, 10, F.clay, .5);
    slab(8, -2, 18, 26, F.blue, .5); slab(12, -18, 10, 10, F.blue, .5);
    ln([[-8, 6], [8, 6]], 1.6, F.ink, 'inkfine', .8);
    pop();
    // 潮水逼近(白色前缘)
    const wet = ease(seg(lt, 0, 2.03));
    boilSeed('s6wet');
    ln([[-20, lerp(H * .97, H * .80, wet)], [W * .5, lerp(H * .98, H * .815, wet) + Math.sin(t * 2.8) * 5], [W + 20, lerp(H * .96, H * .795, wet)]], 3, mixCol(F.seaLt, F.cream2, .5), 'inkfine', 1);
    // Clawd 从右边跑进来
    const run = seg(lt, 1.15, 1.9);
    hero(lerp(W * .92, W * .55, easeOut(run)), H * .86, HERO_U, {
      ...emotions(t, [[T5, 'moved', { lookX: -.4, lookY: .3 }], [T5 + 1.2, 'determined', { lookY: .2 }]]),
      view: 'side', walk: lt * 3.8, aL: .5, aR: .4, boilKey: 'h6',
    });
    camEnd();
  };

  // ---- 第 7 镜(12.15–14.69):分享给大海秘密 ----
  // reads: ① Clawd 举着瓶子(0–0.6) ② 扔出去的弧线(0.6–1.2) ③ 瓶子落水、漂向海心(1.2–2.54)
  const s7 = (t, lt, D) => {
    camBegin(W * .5 + Math.sin(t * .3) * 6, H * .52, lerp(1.05, .99, ease(seg(lt, .5, D))), 0);
    shoreAt(t, { hy: H * .44, dusk: .2 });
    // Clawd 站在岸边,扔
    const wind = ease(seg(lt, .5, 1.05));
    hero(W * .30, H * .84, HERO_U, {
      ...emotions(t, [[T6, 'determined', { lookX: .6, lookY: -.2 }], [T6 + 1.3, 'moved', { lookX: .8, lookY: .1 }]]),
      view: 'q', aL: lerp(.2, 1.15, wind), aR: lerp(.9, .2, wind), boilKey: 'h7',
    });
    // 瓶子:从手上抛出,落水后漂
    const ph = seg(lt, .72, 1.35);              // 飞行
    const fly = ease(ph);
    const bx = ph < 1 ? lerp(W * .36, W * .62, fly) : W * .62 + (lt - 1.35) * W * .055;
    const by = ph < 1 ? H * .70 - Math.sin(fly * Math.PI) * H * .22 : H * .565 + Math.sin(t * 1.3) * 5;
    // 抛物线轨迹的虚线残影
    if (ph < 1) {
      for (let i = 1; i <= 5; i++) {
        const q = fly - i * .12; if (q <= 0) break;
        dotAt(lerp(W * .36, W * .62, ease(q)), H * .70 - Math.sin(ease(q) * Math.PI) * H * .22, 2.6, F.cream2, 170 - i * 28);
      }
    }
    bottleAt(bx, by, 18, ph < 1 ? lerp(-.9, .25, fly) : .25 + Math.sin(t * 1.1) * .08, 1);
    // 落水水花 + 涟漪
    const splash = seg(lt, 1.35, 1.8);
    if (splash > 0 && splash < 1) {
      boilSeed('s7splash');
      for (let i = 0; i < 7; i++) {
        const a = -Math.PI * (.25 + hash(i * 3.1) * .5), r = splash * (16 + hash(i * 5) * 26);
        dotAt(W * .62 + Math.cos(a) * r, H * .565 + Math.sin(a) * r * .8, 1.8 + hash(i) * 1.8, F.cream2, 200 * (1 - splash));
      }
      rippleAt(W * .62, H * .575, 10 + splash * 60, splash, F.cream2);
    }
    if (lt > 1.5) rippleAt(bx, H * .575, 22, frac((lt - 1.5) * .8), F.cream2);
    camEnd();
  };

  // ---- 第 8 镜(14.69–16.73):蓝色的海底 ----
  // reads: ① 深蓝水下、光柱(0–0.8) ② 瓶子缓缓下沉(全镜) ③ 纸鱼掠过、气泡上浮(0.5–2.04)
  const s8 = (t, lt, D) => {
    camBegin(W * .5, H * .5, lerp(1.08, 1.0, ease(seg(lt, .3, D))), 0);
    // 水下渐变:上浅下深
    boilSeed('s8water');
    band(-40, H * .35, mixCol(F.seaLt, '#7FB8C8', .4), 255);
    band(H * .22, H * .62, mixCol(F.sea, '#4E8FA6', .35), 255);
    band(H * .5, H + 40, mixCol(F.seaDk, '#2E5E78', .45), 255);
    band(H * .78, H + 40, mixCol(F.seaDk, F.ink, .3), 255);
    // 光柱
    boilSeed('s8ray');
    for (let i = 0; i < 4; i++) {
      const x = W * (.18 + i * .22) + Math.sin(t * .3 + i) * 14;
      paint([[x - 16, -20], [x + 22, -20], [x + 62, H + 20], [x - 30, H + 20]], { wash: F.cream2, washOp: 26, ink: null });
    }
    // 瓶子下沉(带气泡)
    const bx = W * .48 + Math.sin(t * .7) * 18, by = lerp(H * .28, H * .62, ease(seg(lt, 0, 2.04)));
    bottleAt(bx, by, 17, .5 + Math.sin(t * .9) * .12, 1);
    boilSeed('s8bub');
    for (let i = 0; i < 9; i++) {
      const ph = frac(t * .5 + i * .12);
      dotAt(bx + 22 + Math.sin(t * 1.2 + i) * 12 + hash(i) * 16, by - 30 - ph * 120, 1.6 + hash(i * 3) * 2.4, F.cream2, 170 * Math.sin(ph * Math.PI));
    }
    // 纸鱼
    paperFishAt(W * .74 + Math.sin(t * .5) * 30, H * .38 + Math.sin(t * .8 + 1) * 14, 13, .1 + Math.sin(t * .6) * .1, mixCol(F.cream2, F.blue, .25));
    paperFishAt(W * .22 + Math.sin(t * .4 + 2) * 26, H * .58 + Math.sin(t * .7 + 3) * 12, 10, Math.PI + .15, mixCol(F.cream2, F.rose, .3));
    // 海底沙脊
    ridgeAt(H * .88, mixCol(F.seaDk, '#2A4A60', .5), 3.3);
    camEnd();
  };

  // ---- 第 9 镜(16.73–18.76):远山的风景 ----
  // reads: ① 出水看远山(0–0.8) ② 海面开阔、层叠山影(0.4–1.5) ③ 海鸟飞过远山(全镜)
  const s9 = (t, lt, D) => {
    camBegin(W * .5, H * .46, lerp(.94, 1.0, ease(seg(lt, 0, D))), 0);
    boilSeed('s9sky');
    band(-40, H * .32, mixCol('#BFE0E8', F.seaLt, .3), 255);
    band(H * .18, H * .44, mixCol('#D8E8E4', F.sky, .35), 255);
    // 三层远山
    ridgeAt(H * .40, mixCol('#8FA8B8', F.sky, .45), 1.2);
    ridgeAt(H * .455, mixCol('#6E88A0', F.seaLt, .3), 2.7);
    ridgeAt(H * .51, mixCol('#54708C', F.seaDk, .25), 4.1);
    // 海面
    boilSeed('s9sea');
    band(H * .52, H + 40, mixCol(F.seaLt, F.sea, .4), 255);
    band(H * .68, H + 40, F.sea, 255);
    band(H * .84, H + 40, F.seaDk, 255);
    for (let i = 0; i < 6; i++) {
      const y = H * (.56 + i * .07), x = frac(hash(i * 3.3) + t * (.03 + i * .006)) * (W + 200) - 100;
      paint(ellPts(x, y, W * (.12 + hash(i * 4.4) * .18), 2.4 + i * .4, 12, .6), { wash: mixCol(F.seaLt, F.cream2, .4), washOp: 130, ink: null });
    }
    // 一串海鸟飞过远山
    for (let i = 0; i < 5; i++) {
      const gx = W * (.12 + i * .16) + Math.sin(t * .5 + i * .9) * 20 + lt * 12;
      gullAt(gx, H * (.22 + hash(i * 2.2) * .1) + Math.sin(t + i) * 6, 11 + hash(i) * 5, t * 2.8 + i * 1.3);
    }
    camEnd();
  };

  shots([[T4, s5], [T5, s6], [T6, s7], [T7, s8], [T8, s9]]);
})();
