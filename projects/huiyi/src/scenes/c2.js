// c2.js — 第二章 · 游戏与剧(10.68–20.79 s)
// 词:我们从清晨起玩一整天游戏 / 到夜晚一起看我最爱的剧 / 能够拥有这些已足够幸运 / 我已经不再期待其他什么东西
//
// 从早到晚的一间小屋:两个人,一块会发光的屏幕,一盒慢慢攒起来的回忆纸片。
// 颜色弧:清晨的暖白 → 夜里的琥珀灯。架子上的纸盒是记号(第 5 章会打开它)。
(() => {
  const GROUND = H * .78, HERO_X = W * .38, DEAR_X = W * .60;
  const HERO_U = 25, DEAR_U = 25;
  const TVX = W * .27, TVY = H * .30, TVW = W * .20, TVH = H * .25;
  const SHELF_X = W * .03, SHELF_Y = H * .28;
  const BOX_X = SHELF_X + W * .12, BOX_Y = SHELF_Y - 5;
  const T5 = 10.68, T6 = 13.23, T7 = 15.87, T8 = 17.97;

  // ---- 第 5 镜(10.68–13.23):从清晨起玩一整天游戏 ----
  // reads: ① 清晨的小屋,屏幕亮着(0–0.85) ② 两个人在玩,跟着拍子跳(0.85–1.75) ③ 阳光扫过墙,纸片飘起来(1.75–2.55)
  const s5 = (t, lt, D) => {
    const day = ease(seg(lt, .4, D));
    camBegin(W * .46, H * .56, lerp(1.04, .98, ease(seg(lt, 0, D))), 0);
    littleRoom(t, { fy: GROUND, night: 0, winX: W * .84, lampX: W * .13, rugX: W * .48 });
    // 早上从窗口斜进来的阳光
    boilSeed('s5sun');
    paint([[W * .70, H * .14], [W * .95, H * .14], [W * .72, H * .80], [W * .34, H * .80]], { wash: '#FFE6AE', washOp: 40 * day, ink: null });
    // 电视柜 + 电视
    slab(TVX - TVW * .62, TVY + TVH * .5 + 6, TVW * 1.24, H * .10, '#8E6E4E', 2);
    tvAt(TVX, TVY, TVW, TVH, t, 'game');
    // 两个人背对着我们,在屏幕前玩,跟着拍子跳
    const hopA = jump(t, T5 + .9, T5 + 1.25, 1.6), hopB = jump(t, T5 + 1.25, T5 + 1.6, 1.9);
    const moodA = emotions(t, [[T5, 'neutral'], [T5 + .9, 'excited', { emote: 'spark' }]]);
    const moodB = emotions(t, [[T5, 'neutral'], [T5 + 1.25, 'excited', { emote: 'music' }]]);
    hero(HERO_X, GROUND, HERO_U, { ...moodA, view: 'qback', flip: true, dy: (moodA.dy || 0) + hopA.dy, sq: (moodA.sq || 0) + hopA.sq, boilKey: 'hero2' });
    dear(DEAR_X, GROUND, DEAR_U, { ...moodB, view: 'qback', flip: true, dy: (moodB.dy || 0) + hopB.dy, sq: (moodB.sq || 0) + hopB.sq, boilKey: 'dear2' });
    // 屏幕的光洒在他们背上
    pool(TVX + 30, GROUND + 6, 120, .5, '#BFE2F0');
    // 飘起来的记忆纸片(它们会积成那个盒子)
    boilSeed('s5scraps');
    for (let i = 0; i < 7; i++) {
      const ph = frac(t * .16 + hash(i * 3.7));
      const sx = W * (.18 + hash(i * 5.1) * .66) + Math.sin(t * .8 + i) * 16;
      const sy = H * .82 - ph * H * .55;
      scrapAt(sx, sy, 12 + hash(i) * 5, t * .5 + i, F.cream2, i % 2 ? F.blue : F.rose);
    }
    camEnd();
    wipeIn(lt, .7, [F.gold, F.cream2]);
  };

  // ---- 第 6 镜(13.23–15.87):到夜晚一起看我最爱的剧 ----
  // reads: ① 天黑了,只有屏幕亮着,一条毯子(0–0.9) ② 两个人靠在一起看(0.9–1.8) ③ 她点头,猛地又惊醒(1.8–2.64)
  const s6 = (t, lt, D) => {
    camBegin(W * .50, H * .56, lerp(.98, 1.02, ease(seg(lt, .6, D))), 0);
    littleRoom(t, { fy: GROUND, night: 1, winX: W * .86, lampX: W * .13, rugX: W * .5 });
    tvAt(TVX, TVY, TVW, TVH, t, 'show');
    pool(TVX + 40, GROUND + 10, 150, .7, '#BFE2F0');
    // 沙发 + 毯子 + 两个人
    sofaAt(W * .58, GROUND + H * .04, W * .48);
    const nod = lt < 1.7 ? Math.sin(lt * 3.4) * .8 : (lt < 2.05 ? -1.4 : .2);
    const moodA = emotions(t, [[T6, 'happy'], [T6 + 1.7, 'sleepy', { lookY: .3 }]]);
    const moodB = emotions(t, [[T6, 'happy'], [T6 + 1.8, 'sleepy', { lookY: .4 }], [T6 + 2.12, 'surprised', { lookY: 0 }]]);
    hero(W * .49, GROUND + H * .01, HERO_U, { ...moodA, view: 'front', boilKey: 'hero2' });
    dear(W * .65, GROUND + H * .01, DEAR_U, { ...moodB, view: 'front', dy: (moodB.dy || 0) + nod, boilKey: 'dear2' });
    blanketAt(W * .57, GROUND - H * .075, W * .30, H * .065, '#C4744F');
    camEnd();
  };

  // ---- 第 7 镜(15.87–17.97):能够拥有这些已足够幸运 ----
  // reads: ① 我的脸(0–0.7) ② 看向架子上的纸盒(0.7–1.3) ③ 闭上眼睛,冒出一颗心(1.3–2.1)
  const s7 = (t, lt, D) => {
    const look = seg(lt, .55, 1.15);
    camBegin(lerp(W * .46, W * .36, ease(look)), H * .44, lerp(1.34, 1.20, ease(look)), 0);
    littleRoom(t, { fy: GROUND, night: 1, winX: W * .86, lampX: W * .13, rug: false });
    shelfAt(SHELF_X, SHELF_Y, W * .22);
    boxAt(BOX_X, BOX_Y, 34, 0, '#B98A5E');
    for (let i = 0; i < 3; i++) scrapAt(BOX_X - 9 + i * 9, BOX_Y - 30, 11, i, F.cream2, i % 2 ? F.blue : F.rose);
    tvAt(TVX, TVY, TVW, TVH, t, 'show');
    const mood = emotions(t, [[T7, 'happy', { lookX: .3 }], [T7 + .6, 'happy', { lookX: -1, lookY: -.5 }], [T7 + 1.35, 'happy', { lookX: 0, lookY: 0, emote: 'heart' }]]);
    hero(W * .40, GROUND + H * .02, HERO_U * 1.2, { ...mood, view: 'front', boilKey: 'hero2' });
    camEnd();
  };

  // ---- 第 8 镜(17.97–20.79):我已经不再期待其他什么东西 ----
  // reads: ① 把纸盒往架子里推(0–0.95) ② 转身(0.95–1.65) ③ 靠在她的肩上,一起安静下来(1.65–2.82)
  const s8 = (t, lt, D) => {
    const push = seg(lt, 0, .9), turn = seg(lt, .95, 1.6);
    camBegin(lerp(W * .44, W * .50, ease(turn)), H * .50, lerp(1.20, 1.04, ease(turn)), 0);
    littleRoom(t, { fy: GROUND, night: 1, winX: W * .86, lampX: W * .13, rug: false });
    shelfAt(SHELF_X, SHELF_Y, W * .22);
    // 盒子被推进架子深处
    const bx = lerp(BOX_X, SHELF_X + 10, ease(push));
    boxAt(bx, BOX_Y, 34, 0, '#B98A5E');
    for (let i = 0; i < 3; i++) scrapAt(bx - 9 + i * 9, BOX_Y - 30, 11, i, F.cream2, i % 2 ? F.blue : F.rose);
    sofaAt(W * .58, GROUND + H * .04, W * .48);
    // 她坐在那儿;我先看盒子,再转过去靠着她
    dear(W * .66, GROUND + H * .01, DEAR_U, { ...emotions(t, [[T8, 'happy'], [T8 + 1.6, 'love', { lookX: -.6 }]]), view: 'front', flip: true, boilKey: 'dear2' });
    const mood = emotions(t, [[T8, 'happy', { lookX: -1, lookY: -.3 }], [T8 + 1.5, 'love', { lookX: .6, lookY: .1 }], [T8 + 2.2, 'relieved', { lookX: .5 }]]);
    const lean = ease(seg(lt, 1.55, 2.3)) * .13;
    hero(W * .46 + turn * 44, GROUND + H * .01, HERO_U, { ...mood, view: 'front', rot: lean, dy: (mood.dy || 0) - lean * 24, boilKey: 'hero2' });
    blanketAt(W * .56, GROUND - H * .075, W * .28, H * .065, '#C4744F');
    camEnd();
    wipeOut(lt, D, .7, ['#8E6E86', '#C4744F']);
  };

  shots([[T5, s5], [T6, s6], [T7, s7], [T8, s8]]);
})();
