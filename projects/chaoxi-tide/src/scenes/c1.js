// c1.js — 起潮(0–8.08 s,S0–S3)
// 当海面迎来汹涌的潮汐 / 我奔跑寻找昔日的足迹 / 夕阳下倒影迷人的美丽 / 可我却丢失故事和你
(() => {
  const HERO_U = 26, DEAR_U = 24;
  const T0 = 0.04, T1 = beatNo(3), T2 = beatNo(7), T3 = beatNo(11);   // 1.98 4.02 6.05

  // ---- 第 1 镜(0–1.98):潮 ----
  // reads: ① 潮头从海平线压上来(0–0.7) ② 浪花扑上沙滩(0.7–1.4) ③ Clawd 小小背影面对大海(全镜)
  const s1 = (t, lt, D) => {
    camBegin(W * .5, H * .54, lerp(1.12, 1.0, ease(seg(lt, 0, D))), 0);
    shoreAt(t, { hy: H * .46 });
    // 潮头:一道起伏的浅色浪墙往岸上推
    const surge = ease(seg(lt, 0, 1.3));
    boilSeed('s1surf');
    for (let i = 0; i < 3; i++) {
      const y = lerp(H * .56, H * .70 + i * H * .05, surge), wob = Math.sin(t * 2.2 + i * 1.7) * 10;
      const P = []; for (let k = 0; k <= 10; k++) P.push([-20 + (W + 40) * k / 10, y + Math.sin(k * 1.1 + t * 3 + i) * (10 + i * 5) + wob]);
      ln(P, 3.2 - i * .6, mixCol(F.seaLt, F.cream2, .6), 'inkfine', 1);
    }
    // 浪花点
    boilSeed('s1spray');
    for (let i = 0; i < 22; i++) {
      const ph = frac(lt * 1.1 + hash(i * 3.7));
      dotAt(W * (.05 + hash(i * 2.1) * .9), H * .62 + ph * H * .14 - hash(i) * 24, 2 + hash(i * 5) * 3, F.cream2, 220 * (1 - ph));
    }
    // Clawd 背影,面对潮水
    hero(W * .5, H * .82, HERO_U, { ...feel('moved', t), view: 'back', aL: -.15, aR: -.15, boilKey: 'h1', noShadow: true });
    // 远处的海鸟
    for (let i = 0; i < 3; i++) gullAt(W * (.2 + i * .22) + Math.sin(t * .6 + i * 2) * 16, H * (.18 + hash(i * 4.4) * .08), 12, t * 3 + i);
    camEnd();
  };

  // ---- 第 2 镜(1.98–4.02):奔跑寻找足迹 ----
  // reads: ① Clawd 横穿沙滩跑(全镜) ② 身后一串脚印(0.3–2) ③ 浪追上来把脚印抹掉(1.2–2.04)
  const s2 = (t, lt, D) => {
    camBegin(W * .5 + Math.sin(t * .4) * 8, H * .56, lerp(.96, 1.05, ease(seg(lt, .4, D))), 0);
    shoreAt(t, { hy: H * .42 });
    const run = lt * 3.6;                       // 走/跑相位
    const px = lerp(W * .16, W * .72, easeOut(seg(lt, 0, 1.9)));
    // 脚印串(在身后,压深一点才看得见)
    footTrail(px - W * .26, H * .815, 7, 7, 1, mixCol('#A9845C', F.ink, .25));
    // 浪抹脚印:一条向左推进的白线
    const wash = ease(seg(lt, 1.1, 2.04));
    boilSeed('s2wash');
    ln([[-20, H * .845], [lerp(-20, W * .55, wash), H * .845 + Math.sin(t * 3) * 3]], 3, mixCol(F.seaLt, F.cream2, .55), 'inkfine', .8);
    hero(px, H * .82, HERO_U, {
      ...emotions(t, [[T1, 'determined', { lookX: .5, lookY: .1 }], [T1 + 1.35, 'moved', { lookX: -.2, lookY: .3 }]]),
      view: 'side', walk: run, aL: .55, aR: .35, boilKey: 'h2',
    });
    // 奔跑扬起的沙尘
    boilSeed('s2dust');
    for (let i = 0; i < 5; i++) {
      const ph = frac(lt * 1.4 + i * .2);
      dotAt(px - 26 - ph * 46, H * .86 + Math.sin(i + ph * 5) * 4, 1.8 + hash(i * 2.2) * 2, F.sand, 150 * (1 - ph));
    }
    camEnd();
  };

  // ---- 第 3 镜(4.02–6.05):夕阳倒影 ----
  // reads: ① 黄昏海面金光(0–0.6) ② 两个剪影站在水边(全镜) ③ 湿沙上的倒影(0.5–2.03)
  const s3 = (t, lt, D) => {
    camBegin(W * .5, H * .52, lerp(1.0, 1.04, ease(seg(lt, .3, D))), 0);
    seaView(t, { hy: H * .50, dusk: 1 });
    // 湿沙反光带
    band(H * .78, H * .92, mixCol(F.sand, F.fwGold, .35), 255);
    band(H * .88, H + 40, mixCol(F.sand, '#B98A5E', .3), 255);
    // 两个剪影 + 倒影
    const sway = Math.sin(t * .9) * .03;
    const hx = W * .42, dx = W * .58, fy = H * .80;
    hero(hx, fy, HERO_U, { ...feel('moved', t), view: 'q', rot: sway, aL: .2, aR: .2, boilKey: 'h3', noShadow: true });
    dear(dx, fy, DEAR_U, { ...feel('happy', t), view: 'q', flip: true, rot: -sway, aL: .2, aR: .2, boilKey: 'd3', noShadow: true });
    // 倒影:以脚下的水面为镜面,压扁、半透明
    const W0 = fy + 16;
    push(); translate(0, W0 * 1.42); scale(1, -.42); drawingContext.globalAlpha = .34;
    hero(hx, fy + 4, HERO_U, { view: 'q', aL: .2, aR: .2, boilKey: 'h3r', noShadow: true, col: mixCol(F.clay, F.fwGold, .35), dk: mixCol(F.clayDk, F.fwGold, .3), lt: F.clayLt });
    dear(dx, fy + 4, DEAR_U, { view: 'q', flip: true, aL: .2, aR: .2, boilKey: 'd3r', noShadow: true, col: mixCol(F.blue, F.fwGold, .35), dk: mixCol(F.blueDk, F.fwGold, .3), lt: F.blueLt });
    pop();
    // 夕阳光斑
    glow(W * .5, H * .34, 180, '#FFC978', .35);
    boilSeed('s3spark');
    for (let i = 0; i < 8; i++) dotAt(W * (.2 + hash(i * 3) * .6), H * (.2 + hash(i * 7) * .5), 1.4, F.fwGold, 120);
    camEnd();
  };

  // ---- 第 4 镜(6.05–8.08):丢失 ----
  // reads: ① 浪从脚下漫上来(0–0.6) ② 右边的身影碎成纸片飞散(0.5–1.4) ③ Clawd 伸手、倒影没了(1.0–2.03)
  const s4 = (t, lt, D) => {
    camBegin(W * .52, H * .54, lerp(1.06, 1.12, ease(seg(lt, .2, D))), 0);
    seaView(t, { hy: H * .52, dusk: 1 });
    band(H * .82, H + 40, mixCol(F.sand, '#8E7A62', .35), 255);
    // 浪漫上来的边缘
    const surge = ease(seg(lt, 0, .8));
    boilSeed('s4surf');
    ln([[-20, lerp(H * .92, H * .84, surge)], [W * .5, lerp(H * .93, H * .855, surge) + Math.sin(t * 2.6) * 4], [W + 20, lerp(H * .91, H * .835, surge)]], 3, mixCol(F.seaLt, F.cream2, .5), 'inkfine', 1);
    // 右边的身影正在碎掉
    const gone = ease(seg(lt, .45, 1.45));
    if (gone < .98) {
      dear(W * .58, H * .80, DEAR_U, {
        ...feel('moved', t), view: 'q', flip: true, aL: .35 + gone * .5, aR: .1,
        boilKey: 'd4', noShadow: true, col: mixCol(F.blue, F.cream2, gone * .6), dk: mixCol(F.blueDk, F.cream2, gone * .5), lt: F.blueLt,
      });
    }
    // 碎纸片向右上飞散(大一点才看得清)
    boilSeed('s4scrap');
    for (let i = 0; i < 11; i++) {
      const ph = clamp(gone * 1.25 - hash(i * 3.3) * .25);
      if (ph <= 0 || ph >= 1) continue;
      const sx = W * .58 + (hash(i * 2.1) - .35) * 170 * ph, sy = H * .78 - ph * (70 + hash(i * 4.7) * 150);
      scrapAt(sx, sy, 10 + hash(i) * 8, ph * 6 + i, mixCol(F.blue, F.cream2, ph * .5), F.blue);
    }
    // Clawd 伸手
    hero(W * .34, H * .81, HERO_U, {
      ...emotions(t, [[T3, 'moved', { lookX: .8, lookY: -.1 }], [T3 + 1.1, 'sad', { lookX: .5, lookY: .35 }]]),
      view: 'q', aL: .85, aR: .25, boilKey: 'h4', noShadow: true,
    });
    camEnd();
  };

  shots([[0, s1], [T1, s2], [T2, s3], [T3, s4]]);
})();
