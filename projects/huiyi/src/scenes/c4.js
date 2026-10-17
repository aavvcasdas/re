// c4.js — 第四章 · 折花与烟花(30.99–40.17 s)
// 词:而那些你送我的梦 教我折的花 / 逃亡的盛夏 / 在夜空隐没之际 为我点燃烟花 / 寂寞时让我把快乐拼起来吧
//
// 转折:颜色回来了。教我折花的那双手,变成一只能飞起来的纸鹤;
// 烟花是这片 MV 的第一个高潮,最后一件坏事(扔掉)被一件好事(拼起来)接住。
(() => {
  const GROUND = H * .78, T13 = 30.99, T14 = 33.78, T15 = 35.01, T16 = 37.56;
  const HERO_U = 26;

  // ---- 第 13 镜(30.99–33.78):而那些你送我的梦 教我折的花 ----
  // reads: ① 在窗边的桌前折纸(0–1.05) ② 纸自己展开成一朵花(1.05–1.9) ③ 花开了,屋子暖起来(1.9–2.79)
  const s13 = (t, lt, D) => {
    const open = ease(seg(lt, 1.0, 2.0));
    camBegin(W * .48, H * .50, lerp(1.04, 1.16, ease(seg(lt, .6, D))), 0);
    littleRoom(t, { fy: GROUND, night: 1, winX: W * .80, lampX: W * .12, rugX: W * .5, plant: true });
    // 桌上的一盏小灯
    slab(W * .60, GROUND - 74, 26, 30, '#C49A6E', 1);
    glow(W * .60, GROUND - 86, 70, '#FFD79A', .7);
    // 桌 + 折纸的手
    const TX = W * .40, TY = GROUND - H * .13;
    tableAt(TX, TY, W * .30, '#B2835A', H * .14);
    const mood = emotions(t, [[T13, 'sad', { lookX: -.2, lookY: .3 }], [T13 + .9, 'thinking', { lookX: 0, lookY: -.2 }], [T13 + 1.9, 'hopeful', { lookX: 0, lookY: -.3 }]]);
    hero(TX - 8, GROUND, HERO_U, { ...mood, view: 'front', aL: -0.9, aR: -0.9, dy: (mood.dy || 0) + 4, boilKey: 'hero4' });
    // 手里那张纸 → 一朵折出来的花
    const fx = TX + 18, fy = TY - 22;
    if (open < .05) {
      paint([[fx - 13, fy + 4], [fx + 13, fy + 4], [fx + 9, fy - 9], [fx - 9, fy - 9]], { wash: F.cream2, ink: null });
      ln([[fx - 9, fy - 9], [fx + 9, fy - 9], [fx + 4, fy + 4], [fx - 4, fy + 4], [fx - 9, fy - 9]], .8, F.inkSoft, 'inkfine', 0);
    } else {
      paperFlowerAt(fx, fy, 46 * (.35 + .65 * open), F.cream2, F.rose, open);
    }
    if (open > .8) glow(fx, fy, 110, '#FFE0A8', .55 * (open - .8) / .2);
    // 屋子暖回来了
    paint(rectPts(-20, -20, W + 40, H + 40, 0), { wash: '#F2C182', washOp: 60 * open, ink: null });
    camEnd();
    wipeIn(lt, .7, [F.gold, F.cream2]);
  };

  // ---- 第 14 镜(33.78–35.01):逃亡的盛夏 ----
  // reads: ① 花落进水洼(0–0.45) ② 变成一只纸船(0.45–0.85) ③ 一脚,水花(0.85–1.23)
  const s14 = (t, lt, D) => {
    const drop = seg(lt, 0, .45), boat = seg(lt, .45, .85), push = seg(lt, .85, 1.0);
    camBegin(W * .5, H * .70, 1.18, 0);
    // 夏天的街:蓝天、树、人行道、一滩水
    boilSeed('s14sky');
    band(-40, H * .30, '#9FD3E8', 255);
    band(H * .26, H * .44, '#C8E4EE', 255);
    // 远处的树
    for (let i = 0; i < 5; i++) {
      const tx = W * (.05 + i * .23), ty = H * .46;
      ln([[tx, ty], [tx, ty - 34]], 3, '#7A5A44', 'ink', 0);
      paint(ellPts(tx, ty - 52, 34, 28, 16, 2), { wash: '#7FA86A', ink: null });
      paint(ellPts(tx - 12, ty - 40, 22, 18, 14, 2), { wash: '#8FB87A', ink: null });
    }
    band(H * .44, H * .56, '#B7C98E', 255);
    band(H * .54, H * .68, '#A8BE7E', 255);
    band(H * .66, H + 40, '#CFC3A6', 255);          // 人行道
    slab(-20, H * .655, W + 40, 9, '#A79C82', 3, 220);
    // 水洼
    paint(ellPts(W * .52, H * .80, W * .34, H * .085, 26, 3), { wash: mixCol(F.sky, '#FFF', .25), ink: null });
    paint(ellPts(W * .52, H * .80, W * .30, H * .070, 24, 2.5), { wash: mixCol('#9FD3E8', '#FFF', .2), ink: null });
    // 纸花掉下去 → 变成纸船
    const bx = W * .52, by = H * .80;
    if (boat < .5) {
      const py = lerp(H * .40, H * .78, drop * drop);
      paperFlowerAt(bx, py, 26 * (1 - drop * .4), F.cream2, F.rose, 1 - drop);
    } else {
      // 纸船
      const s = 46;
      paint([[bx - s, by - 6], [bx + s, by - 6], [bx + s * .55, by + 6], [bx - s * .55, by + 6]], { wash: F.cream2, ink: null });
      paint([[bx - s * .5, by - 6], [bx, by - s * .62], [bx + s * .5, by - 6]], { wash: mixCol(F.cream2, F.ink, .12), ink: null });
      ln([[bx - s, by - 6], [bx + s, by - 6]], .9, F.inkSoft, 'inkfine', 0);
    }
    // 一只脚从右边伸进来,把船推开(逃亡)
    if (push > 0 || lt > .78) {
      const inK = seg(lt, .78, .95), k = ease(push);
      const fx0 = W * 1.02 - inK * W * .30 - k * 70;
      slab(fx0, H * .62, W * .30, H * .075, '#7A5A44', 2);            // 腿
      paint([[fx0 - 6, H * .62], [fx0 - 34, H * .645], [fx0 - 38, H * .70], [fx0 + 4, H * .70]], { wash: '#8E6A50', ink: null }); // 鞋
    }
    // 一脚踢过去:水花
    if (push > 0) {
      const k = ease(push);
      paint(ellPts(bx + 34 * k, by - 4, 26 * (1 - k * .4), 12 * (1 - k * .4), 18, 2), { wash: F.cream2, washOp: 190 * (1 - k), ink: null });
      for (let i = 0; i < 6; i++) {
        const a = -Math.PI * .5 + (hash(i * 3.1) - .5) * 2.2;
        dotAt(bx + 34 * k + Math.cos(a) * 40 * k, by + Math.sin(a) * 40 * k, 2 + hash(i) * 2, F.cream2, 200 * (1 - k));
      }
    }
    camEnd();
  };

  // ---- 第 15 镜(35.01–37.56):在夜空隐没之际 为我点燃烟花 ----
  // reads: ① 屋顶上的夜(0–0.7) ② 第一朵烟花炸开(0.7–1.5) ③ 一朵接一朵,纸鹤飞上去(1.5–2.55)
  const s15 = (t, lt, D) => {
    const bursts = [[.72, .58, F.fwGold, 1.15], [1.32, .26, F.fwRose, .95], [1.86, .74, F.fwTeal, .85], [2.16, .44, F.fwViolet, .8]];
    camBegin(W * .5, H * .46, lerp(1.0, 1.1, ease(seg(lt, .4, D))), 0);
    roofNight(t, {});
    // 烟花
    for (const [bt, bx, col, sc] of bursts) {
      const age = lt - bt;
      if (age < 0 || age > 1.5) continue;
      fireworkAt(W * bx, H * (.09 + hash(bt * 7.7) * .14), age, col, 155 * sc);
    }
    // 纸鹤飞上去
    const fly = seg(lt, 1.75, 2.55);
    const bx = lerp(W * .42, W * .30, fly), by = lerp(H * .42, H * .08, ease(fly));
    birdAt(bx, by, 34, -.25 - fly * .2, F.cream2, Math.abs(Math.sin(lt * 6)) * .8);
    // 我在屋顶上看着
    const mood = emotions(t, [[T15, 'neutral'], [T15 + .8, 'surprised', { lookX: .2, lookY: -.4 }], [T15 + 1.5, 'starstruck', { lookX: .1, lookY: -.4 }]]);
    hero(W * .40, H * .78, HERO_U * 1.05, { ...mood, view: 'front', aR: 1.1, aL: -.4, boilKey: 'hero4' });
    camEnd();
  };

  // ---- 第 16 镜(37.56–40.17):寂寞时让我把快乐拼起来吧 ----
  // reads: ① 地上散着的纸片(0–0.8) ② 一片一片拼起来(0.8–1.85) ③ 拼好的画亮起来(1.85–2.61)
  const s16 = (t, lt, D) => {
    const N = 6;
    const put = i => clamp(seg(lt, .75 + i * .18, 1.0 + i * .18));
    camBegin(W * .5, H * .56, lerp(1.06, 1.0, ease(seg(lt, .5, D))), 0);
    littleRoom(t, { fy: GROUND, night: 1, winX: W * .84, lampX: W * .12, rug: false });
    // 地板上的拼图
    const MX = W * .40, MY = GROUND - H * .02, MS = 48;
    for (let i = 0; i < N; i++) {
      const col = i % 3, row = (i / 3) | 0;
      const px = MX + (col - 1) * MS, py = MY + row * MS * .92;
      const k = put(i);
      const sx = px + (1 - k) * (hash(i * 5.1) - .5) * 180, sy = py + (1 - k) * (hash(i * 3.3) - .5) * 90;
      const rot = (1 - k) * (hash(i * 7.7) - .5) * 1.6;
      paint([[sx - MS * .42, sy - MS * .40], [sx + MS * .42, sy - MS * .40], [sx + MS * .42, sy + MS * .40], [sx - MS * .42, sy + MS * .40]],
            { wash: i % 2 ? F.cream2 : mixCol(F.cream2, F.rose, .18), ink: null });
      // 碎片里画着的一小块回忆
      if (i % 2 === 0) paint(ellPts(sx, sy, MS * .22, MS * .16, 12, .8), { wash: F.blue, ink: null });
      else paint([[sx - MS * .3, sy + MS * .2], [sx, sy - MS * .28], [sx + MS * .3, sy + MS * .2]], { wash: F.gold, ink: null });
      ln([[sx - MS * .42, sy - MS * .40], [sx + MS * .42, sy - MS * .40], [sx + MS * .42, sy + MS * .40], [sx - MS * .42, sy + MS * .40], [sx - MS * .42, sy - MS * .40]], .8, F.inkSoft, 'inkfine', 0);
    }
    // 拼好之后,画亮起来
    const all = put(N - 1);
    if (all > .05) glow(MX, MY + MS * .3, 120 * all, '#FFD79A', .45 * all);
    // 我趴在地上拼
    const mood = emotions(t, [[T16, 'sad', { lookX: 0, lookY: .4 }], [T16 + 1.1, 'determined', { lookX: 0, lookY: .2 }], [T16 + 2.0, 'happy', { lookX: -.2, lookY: 0 }]]);
    hero(W * .80, GROUND, HERO_U, { ...mood, view: 'front', aL: -1.2, aR: -1.2, rot: .12, dy: (mood.dy || 0) + 6, boilKey: 'hero4' });
    camEnd();
    wipeOut(lt, D, .7, [F.gold, F.cream2]);
  };

  shots([[T13, s13], [T14, s14], [T15, s15], [T16, s16]]);
})();
