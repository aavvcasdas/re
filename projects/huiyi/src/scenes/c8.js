// c8.js — 第八章 · 那时的我(101.10–142.13 s)
// 词:那时的我每天都祈祷实现这个梦想
//
// 最后一句之后是长长的尾奏:回到那个街角(和开头呼应),祈祷过的梦想被纸鹤带回来;
// 雨还在下,但颜色留下了。最后一个画面是水洼里的倒影——一朵折出来的花。
(() => {
  const GROUND = H * .80, T31 = 101.10, T32 = 106.17, T33 = 111.24, T34 = 116.30, T35 = 121.37, T36 = 128.90, T37 = 136.42;
  const HERO_U = 24, DEAR_U = 24;
  const HERO_X = W * .40, DEAR_X = W * .68;
  const HAND = 148, HAND_Y = -151;
  const UMB_S = 88, UMB_X = DEAR_X - HAND, UMB_Y = GROUND + HAND_Y - UMB_S;

  // ---- 第 31 镜(101.10–106.17):那时的我每天都祈祷实现这个梦想 ----
  // reads: ① 雨里,他闭上眼睛(0–1.1) ② 双手合十,发愿(1.1–2.4) ③ 一团暖光,纸鹤出现了(2.4–5.07)
  const s31 = (t, lt, D) => {
    camBegin(W * .48, H * .52, lerp(1.06, 1.18, ease(seg(lt, .8, D))), 0);
    streetCorner(t, { fy: GROUND, rain: .8, night: .3, lampX: W * .90, warm: .15 });
    const mood = emotions(t, [[T31, 'hopeful', { lookY: -.2 }], [T31 + 1.2, 'proud', { lookX: 0, lookY: -.3 }], [T31 + 2.5, 'starstruck', { lookX: .1, lookY: -.3 }]]);
    hero(HERO_X, GROUND, HERO_U, { ...mood, view: 'front', aL: -1.25, aR: -1.25, boilKey: 'hero8' });
    // 祈祷的暖光
    const glowK = ease(seg(lt, 1.2, 3.2));
    if (glowK > 0) glow(HERO_X, GROUND - 150, 120 + glowK * 70, '#FFD79A', .45 * glowK);
    // 纸鹤出现,绕着暖光飞
    if (lt > 2.5) {
      const age = lt - 2.5, a = age * 1.8 - 1.2;
      birdAt(HERO_X + Math.cos(a) * 90, GROUND - 150 + Math.sin(a) * 54, 32, a * .3 - .1, F.cream2, Math.abs(Math.sin(t * 5)) * .8);
    }
    camEnd();
  };

  // ---- 第 32 镜(106.17–111.24):雨伞之下 ----
  // reads: ① 那把澄蓝色的伞又出现在他头顶(0–1.1) ② 抬起头(1.1–2.3) ③ 颜色开始涨回来(2.3–5.07)
  const s32 = (t, lt, D) => {
    const open = ease(seg(lt, 0, 1.0)), warm = ease(seg(lt, 2.2, 4.6));
    camBegin(HERO_X + 20, H * .50, lerp(1.14, 1.02, ease(seg(lt, .6, D))), 0);
    streetCorner(t, { fy: GROUND, rain: .55, night: .25, lampX: W * .90, warm: .15 + warm * .75 });
    // 伞从画面上方落下,撑开
    const ux = HERO_X + 30, uy = lerp(GROUND + HAND_Y - UMB_S - 260, GROUND + HAND_Y - UMB_S, open);
    umbrellaAt(ux, uy, UMB_S, F.blue, -.13, 0);
    const mood = emotions(t, [[T32, 'hopeful', { lookY: -.2 }], [T32 + 1.2, 'surprised', { lookX: .2, lookY: -.4 }], [T32 + 2.4, 'happy', { lookX: .15, lookY: -.2 }]]);
    hero(HERO_X, GROUND, HERO_U, { ...mood, view: 'q', aR: 1.05, aL: .1, boilKey: 'hero8' });
    // 纸鹤停在伞沿
    if (lt > 1.6) birdAt(ux - 46, uy - 6, 26, .2, F.cream2, 0);
    camEnd();
  };

  // ---- 第 33 镜(111.24–116.30):又站在一起 ----
  // reads: ① 她出现了,就站在原来的位置(0–1.2) ② 两个人对视(1.2–2.6) ③ 一起抬头看天(2.6–5.06)
  const s33 = (t, lt, D) => {
    const here = ease(seg(lt, 0, 1.1));
    camBegin(W * .5, H * .56, lerp(.96, 1.02, ease(seg(lt, .8, D))), 0);
    streetCorner(t, { fy: GROUND, rain: .35, night: .12, lampX: W * .90, warm: .85 });
    // 她从暖光里慢慢显出来
    const da = here;
    dear(DEAR_X, GROUND, DEAR_U, {
      ...emotions(t, [[T33, 'happy', { lookX: -.5 }], [T33 + 2.6, 'love', { lookX: -.2, lookY: -.2 }]]),
      view: 'q', flip: true, aR: .95, aL: .1, boilKey: 'dear8',
    });
    if (da < 1) paint(rectPts(-20, -20, W + 40, H + 40, 0), { wash: '#F2C182', washOp: 200 * (1 - da), ink: null });
    umbrellaAt(W * .54 + Math.sin(t * 1.1) * 3, UMB_Y - 18, UMB_S * 1.18, F.blue, -.10, 0);
    hero(HERO_X, GROUND, HERO_U, { ...emotions(t, [[T33, 'love', { lookX: .5 }], [T33 + 2.6, 'starstruck', { lookX: .1, lookY: -.3 }]]), view: 'q', aR: .6, aL: .1, boilKey: 'hero8' });
    camEnd();
  };

  // ---- 第 34 镜(116.30–121.37):纸花烟花 ----
  // reads: ① 第一朵纸花在天上绽开(0–1.0) ② 一朵接一朵(1.0–3.2) ③ 两个人一起仰着头(3.2–5.07)
  const s34 = (t, lt, D) => {
    const bursts = [[.55, .30, F.fwGold, 1.1], [1.5, .62, F.fwRose, 1.0], [2.6, .44, F.fwTeal, .9], [3.4, .74, F.fwViolet, .8], [4.1, .18, F.fwRose, .75]];
    camBegin(W * .5, H * .48, lerp(.94, 1.06, ease(seg(lt, .6, D))), 0);
    streetCorner(t, { fy: GROUND, rain: .15, night: .2, lampX: W * .90, warm: .8 });
    for (const [bt, bx, col, sc] of bursts) {
      const age = lt - bt;
      if (age < 0 || age > 1.5) continue;
      fireworkAt(W * bx, H * (.08 + hash(bt * 7.7) * .16), age, col, 140 * sc);
    }
    umbrellaAt(W * .54 + Math.sin(t * 1.1) * 3, UMB_Y - 18, UMB_S * 1.18, F.blue, -.10, 0);
    dear(DEAR_X, GROUND, DEAR_U, { ...emotions(t, [[T34, 'starstruck', { lookX: -.1, lookY: -.4 }]]), view: 'q', flip: true, aR: .95, aL: .1, boilKey: 'dear8' });
    hero(HERO_X, GROUND, HERO_U, { ...emotions(t, [[T34, 'starstruck', { lookX: .1, lookY: -.4 }]]), view: 'q', aR: .6, aL: .1, boilKey: 'hero8' });
    camEnd();
    wipeIn(lt, .7, [F.gold, F.fwRose]);
  };

  // ---- 第 35 镜(121.37–128.90):纸鹤飞上天 ----
  // reads: ① 纸鹤从伞沿起飞(0–1.3) ② 越飞越高,变小(1.3–4.2) ③ 停在天上,像一颗星(4.2–7.53)
  const s35 = (t, lt, D) => {
    const fly = ease(seg(lt, .2, 4.6));
    camBegin(lerp(HERO_X + 20, W * .5, fly), lerp(H * .55, H * .22, fly), lerp(1.02, .92, ease(seg(lt, 1, D))), 0);
    streetCorner(t, { fy: GROUND, rain: .2, night: .3 + fly * .35, lampX: W * .90, warm: .7 - fly * .35 });
    umbrellaAt(W * .54 + Math.sin(t * 1.1) * 3, UMB_Y - 18, UMB_S * 1.18, F.blue, -.10, 0);
    hero(HERO_X, GROUND, HERO_U, { ...emotions(t, [[T35, 'happy', { lookY: -.3 }], [T35 + 3, 'love', { lookY: -.6 }]]), view: 'q', aR: .6, aL: .1, boilKey: 'hero8' });
    dear(DEAR_X, GROUND, DEAR_U, { ...emotions(t, [[T35, 'happy', { lookY: -.3 }], [T35 + 3, 'love', { lookY: -.6 }]]), view: 'q', flip: true, aR: .95, aL: .1, boilKey: 'dear8' });
    // 纸鹤越飞越高
    const bx = lerp(UMB_X - 40, W * .5, fly), by = lerp(UMB_Y - 40, H * .10, ease(fly));
    const bs = lerp(30, 16, fly);
    birdAt(bx, by, bs, -.3 - fly * .15, F.cream2, Math.abs(Math.sin(t * 4.6)) * (1 - fly * .7));
    if (lt > 3.6) {
      const tw = 1 - Math.abs(Math.sin((lt - 3.6) * 1.6)), k = seg(lt, 3.6, 4.6);
      glow(bx, by, 40 + tw * 40 + k * 30, '#FFE0A8', .4 + tw * .3);
      paint(starPts(bx, by, (12 + tw * 8) * k, .3, 4), { wash: F.cream2, washOp: 240 * k, ink: null });
    }
    camEnd();
  };

  // ---- 第 36 镜(128.90–136.42):雨还在下,颜色留下了 ----
  // reads: ① 回到街角,雨里(0–1.4) ② 他一个人撑着伞,但笑了(1.4–3.4) ③ 一枚纸片落进水洼,荡开一颗心(3.4–7.52)
  const s36 = (t, lt, D) => {
    const fall = seg(lt, 3.1, 3.9);
    camBegin(W * .5, H * .58, lerp(.92, .86, ease(seg(lt, .8, D))), 0);
    streetCorner(t, { fy: GROUND, rain: .8, night: .18, lampX: W * .90, warm: .7 });
    // 他一个人撑着伞(伞举在自己手里)
    const mood = emotions(t, [[T36, 'neutral', { lookY: -.1 }], [T36 + 1.6, 'relieved', { lookY: 0 }], [T36 + 3.4, 'love', { lookX: .1, lookY: .1 }]]);
    hero(HERO_X + 40, GROUND, HERO_U, { ...mood, view: 'q', aR: 1.0, aL: .1, boilKey: 'hero8' });
    umbrellaAt(HERO_X + 66, GROUND + HAND_Y - UMB_S, UMB_S, F.blue, -.13, Math.sin(t * 1.0) * 2.5);
    // 纸片落进水洼
    const px = W * .62, py = GROUND + H * .085;
    if (fall > 0 && fall < 1) {
      scrapAt(px + (1 - fall) * 30, lerp(GROUND - 220, py, fall * fall), 15, fall * 1.3, F.cream2, F.blue);
    }
    if (fall >= 1) {
      rippleAt(px, py, 40 + (fall - 1) * 30, (1 - (fall - 1)) * .8, '#D8E4EE');
      paint(heartPts(px, py - 4, 15), { wash: F.rose, washOp: 210 * (1 - clamp(fall - 1.6)), ink: null });
    }
    camEnd();
  };

  // ---- 第 37 镜(136.42–142.13):水洼里的倒影 ----
  // reads: ① 俯身看水洼(0–1.2) ② 倒影里是一朵折纸花(1.2–3.4) ③ 缓缓淡到纸上(3.4–5.71)
  const s37 = (t, lt, D) => {
    camBegin(W * .62, GROUND + H * .10, lerp(1.30, 1.42, ease(seg(lt, .5, D))), 0);
    streetCorner(t, { fy: GROUND, rain: .35, night: .15, lampX: W * .90, warm: .8 });
    // 水洼:倒影里是一朵花
    const px = W * .62, py = GROUND + H * .10;
    paint(ellPts(px, py, W * .30, H * .10, 28, 3), { wash: mixCol(F.sky, '#FFF', .3), ink: null });
    paint(ellPts(px, py, W * .26, H * .082, 26, 2.5), { wash: mixCol('#9FD3E8', '#FFF', .25), ink: null });
    glow(px, py, 150, '#FFD79A', .4);
    // 倒影的花(颜色淡一点,像映在水里)
    paperFlowerAt(px, py - 8, 78, mixCol(F.cream2, '#FFF', .25), mixCol(F.rose, '#FFF', .15), 1);
    boilSeed('s37rip');
    for (let i = 0; i < 3; i++) {
      const r = 30 + i * 34 + Math.sin(t * 1.4 + i) * 5;
      paint(ellPts(px, py, r, r * .34, 24, 1), { wash: null, washOp: 0, ink: mixCol('#9FD3E8', F.ink, .3), sw: .8 });
    }
    // 最后淡到纸色
    const fade = seg(lt, D - 1.6, D - .1);
    if (fade > 0) flash(ease(fade), PAL.paper);
    camEnd();
  };

  shots([[T31, s31], [T32, s32], [T33, s33], [T34, s34], [T35, s35], [T36, s36], [T37, s37]]);
})();
