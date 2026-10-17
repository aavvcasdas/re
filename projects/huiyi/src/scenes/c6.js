// c6.js — 第六章 · 长大(60.69–80.83 s)
// 词:我们可以就像是孩子一样成长 / 永远无所畏惧义无反顾向着未知的前方 / 原来我们每天努力长成看似大人的模样 / 为了可以一起跨越山和海洋
//
// 整片最亮的一段:夏天、奔跑、假装大人,然后真的跨过了山和海。
(() => {
  const GROUND = H * .72, T24 = 60.69, T25 = 65.76, T26 = 70.86, T27 = 75.87;
  const HERO_U = 24, DEAR_U = 24;

  // ---- 第 24 镜(60.69–65.76):我们可以就像是孩子一样成长 ----
  // reads: ① 夏天的小镇,晾着的衣服(0–0.9) ② 两个人像孩子一样跳房子(0.9–2.4) ③ 纸鹤风筝飞起来(2.4–5.07)
  const s24 = (t, lt, D) => {
    camBegin(W * .5, H * .54, lerp(1.0, .96, ease(seg(lt, 0, D))), 0);
    summerTown(t, { base: H * .62 });
    // 画在地上的跳房子格
    boilSeed('s24hop');
    for (let i = 0; i < 5; i++) {
      const hx = W * .16 + i * W * .13, hy = H * .80 + (i % 2 ? 8 : -4);
      ln([[hx - 30, hy - 18], [hx + 30, hy - 18], [hx + 30, hy + 18], [hx - 30, hy + 18], [hx - 30, hy - 18]], 1.2, F.cream2, 'inkfine', 0);
    }
    // 跳:一个接一个(错开半拍,不要同步)
    const hopA = jump(t, T24 + .95, T24 + 1.35, 2.2), hopB = jump(t, T24 + 1.45, T24 + 1.85, 2.6);
    const hopA2 = jump(t, T24 + 2.4, T24 + 2.8, 2.2), hopB2 = jump(t, T24 + 2.9, T24 + 3.3, 2.6);
    hero(W * .34, H * .80, HERO_U, { ...emotions(t, [[T24, 'happy'], [T24 + .95, 'excited', { emote: 'spark' }]]), view: 'front', dy: hopA.dy + hopA2.dy, sq: hopA.sq + hopA2.sq, aL: .8, aR: .8, boilKey: 'hero6' });
    dear(W * .56, H * .80, DEAR_U, { ...emotions(t, [[T24, 'happy'], [T24 + 1.45, 'laugh', { emote: 'music' }]]), view: 'front', dy: hopB.dy + hopB2.dy, sq: hopB.sq + hopB2.sq, aL: .9, aR: .9, boilKey: 'dear6' });
    // 纸鹤风筝:线牵在她手里
    const kx = W * .80 + Math.sin(t * .5) * 26, ky = H * .16 + Math.cos(t * .7) * 12;
    ln([[W * .56 + 60, H * .60], [kx - 20, ky + 40]], .9, F.inkSoft, 'inkfine', 1);
    birdAt(kx, ky, 30, -.2 + Math.sin(t * .8) * .12, F.cream2, Math.abs(Math.sin(t * 4)) * .7);
    camEnd();
    wipeIn(lt, .7, [F.gold, '#9FD3E8']);
  };

  // ---- 第 25 镜(65.76–70.86):永远无所畏惧义无反顾向着未知的前方 ----
  // reads: ① 通往前方的路(0–0.9) ② 两个人一起往前跑,纸鹤带路(0.9–3.4) ③ 太阳在前面升起(3.4–5.1)
  const s25 = (t, lt, D) => {
    camBegin(W * .5 + Math.sin(t * .4) * 8, H * .56, lerp(.92, 1.04, ease(seg(lt, .3, D))), 0);
    boilSeed('s25sky');
    band(-40, H * .30, '#8EC3E6', 255);
    band(H * .24, H * .50, '#C8E4EE', 255);
    // 太阳在前方
    const sunX = W * .5, sunY = H * .34;
    glow(sunX, sunY, 170, '#FFD79A', .5 + .2 * ease(seg(lt, 3, 5)));
    paint(ellPts(sunX, sunY, 46, 46, 20, 1.2), { wash: F.cream2, washOp: 235, ink: null });
    // 两侧的山坡
    boilSeed('s25hill');
    paint([[-20, H * .52], [W * .30, H * .38], [W * .62, H * .52], [-20, H * .62]], { wash: '#7FA86A', ink: null });
    paint([[W * .38, H * .52], [W * .70, H * .36], [W + 20, H * .50], [W + 20, H * .62]], { wash: '#8FB87A', ink: null });
    // 路:一条往前收窄的带子
    paint([[W * .28, H + 20], [W * .46, H * .56], [W * .54, H * .56], [W * .72, H + 20]], { wash: '#D8C9A6', ink: null });
    for (let i = 0; i < 4; i++) {
      const y = H * (.62 + i * .12), w = lerp(60, 200, i / 3);
      slab(W * .5 - w / 2, y, w, 8, '#C4B48E', 2);
    }
    // 两个人并排往前跑(在镜头前,由小到大)
    const run = ease(seg(lt, .9, 4.2));
    const sz = lerp(HERO_U * .55, HERO_U * 1.55, run);
    const walkPh = lt * 3.4;
    hero(W * .40, lerp(H * .62, H * .90, run), sz, { ...emotions(t, [[T25, 'determined', { lookY: -.2 }], [T25 + 3.2, 'excited', { emote: 'spark' }]]), view: 'side', walk: walkPh, aL: .5, aR: .3, boilKey: 'hero6' });
    dear(W * .62, lerp(H * .63, H * .91, run), sz, { ...emotions(t, [[T25, 'determined', { lookY: -.2 }], [T25 + 3.2, 'excited', { emote: 'music' }]]), view: 'side', walk: walkPh + .5, aL: .4, aR: .4, boilKey: 'dear6' });
    // 纸鹤带路
    birdAt(W * .5 + Math.sin(t * .7) * 40, lerp(H * .34, H * .26, run), 30, -.15, F.cream2, Math.abs(Math.sin(t * 5)) * .8);
    camEnd();
  };

  // ---- 第 26 镜(70.86–75.87):原来我们每天努力长成看似大人的模样 ----
  // reads: ① 穿上大人的衣服(0–1.0) ② 领带歪的、鞋子太大(1.0–2.2) ③ 走两步就露馅,笑场(2.2–5.01)
  const s26 = (t, lt, D) => {
    const dress = ease(seg(lt, 0, .9));
    camBegin(W * .5, H * .52, lerp(1.10, 1.02, ease(seg(lt, .6, D))), 0);
    cityDusk(t, {});
    // 假装大人:领带 + 公文包 + 太大的鞋
    const wob = Math.sin(lt * 2.2) * .05;
    hero(W * .32, H * .84, HERO_U * 1.05, {
      ...emotions(t, [[T26, 'proud'], [T26 + 2.2, 'laugh', { emote: 'sweat' }]]),
      view: 'front', rot: wob, aL: -.3, aR: .3, boilKey: 'hero6',
      draw: (u, sw) => {
        // 歪领带
        paint([[0, -7.4 * u], [-1.1 * u, -6.6 * u], [-.3 * u, -3.2 * u], [1.1 * u, -3.6 * u], [1.0 * u, -6.8 * u]], { wash: '#B24A5A', ink: null });
        ln([[0, -7.4 * u], [-.3 * u, -3.2 * u]], sw * .7, F.ink, 'inkfine', .8);
        // 帽子(太大)
        paint(ellPts(0, -8.4 * u, 3.2 * u, 1.0 * u, 16, .3), { wash: '#3E4E6E', ink: null });
        paint(rectPts(-1.7 * u, -9.8 * u, 3.4 * u, 1.5 * u, .3), { wash: '#3E4E6E', ink: null });
      },
    });
    dear(W * .68, H * .84, DEAR_U * 1.05, {
      ...emotions(t, [[T26, 'proud'], [T26 + 2.2, 'laugh', { emote: 'sweat' }]]),
      view: 'front', rot: -wob, aL: .3, aR: -.3, boilKey: 'dear6',
      draw: (u, sw) => {
        // 圆眼镜
        ln([[-3.6 * u, -6.2 * u], [-1.2 * u, -6.2 * u]], sw * .6, F.ink, 'inkfine', 0);
        paint(ellPts(-3.6 * u, -6.2 * u, 1.5 * u, 1.3 * u, 12, .2), { wash: null, washOp: 0, ink: F.ink, sw: sw * .8 });
        paint(ellPts(-1.2 * u, -6.2 * u, 1.5 * u, 1.3 * u, 12, .2), { wash: null, washOp: 0, ink: F.ink, sw: sw * .8 });
        // 手提包
        paint(rectPts(4.4 * u, -3.4 * u, 2.6 * u, 1.9 * u, .25), { wash: '#7A5A44', ink: null });
      },
    });
    // 太大的鞋(在脚上再画一块)
    for (const [cx, dir] of [[W * .32 - 30, -1], [W * .68 + 30, 1]]) {
      paint([[cx - 26, H * .84 + 4], [cx + 30 * dir, H * .84 + 2], [cx + 34 * dir, H * .84 + 18], [cx - 28, H * .84 + 18]], { wash: '#5C4638', ink: null });
    }
    camEnd();
  };

  // ---- 第 27 镜(75.87–80.83):为了可以一起跨越山和海洋 ----
  // reads: ① 大纸鹤载着两个人起飞(0–1.1) ② 越过山(1.1–2.9) ③ 越过海,往夕阳飞(2.9–4.96)
  const s27 = (t, lt, D) => {
    const fly = ease(seg(lt, 0, D));
    camBegin(W * .5, H * .5, lerp(1.0, .9, ease(seg(lt, .8, D))), 0);
    boilSeed('s27sky');
    band(-40, H * .36, '#F3C489', 255);
    band(H * .28, H * .56, '#F0C79A', 255);
    paint(ellPts(W * .74, H * .40, 60, 60, 22, 1.4), { wash: F.cream2, ink: null });
    glow(W * .74, H * .40, 170, '#FFC978', .55);
    // 山:两层,往两边退
    boilSeed('s27mtn');
    for (const [y0, col, sp] of [[H * .72, '#8C7A8E', 1.0], [H * .82, '#6E6078', 1.5]]) {
      const P = [[-20, H + 40]];
      for (let i = 0; i <= 6; i++) {
        const x = -20 + (W + 40) * i / 6 - frac(lt * .05 * sp) * 200;
        P.push([x, y0 - Math.abs(Math.sin(i * 1.4 + sp)) * H * .10]);
      }
      P.push([W + 20, H + 40]);
      paint(P, { wash: col, ink: null });
    }
    // 海
    band(H * .86, H + 40, mixCol(F.sea, '#3E5A7A', .3), 255);
    // 大纸鹤 + 两个人
    const bx = W * .5 + Math.sin(t * .5) * 30, by = H * .52 - fly * H * .10;
    const flap = Math.abs(Math.sin(t * 2.6));
    birdAt(bx, by, 130, -.12 + Math.sin(t * .8) * .05, F.cream2, flap);
    // 两个人坐在鹤背上(小)
    hero(bx - 34, by - 24, 15, { ...emotions(t, [[T27, 'excited', { emote: 'spark' }]]), view: 'q', boilKey: 'hero6', noShadow: true });
    dear(bx + 26, by - 20, 15, { ...emotions(t, [[T27, 'excited', { emote: 'music' }]]), view: 'q', flip: true, boilKey: 'dear6', noShadow: true });
    camEnd();
    wipeOut(lt, D, .8, [F.seaDk, F.gold]);
  };

  shots([[T24, s24], [T25, s25], [T26, s26], [T27, s27]]);
})();
