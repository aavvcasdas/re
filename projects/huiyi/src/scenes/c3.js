// c3.js — 第三章 · 争执(20.79–30.99 s)
// 词:我们也经常争执互相不接电话 / 在同一房间终于呼叫冷漠抵达 / 也曾想过以后生活没有人牵挂 / 把爱扔掉只剩一块残酷伤疤
//
// 颜色掉下去:屋里蒙上一层冷灰,人之间空出一段距离。
// 记号:手机在地上响(没人接),最后那一下是全片最狠的动作——纸鹤被扔出去。
(() => {
  const GROUND = H * .78, T9 = 20.79, T10 = 23.31, T11 = 25.86, T12 = 28.41;
  const HERO_U = 25, DEAR_U = 25;

  // 冷:一层灰蓝蒙在画面上
  const coldVeil = (k, col = F.coldLo) => paint(rectPts(-20, -20, W + 40, H + 40, 0), { wash: col, washOp: 190 * clamp(k), ink: null });

  // ---- 第 9 镜(20.79–23.31):我们也经常争执互相不接电话 ----
  // reads: ① 手机在地上响(0–0.85) ② 她走开了(0.85–1.7) ③ 我看着手机,不接(1.7–2.52)
  const s9 = (t, lt, D) => {
    camBegin(W * .46, H * .54, lerp(1.06, 1.0, ease(seg(lt, 0, D))), 0);
    littleRoom(t, { fy: GROUND, night: 1, winX: W * .86, lampX: W * .13, rugX: W * .5 });
    // 她往外走
    const walk = stroll(t, T9 + .8, T9 + 1.9, W * .62, W * .96, DEAR_U);
    dear(walk.x, GROUND, DEAR_U, { ...emotions(t, [[T9, 'neutral'], [T9 + .8, 'sad', { lookX: .2 }]]), view: 'q', flip: true, walk: walk.walk, dy: walk.dy, boilKey: 'dear3' });
    // 地上响着的手机(在前景,大一点,看得出在响)
    const ring = Math.max(0, 1 - Math.abs(((t * 2.2) % 1) - .5) * 2.4);
    phoneAt(W * .26, GROUND + 34, 44, ring);
    // 我看着它
    hero(W * .40, GROUND, HERO_U, { ...emotions(t, [[T9, 'neutral'], [T9 + 1.7, 'sad', { lookX: -.5, lookY: .4 }]]), view: 'front', boilKey: 'hero3' });
    coldVeil(.35);
    camEnd();
    wipeIn(lt, .7, [F.cold, F.coldLo]);
  };

  // ---- 第 10 镜(23.31–25.86):在同一房间终于呼叫冷漠抵达 ----
  // reads: ① 背对背坐着,中间空一段(0–1.0) ② 镜头拉远,屋子冷下去(1.0–1.9) ③ 谁也不动(1.9–2.55)
  const s10 = (t, lt, D) => {
    const pull = ease(seg(lt, .5, D));
    camBegin(W * .5, H * .54, lerp(1.12, .82, pull), 0);
    littleRoom(t, { fy: GROUND, night: 1, winX: W * .86, lampX: W * .13, rugX: W * .5 });
    // 背对背:两个盒子,中间空一段
    hero(W * .38, GROUND, HERO_U, { ...emotions(t, [[T10, 'sad', { lookX: -.4 }]]), view: 'q', flip: true, boilKey: 'hero3' });
    dear(W * .62, GROUND, DEAR_U, { ...emotions(t, [[T10, 'sad', { lookX: .4 }]]), view: 'q', boilKey: 'dear3' });
    coldVeil(.35 + pull * .5, F.coldLo);
    // 中间那条冷缝
    paint(ellPts(W * .5, GROUND - 40, 26, 90, 16, 2), { wash: F.coldLo, washOp: 120, ink: null });
    camEnd();
  };

  // ---- 第 11 镜(25.86–28.41):也曾想过以后生活没有人牵挂 ----
  // reads: ① 空着的椅子(0–0.85) ② 我抱住那个纸盒(0.85–1.7) ③ 窗外的夜(1.7–2.55)
  const s11 = (t, lt, D) => {
    const hug = ease(seg(lt, .7, 1.5));
    camBegin(lerp(W * .52, W * .46, ease(hug)), H * .50, lerp(1.0, 1.14, ease(hug)), 0);
    littleRoom(t, { fy: GROUND, night: 1, winX: W * .86, lampX: W * .13, rugX: W * .5 });
    // 空椅子(她原来坐的地方)
    slab(W * .70, GROUND - 46, 58, 11, '#6E5A72', 1.2);
    slab(W * .70, GROUND - 96, 11, 54, '#6E5A72', 1);
    slab(W * .73, GROUND - 42, 9, 42, '#5C4A60', 1);
    slab(W * .755, GROUND - 4, 9, 8, '#4E3E54', .8);
    slab(W * .70, GROUND - 4, 60, 8, '#5C4A60', 1.5);
    // 我抱着盒子
    hero(W * .40, GROUND, HERO_U, { ...emotions(t, [[T11, 'sad', { lookX: -.4, lookY: .4 }], [T11 + .9, 'cry', { lookX: -.3 }]]), view: 'front', aL: -1.0, aR: -1.0, dy: 2 * hug, boilKey: 'hero3' });
    boxAt(W * .40, GROUND - 118, 50, .15, '#B98A5E');
    for (let i = 0; i < 3; i++) scrapAt(W * .40 - 12 + i * 12, GROUND - 148, 12, i, F.cream2, i % 2 ? F.blue : F.rose);
    coldVeil(.55);
    camEnd();
  };

  // ---- 第 12 镜(28.41–30.99):把爱扔掉只剩一块残酷伤疤 ----
  // reads: ① 抡起手臂(0–0.6) ② 扔出去,纸鹤翻着跟头(0.6–1.45) ③ 落在地上,颜色掉光(1.45–2.58)
  const s12 = (t, lt, D) => {
    const throwAt = T12 + .62, land = T12 + 1.5;
    const air = t > throwAt && t < land;
    const k = air ? seg(t, throwAt, land) : (t >= land ? 1 : 0);
    // 纸鹤的飞行:一条抛物线,落地后歪着
    const p0 = [W * .40, GROUND - 130], p1 = [W * .70, GROUND - 6];
    const pos = air ? arcPt(p0, p1, 150, k) : (t < throwAt ? p0 : p1);
    const rot = air ? lerp(-.3, 2.6, k) : 2.6;
    camBegin(W * .5, H * .54, lerp(1.06, .98, ease(seg(lt, .6, D))), 0);
    littleRoom(t, { fy: GROUND, night: 1, winX: W * .86, lampX: W * .13, rugX: W * .5 });
    // 抡臂 + 扔
    const wind = seg(lt, 0, .62), rel = seg(lt, .62, .95);
    const mood = emotions(t, [[T12, 'sad', { lookX: -.3 }], [T12 + .62, 'angry', { lookX: .4 }], [T12 + 1.6, 'ko', { lookX: 0 }]]);
    hero(W * .40, GROUND, HERO_U, { ...mood, view: 'front', aR: -1.1 + wind * 2.2 - rel * 1.2, aL: .3, rot: -.06 * wind, boilKey: 'hero3' });
    // 纸鹤
    birdAt(pos[0], pos[1], 34, rot, F.cream2, 0);
    if (t >= land) {
      // 皱掉 + 撕开的一道口子(伤疤)
      paint([[pos[0] - 26, pos[1] + 4], [pos[0] + 24, pos[1] - 6], [pos[0] + 20, pos[1] + 16], [pos[0] - 22, pos[1] + 14]], { wash: mixCol(F.cream2, F.grey, .45), ink: null });
      ln([[pos[0] - 14, pos[1] + 2], [pos[0] + 2, pos[1] + 8], [pos[0] + 16, pos[1] - 2]], 1.2, '#8C3A46', 'inkfine', .6);
    }
    coldVeil(.55 + (t >= land ? .3 : 0), F.greyLo);
    camEnd();
    wipeOut(lt, D, .8, [F.greyLo, F.grey]);
  };

  shots([[T9, s9], [T10, s10], [T11, s11], [T12, s12]]);
})();
