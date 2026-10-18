// c7.js — 第七章 · 器乐间奏(80.83–101.10 s,没有词)
//
// 从梦里落回现实:纸鹤掠过海面;夜里空着的房间;又走回那个街角。
// 这一段没有词,是给观众(和我自己)的一段喘息——然后最后一句才有力气。
(() => {
  const GROUND = H * .80, T28 = 80.83, T29 = 87.35, T30 = 93.86;
  const HERO_U = 25;

  // ---- 第 28 镜(80.83–87.35):掠海 ----
  // reads: ① 纸鹤贴着海面飞(0–1.8) ② 飞过浪(1.8–3.6) ③ 天黑下来,它还在飞(3.6–6.52)
  const s28 = (t, lt, D) => {
    const dusk = ease(seg(lt, 2.2, 5.4));
    camBegin(W * .5 + Math.sin(t * .3) * 12, H * .56, lerp(.92, 1.0, ease(seg(lt, 0, D))), 0);
    shoreAt(t, { hy: H * .52, dusk });
    // 纸鹤掠过水面(两个人还坐在上面——这是那场飞行的延续)
    const bx = W * (.18 + frac(lt * .075) * .82), by = H * .50 + Math.sin(t * 1.3) * 16;
    birdAt(bx, by, 64, .06 + Math.sin(t * 1.1) * .08, F.cream2, Math.abs(Math.sin(t * 4.4)) * .9);
    hero(bx - 26, by - 22, 12, { ...emotions(t, [[T28, 'happy', { lookX: .3 }]]), view: 'q', boilKey: 'hero7', noShadow: true });
    dear(bx + 22, by - 18, 12, { ...emotions(t, [[T28, 'happy', { lookX: -.3 }]]), view: 'q', flip: true, boilKey: 'dear7', noShadow: true });
    // 一点水花跟着它
    boilSeed('s28spray');
    for (let i = 0; i < 5; i++) {
      const age = frac(lt * 2 + i * .2);
      dotAt(bx - 40 - age * 70, by + 30 + age * 26, 1.8 + hash(i) * 1.6, F.cream2, 160 * (1 - age));
    }
    // 远处的归鸟
    for (let i = 0; i < 4; i++) {
      const gx = W * (.1 + hash(i * 3.3) * .8), gy = H * (.16 + hash(i * 5.1) * .10);
      ln([[gx - 7, gy - 3], [gx, gy + 2], [gx + 7, gy - 3]], 1.2, mixCol(F.ink, '#9C8AA8', .35), 'inkfine', .8);
    }
    camEnd();
  };

  // ---- 第 29 镜(87.35–93.86):空房间 ----
  // reads: ① 没有人的房间,只有月光(0–1.4) ② 空沙发上、满盒子(1.4–3.6) ③ 窗外的夜(3.6–6.51)
  const s29 = (t, lt, D) => {
    camBegin(W * .5 + Math.sin(t * .25) * 6, H * .52, lerp(1.02, .92, ease(seg(lt, .8, D))), 0);
    littleRoom(t, { fy: GROUND, night: 1, winX: W * .84, lampX: W * .13, rugX: W * .5 });
    sofaAt(W * .52, GROUND + H * .02, W * .52);
    // 盒子好好放在沙发上
    boxAt(W * .52, GROUND - H * .06, 62, 0, '#B98A5E');
    for (let i = 0; i < 3; i++) scrapAt(W * .52 - 12 + i * 12, GROUND - H * .06 - 36, 12, i, F.cream2, i % 2 ? F.blue : F.rose);
    // 窗帘动一动,尘埃在月光里
    boilSeed('s29dust');
    for (let i = 0; i < 8; i++) {
      const ph = frac(t * .07 + hash(i * 5.1));
      dotAt(W * (.25 + hash(i * 2.7) * .5) + Math.sin(t * .5 + i) * 8, lerp(H * .22, H * .72, ph), 1.5, F.cream2, 140 * Math.sin(ph * Math.PI));
    }
    // 月光
    boilSeed('s29moon');
    paint([[W * .70, H * .10], [W * .95, H * .10], [W * .80, H * .82], [W * .48, H * .82]], { wash: '#BFD4E8', washOp: 30, ink: null });
    camEnd();
  };

  // ---- 第 30 镜(93.86–101.10):走回那个街角 ----
  // reads: ① 雨里的街,一个人走回来(0–2.2) ② 停在那个位置(2.2–4.2) ③ 抬头看(4.2–7.24)
  const s30 = (t, lt, D) => {
    const walk = stroll(t, T30 + .2, T30 + 3.4, -W * .12, W * .38, HERO_U);
    camBegin(W * .5, H * .56, lerp(.90, 1.02, ease(seg(lt, 1.2, D))), 0);
    streetCorner(t, { fy: GROUND, rain: 1, night: .35, lampX: W * .90, warm: 0 });
    const mood = emotions(t, [[T30, 'sad', { lookX: -.2, lookY: .3 }], [T30 + 3.6, 'neutral', { lookX: .2, lookY: -.1 }], [T30 + 5.4, 'hopeful', { lookX: 0, lookY: -.4 }]]);
    hero(walk.x, GROUND, HERO_U, { ...mood, view: walk.view, flip: walk.flip, walk: walk.walk, dy: (mood.dy || 0) + walk.dy, boilKey: 'hero7' });
    camEnd();
    wipeIn(lt, .7, [F.cold, F.skyRainLo]);
    wipeOut(lt, D, .7, [F.skyRainLo, F.gold]);
  };

  shots([[T28, s28], [T29, s29], [T30, s30]]);
})();
