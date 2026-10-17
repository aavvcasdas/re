// c1.js — 第一章 · 雨后街角(0.06–10.68 s)
// 词:那天你在雨后街角答应接受我的爱 / 那一刻我的世界有了色彩 / 这一生无法忘记关于澄蓝色的你 / 像一份礼物悄然呈现在我的境遇
//
// 冷灰蓝的雨 → 颜色从那把澄蓝色的伞下涨开 → 一枚纸碎片落下 → 一只纸鹤被递过来。
// 记号:纸。整片的纸(碎片、纸鹤、纸花、拼起来的画)都是从这里开始的。
(() => {
  const GROUND = H * .80, HERO_X = W * .40, DEAR_X = W * .68;
  const HERO_U = 23, DEAR_U = 24;
  // 抬起的手在哪儿(手臂 aR≈0.95 时:根在身侧 5u,再往外 2.2u)
  const HAND = 148, HAND_Y = -151;
  const UMB_S = 88, UMB_X = DEAR_X - HAND, UMB_Y = GROUND + HAND_Y - UMB_S;

  // ---- 第 1 镜(0.06–3.15):雨后街角,有人打着伞在等 ----
  // reads: ① 雨后的街角(0.06–0.95) ② 伞下的人(0.95–1.65) ③ 我走过去停在她面前(1.65–3.09)
  const s1 = (t, lt, D) => {
    camBegin(W * .5, H * .56, lerp(.92, .98, ease(seg(lt, .4, D))), 0);
    streetCorner(t, { fy: GROUND, rain: 1, night: .12, lampX: W * .90 });
    // 她:打伞站着,有点犹豫(伞微微晃)
    const sway = Math.sin(t * 1.1) * 3;
    const dearMood = emotions(t, [[0.06, 'shy', { lookX: -.6 }], [2.45, 'neutral', { lookX: -.25 }]]);
    umbrellaAt(UMB_X + sway, UMB_Y, UMB_S, F.blue, -.13, 0);
    dear(DEAR_X, GROUND, DEAR_U, { ...dearMood, aR: .95, aL: .1, view: 'q', flip: true, boilKey: 'dear1' });
    // 我:从左边走进来,在她面前停下
    const st = stroll(t, .55, 2.05, -W * .16, HERO_X, HERO_U);
    const heroMood = emotions(t, [[0.06, 'neutral'], [2.45, 'hopeful', { lookX: .5 }], [2.95, 'shy', { lookX: .5 }]]);
    hero(st.x, GROUND, HERO_U, { ...heroMood, view: st.view, flip: st.flip, walk: st.walk, dy: (heroMood.dy || 0) + st.dy, boilKey: 'hero1' });
    // 雨点溅在伞边
    boilSeed('s1spray');
    for (let i = 0; i < 6; i++) {
      const a = 1.2 + hash(i * 3.3) * 1.6, r = UMB_S * 1.05;
      dotAt(UMB_X + Math.cos(a) * r, UMB_Y + Math.sin(a) * r * .55, 1.6 + hash(i) * 1.4, F.cream2, 150);
    }
    camEnd();
    if (lt < .5) fadeIn(lt, .5, F.ink);
  };

  // ---- 第 2 镜(3.15–5.67):那一刻我的世界有了色彩 ----
  // reads: ① 颜色从伞下涨开(3.15–4.05) ② 我的表情变成惊喜,冒星星(4.05–5.05) ③ 彩色的街(5.05–5.67)
  const s2 = (t, lt, D) => {
    const k = ease(seg(lt, 0, 1.2));
    camBegin(W * .5, H * .54, lerp(.98, 1.04, ease(seg(lt, .3, D))), 0);
    streetCorner(t, { fy: GROUND, rain: .55, night: .1, lampX: W * .90, warm: k });
    // 颜色:一整层灰慢慢褪掉,底下是彩色的街
    paint(rectPts(-20, -20, W + 40, H + 40, 0), { wash: F.skyRainLo, washOp: 205 * (1 - k), ink: null });
    // 颜色从伞下往街上淌开:三层扁扁的色块
    boilSeed('s2col');
    const cx = UMB_X + 20, cy = GROUND + 10, r = 40 + k * W * .78;
    paint(ellPts(cx, cy, r, r * .46, 26, r * .03), { wash: '#F3C489', washOp: 105 * (1 - k * .3), ink: null });
    paint(ellPts(cx, cy, r * .74, r * .34, 26, r * .03), { wash: '#E9A0A0', washOp: 78 * (1 - k * .35), ink: null });
    paint(ellPts(cx, cy, r * .50, r * .22, 24, r * .03), { wash: '#9FD3C0', washOp: 70 * (1 - k * .35), ink: null });
    glow(UMB_X + 20, UMB_Y + 30, 130, '#FFD79A', .5 * k);
    const dearMood = emotions(t, [[3.15, 'neutral'], [3.65, 'happy', { lookX: -.3 }]]);
    umbrellaAt(UMB_X + Math.sin(t * 1.1) * 3, UMB_Y, UMB_S, F.blue, -.13, 0);
    dear(DEAR_X, GROUND, DEAR_U, { ...dearMood, aR: .95, aL: .1, view: 'q', flip: true, boilKey: 'dear1' });
    // 我:抬头,眼睛里有星星
    const hop = jump(t, 4.15, 4.75, 2.4);
    const heroMood = emotions(t, [[3.15, 'hopeful'], [4.05, 'surprised', { lookX: .55, lookY: -.3 }], [4.5, 'starstruck', { lookX: .5 }]]);
    hero(HERO_X, GROUND, HERO_U, { ...heroMood, view: 'q', dy: (heroMood.dy || 0) + hop.dy, sq: (heroMood.sq || 0) + hop.sq, boilKey: 'hero1' });
    // 星星冒出来
    boilSeed('s2stars');
    for (let i = 0; i < 5; i++) {
      const age = lt - (4.45 + i * .09);
      if (age < 0 || age > 1.1) continue;
      const sx = HERO_X + (hash(i * 3.1) - .5) * 110, sy = GROUND - 150 - age * 40;
      sparkleAt(sx, sy, 13, age, 1.1);
    }
    camEnd();
  };

  // ---- 第 3 镜(5.67–8.16):这一生无法忘记关于澄蓝色的你 ----
  // reads: ① 她的脸,伞下的光(5.67–6.45) ② 一枚纸碎片从伞边滑下来(6.45–7.15) ③ 我伸手接住(7.15–8.16)
  const s3 = (t, lt, D) => {
    const fall = seg(lt, .78, 1.42);
    const fx0 = UMB_X - UMB_S * .95, fy0 = UMB_Y + 10;
    const fx1 = HERO_X + HAND, fy1 = GROUND + HAND_Y;
    camBegin(lerp(W * .56, W * .54, ease(seg(lt, 0, D))), H * .50, lerp(1.10, 1.16, ease(seg(lt, .4, D))), 0);
    streetCorner(t, { fy: GROUND, rain: .35, night: .08, lampX: W * .90, warm: .35 });
    pool(UMB_X + 20, GROUND - 4, 165, .9, '#FFCE86');
    const dearMood = emotions(t, [[5.67, 'happy', { lookX: -.5 }], [6.97, 'shy', { lookX: -.55 }]]);
    umbrellaAt(UMB_X + Math.sin(t * 1.1) * 2, UMB_Y, UMB_S, F.blue, -.13, 0);
    dear(DEAR_X, GROUND, DEAR_U, { ...dearMood, aR: .95, aL: .1, view: 'q', flip: true, swMul: .9, boilKey: 'dear1' });
    // 纸碎片从伞边滑下来,落进我伸出的手里
    if (fall > 0 && fall < 1) {
      const sx = lerp(fx0, fx1, ease(fall)), sy = lerp(fy0, fy1, fall * fall);
      scrapAt(sx, sy, 17, fall * 1.4, F.cream2, F.blue);
    }
    const reach = seg(lt, 1.35, 1.85);
    const heroMood = emotions(t, [[5.67, 'starstruck', { lookX: .5 }], [6.97, 'surprised', { lookX: .45, lookY: .5 }], [7.57, 'happy', { lookX: .4 }]]);
    hero(HERO_X, GROUND, HERO_U, { ...heroMood, aR: .55 + reach * .35, aL: .25, view: 'q', swMul: .9, boilKey: 'hero1' });
    // 接住的那一下(纸在身体前面)
    if (lt > 1.85) {
      const age = lt - 1.85;
      scrapAt(fx1, fy1, 18, .3, F.cream2, F.blue);
      for (let i = 0; i < 4; i++) {
        const a = i / 4 * TAU;
        dotAt(fx1 + Math.cos(a) * (8 + age * 44), fy1 + Math.sin(a) * (8 + age * 32), 1.6, F.cream2, 200 * (1 - age));
      }
    }
    camEnd();
  };

  // ---- 第 4 镜(8.16–10.68):像一份礼物悄然呈现在我的境遇 ----
  // reads: ① 她把折好的纸鹤递过来(8.16–9.05) ② 我双手接住(9.05–9.85) ③ 纸鹤张开一只翅膀(9.85–10.68)
  const s4 = (t, lt, D) => {
    const take = seg(lt, .8, 1.55);
    const bx0 = DEAR_X - HAND, by0 = GROUND + HAND_Y, bx1 = HERO_X + HAND, by1 = GROUND + HAND_Y;
    camBegin(lerp(W * .54, W * .53, ease(seg(lt, 0, D))), H * .50, lerp(1.16, 1.10, ease(seg(lt, .8, D))), 0);
    streetCorner(t, { fy: GROUND, rain: .18, night: .06, lampX: W * .90, warm: .45 });
    pool(UMB_X + 20, GROUND - 4, 175, .95, '#FFCE86');
    const dearMood = emotions(t, [[8.16, 'shy', { lookX: -.5 }], [9.06, 'happy', { lookX: -.4 }]]);
    umbrellaAt(UMB_X + Math.sin(t * 1.1) * 2, UMB_Y, UMB_S, F.blue, -.13, 0);
    dear(DEAR_X, GROUND, DEAR_U, { ...dearMood, aR: .8, aL: .1, view: 'q', flip: true, swMul: .9, boilKey: 'dear1' });
    const heroMood = emotions(t, [[8.16, 'happy', { lookX: .45 }], [9.01, 'surprised', { lookX: .4 }], [9.81, 'love', { lookX: .4 }]]);
    hero(HERO_X, GROUND, HERO_U, { ...heroMood, aR: .5 + take * .45, aL: .3, view: 'q', swMul: .9, boilKey: 'hero1' });
    // 递出去的纸鹤:从她手里到我手里(画在人物前面,才看得见)
    const bx = lerp(bx0, bx1, ease(take)), by = lerp(by0, by1, take);
    birdAt(bx, by, 34, lerp(.2, -.12, take), F.cream2, clamp((lt - 1.7) * 1.6));
    // 收到的一瞬间,闪一下
    if (lt > 1.62 && lt < 2.2) {
      const age = lt - 1.62;
      sparkleAt(bx, by, 22, age, .6);
      glow(bx, by, 64, '#FFE6A8', .35 * (1 - age / .6));
    }
    camEnd();
    wipeOut(lt, D, .7, [F.blueDk, F.blue]);
  };

  shots([[0.06, s1], [3.15, s2], [5.67, s3], [8.16, s4]]);
})();
