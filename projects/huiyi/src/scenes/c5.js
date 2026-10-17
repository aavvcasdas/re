// c5.js — 第五章 · 我们之间的回忆(40.17–60.69 s)
// 词:我们之间的回忆 / 全部都小心地收集 / 我总是偷偷地哭泣 / 像倦鸟失了归期 / 但愿我相信的爱情 / 结局紧握在我手心 / 时光匆匆却没有遗失过去
//
// 副歌:把回忆一件件捡起来。盒子里的纸片飞出来又飞回去;最后时间在窗前转了一圈,
// 什么都没有丢——盒子还是满的。
(() => {
  const GROUND = H * .80, T17 = 40.17, T18 = 42.69, T19 = 45.21, T20 = 47.73, T21 = 50.31, T22 = 52.80, T23 = 55.29;
  const HERO_U = 25, DEAR_U = 25;
  const BOX_X = W * .5, BOX_Y = GROUND - 8;

  // ---- 第 17 镜(40.17–42.69):我们之间的回忆 ----
  // reads: ① 纸盒打开(0–0.7) ② 纸片一件件飞出来,在空中变成回忆(0.7–1.7) ③ 两个人都抬起头看(1.7–2.52)
  const s17 = (t, lt, D) => {
    const open = seg(lt, 0, .6), rise = clamp(seg(lt, .55, 2.1));
    camBegin(W * .5, H * .52, lerp(1.04, .98, ease(seg(lt, 0, D))), 0);
    littleRoom(t, { fy: GROUND - H * .04, night: 1, winX: W * .86, lampX: W * .13, rug: false });
    // 两个人站在盒边
    hero(W * .32, GROUND - H * .04, HERO_U, { ...emotions(t, [[T17, 'neutral'], [T17 + .7, 'surprised', { lookX: .2, lookY: -.3 }], [T17 + 1.7, 'happy', { lookX: 0, lookY: -.4 }]]), view: 'q', boilKey: 'hero5' });
    dear(W * .68, GROUND - H * .04, DEAR_U, { ...emotions(t, [[T17, 'neutral'], [T17 + .7, 'surprised', { lookX: -.2, lookY: -.3 }], [T17 + 1.7, 'happy', { lookX: 0, lookY: -.4 }]]), view: 'q', flip: true, boilKey: 'dear5' });
    // 盒子
    boxAt(BOX_X, BOX_Y, 62, open * .9, '#B98A5E');
    // 纸片从盒子里飞出来
    boilSeed('s17fly');
    for (let i = 0; i < 9; i++) {
      const ph = clamp(rise * 1.35 - hash(i * 3.7) * .55);
      if (ph <= 0) continue;
      const a = -Math.PI * .5 + (hash(i * 5.1) - .5) * 2.4;
      const d = 30 + ph * (120 + hash(i * 2.2) * 190);
      const px = BOX_X + Math.cos(a) * d, py = BOX_Y - 20 + Math.sin(a) * d * .8;
      scrapAt(px, py, 13 + hash(i) * 6, ph * 2 + i, F.cream2, i % 3 ? F.blue : F.rose);
    }
    camEnd();
    wipeIn(lt, .7, [F.gold, F.cream2]);
  };

  // ---- 第 18 镜(42.69–45.21):全部都小心地收集 ----
  // reads: ① 一双手把纸片放进盒子里,一片一片(0–1.1) ② 每放一片,亮一下(1.1–1.9) ③ 盖上盒盖(1.9–2.52)
  const s18 = (t, lt, D) => {
    const N = 4, put = i => clamp(seg(lt, .25 + i * .34, .55 + i * .34));
    camBegin(W * .5, H * .56, lerp(1.12, 1.02, ease(seg(lt, .5, D))), 0);
    littleRoom(t, { fy: GROUND - H * .04, night: 1, winX: W * .86, lampX: W * .13, rug: false });
    boxAt(BOX_X, BOX_Y, 62, .85, '#B98A5E');
    // 一片一片放进去
    for (let i = 0; i < N; i++) {
      const k = put(i);
      const px = BOX_X + (1 - k) * ((hash(i * 5.1) - .5) * 220), py = BOX_Y - 150 * (1 - k) - 6;
      scrapAt(px, py, 15, (1 - k) * 1.2 + i, F.cream2, i % 2 ? F.blue : F.rose);
      if (k > .55 && k < .95) glow(px, py, 34, '#FFD79A', (1 - Math.abs(k - .75) / .2) * .5);
    }
    // 盖上盖子
    const shut = seg(lt, 1.95, 2.4);
    if (shut > 0) boxAt(BOX_X, BOX_Y, 62, .85 * (1 - shut), '#B98A5E');
    // 两个人蹲在盒子两边
    hero(W * .27, GROUND - H * .04, HERO_U, { ...emotions(t, [[T18, 'happy', { lookX: .3, lookY: .2 }]]), view: 'q', aL: -.8, boilKey: 'hero5' });
    dear(W * .73, GROUND - H * .04, DEAR_U, { ...emotions(t, [[T18, 'happy', { lookX: -.3, lookY: .2 }]]), view: 'q', flip: true, aR: -.8, boilKey: 'dear5' });
    camEnd();
  };

  // ---- 第 19 镜(45.21–47.73):我总是偷偷地哭泣 ----
  // reads: ① 我一个人在窗前(0–0.8) ② 眼泪掉下来,趁没人看见擦掉(0.8–1.7) ③ 回头看一眼那个盒子(1.7–2.52)
  const s19 = (t, lt, D) => {
    const look = seg(lt, 1.7, 2.2);
    camBegin(lerp(W * .42, W * .50, ease(look)), H * .50, lerp(1.14, 1.06, ease(look)), 0);
    littleRoom(t, { fy: GROUND - H * .04, night: 1, winX: W * .70, lampX: W * .10, rug: false });
    boxAt(W * .78, GROUND - H * .04 - 8, 56, 0, '#B98A5E');
    const mood = emotions(t, [[T19, 'sad', { lookX: -.2, lookY: .2 }], [T19 + .9, 'cry', { lookX: -.3 }], [T19 + 1.8, 'sad', { lookX: .8, lookY: .1 }]]);
    hero(W * .34, GROUND - H * .04, HERO_U, { ...mood, view: 'q', boilKey: 'hero5' });
    // 偷偷擦掉的眼泪
    boilSeed('s19tears');
    if (lt > .7 && lt < 1.9) {
      for (let i = 0; i < 3; i++) {
        const age = lt - .8 - i * .28; if (age < 0 || age > .8) continue;
        dotAt(W * .34 + 16, GROUND - H * .04 - 150 + age * 120, 2.2, F.blueLt, 210 * (1 - age / .8));
      }
    }
    camEnd();
  };

  // ---- 第 20 镜(47.73–50.31):像倦鸟失了归期 ----
  // reads: ① 黄昏的天空,纸鹤在飞(0–0.9) ② 它绕了一圈,找不到落脚的地方(0.9–1.85) ③ 还是继续往前飞(1.85–2.58)
  const s20 = (t, lt, D) => {
    const fly = frac(lt * .16 + .1);
    camBegin(W * .5, H * .42, lerp(.92, 1.06, ease(seg(lt, 0, D))), 0);
    boilSeed('s20sky');
    band(-40, H * .38, '#6C7EA0', 255);
    band(H * .30, H * .62, '#9C8AA8', 255);
    band(H * .54, H + 40, '#E0A98E', 255);
    glow(W * .30, H * .40, 200, '#FFC978', .45);
    // 几只倦鸟的影子(小黑色的 v)
    boilSeed('s20birds');
    for (let i = 0; i < 5; i++) {
      const bx = W * (.1 + hash(i * 3.3) * .8) + Math.sin(t * .6 + i) * 20;
      const by = H * (.12 + hash(i * 7.1) * .18);
      ln([[bx - 8, by - 4], [bx, by + 3], [bx + 8, by - 4]], 1.3, mixCol(F.ink, '#6C7EA0', .3), 'inkfine', .8);
    }
    // 远处的屋顶
    ridgeAt(H * .70, '#4A4258', 2);
    ridgeAt(H * .78, '#3A3448', 5);
    // 纸鹤:绕圈飞
    const a = lt * 1.15, px = W * .5 + Math.cos(a) * W * .26, py = H * .34 + Math.sin(a * 1.3) * H * .12;
    birdAt(px, py, 38, Math.cos(a) * .5 - .15, F.cream2, Math.abs(Math.sin(lt * 5.5)) * .9);
    camEnd();
  };

  // ---- 第 21 镜(50.31–52.80):但愿我相信的爱情 ----
  // reads: ① 我手里捧着那朵折纸花(0–0.9) ② 花瓣里透出光(0.9–1.8) ③ 我笑起来(1.8–2.49)
  const s21 = (t, lt, D) => {
    const lit = ease(seg(lt, .8, 1.8));
    camBegin(W * .46, H * .48, lerp(1.18, 1.28, ease(seg(lt, .3, D))), 0);
    littleRoom(t, { fy: GROUND - H * .04, night: 1, winX: W * .84, lampX: W * .12, rug: false });
    const mood = emotions(t, [[T21, 'hopeful', { lookY: .1 }], [T21 + 1.8, 'love', { lookY: 0 }]]);
    hero(W * .46, GROUND - H * .04, HERO_U * 1.15, { ...mood, view: 'front', aL: -1.15, aR: -1.15, boilKey: 'hero5' });
    // 双手捧着的花
    paperFlowerAt(W * .46, GROUND - H * .04 - 130, 40, F.cream2, F.rose, .6 + lit * .4);
    glow(W * .46, GROUND - H * .04 - 130, 90 + lit * 60, '#FFE0A8', .35 + lit * .4);
    camEnd();
  };

  // ---- 第 22 镜(52.80–55.29):结局紧握在我手心 ----
  // reads: ① 一只手握成拳(0–0.85) ② 手心里透出光(0.85–1.7) ③ 打开:是一颗折出来的小心(1.7–2.49)
  const s22 = (t, lt, D) => {
    const openK = ease(seg(lt, 1.6, 2.3));
    camBegin(W * .5, H * .52, lerp(1.5, 1.62, ease(seg(lt, 0, D))), 0);
    littleRoom(t, { fy: GROUND - H * .04, night: 1, winX: W * .86, lampX: W * .12, rug: false });
    // 一只大手(陶土色的手掌),握着 → 打开
    const HX = W * .5, HY = GROUND - H * .12;
    paint(rrPts(HX - 66, HY - 52, 132, 104 - openK * 12, 26, 2), { wash: F.clay, ink: null });
    ln(rrPts(HX - 66, HY - 52, 132, 104 - openK * 12, 26, 2), 1.4, F.ink, 'inkfine', .8);
    // 指缝线
    for (let i = 0; i < 3; i++) ln([[HX - 40 + i * 34, HY - 50], [HX - 36 + i * 34, HY - 18 - openK * 10]], 1, F.clayDk, 'inkfine', .6);
    // 手心里的东西:光 → 一颗小心
    if (openK < .5) {
      glow(HX, HY - 6, 40 + openK * 80, '#FFD79A', .6);
    } else {
      const k = (openK - .5) * 2;
      paint(heartPts(HX, HY - 12, 26 + k * 10), { wash: F.rose, ink: null });
      glow(HX, HY - 12, 70 + k * 40, '#FFB2C0', .5);
    }
    camEnd();
  };

  // ---- 第 23 镜(55.29–60.69):时光匆匆却没有遗失过去 ----
  // reads: ① 窗前的钟转起来(0–1.2) ② 窗外一季一季地换(1.2–3.2) ③ 钟停了,盒子还是满的(3.2–5.4)
  const s23 = (t, lt, D) => {
    const spin = seg(lt, 0, 3.2), season = Math.floor(seg(lt, .6, 4.4) * 4) % 4;
    camBegin(W * .5, H * .48, lerp(1.0, 1.10, ease(seg(lt, .5, D))), 0);
    littleRoom(t, { fy: GROUND - H * .04, night: 1, winX: W * .82, lampX: W * .12, rug: false, clock: false });
    // 大钟:指针飞快地转
    const CX = W * .34, CY = H * .24, CR = 46;
    paint(ellPts(CX, CY, CR, CR, 24, 1), { wash: F.cream2, ink: null });
    ln(ellPts(CX, CY, CR, CR, 24, 1), 1.4, F.ink, 'inkfine', 1);
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * TAU;
      dotAt(CX + Math.cos(a) * CR * .82, CY + Math.sin(a) * CR * .82, 2.2, F.inkSoft, 220);
    }
    const ang = -1.57 + spin * TAU * 6 + (lt > 3.2 ? 0 : 0);
    ln([[CX, CY], [CX + Math.cos(ang) * CR * .55, CY + Math.sin(ang) * CR * .55]], 1.8, F.ink, 'ink', 0);
    ln([[CX, CY], [CX + Math.cos(ang * 7) * CR * .78, CY + Math.sin(ang * 7) * CR * .78]], 1.2, F.clayDk, 'inkfine', 0);
    // 窗外的季节
    const wx = W * .74, wy = H * .20, ww = W * .16, wh = H * .26;
    slab(wx - 6, wy - 6, ww + 12, wh + 12, '#5A4A3C', 1.5);
    slab(wx, wy, ww, wh, ['#BFE2F0', '#F0C79A', '#C8D9A8', '#D8E4EE'][season], 1.2);
    if (season === 0) paint(ellPts(wx + ww * .7, wy + wh * .3, ww * .12, ww * .12, 12, .8), { wash: F.cream2, ink: null });
    if (season === 1) for (let i = 0; i < 4; i++) dotAt(wx + ww * (.2 + hash(i * 3.3) * .6), wy + wh * (.3 + hash(i) * .5), 2, '#E8A0B0', 200);
    if (season === 2) for (let i = 0; i < 4; i++) dotAt(wx + ww * (.2 + hash(i * 5.1) * .6), wy + wh * (.2 + hash(i * 2.2) * .5), 2, '#E8C878', 200);
    if (season === 3) for (let i = 0; i < 5; i++) dotAt(wx + ww * hash(i * 7.7), wy + wh * frac(t * .2 + hash(i)), 1.8, F.cream2, 180);
    // 盒子:一直好好收着
    boxAt(W * .20, GROUND - H * .04 - 8, 52, 0, '#B98A5E');
    hero(W * .56, GROUND - H * .04, HERO_U, { ...emotions(t, [[T23, 'sad', { lookX: .4 }], [T23 + 3.4, 'hopeful', { lookX: .2 }]]), view: 'q', boilKey: 'hero5' });
    camEnd();
    wipeOut(lt, D, .7, [F.blueDk, F.gold]);
  };

  shots([[T17, s17], [T18, s18], [T19, s19], [T20, s20], [T21, s21], [T22, s22], [T23, s23]]);
})();
