// c1.js — 第一章「潮水来的时候」0 → 8.083(拍 −1 → 15)
//
// S1 0.00 潮来了:夜滩大远景,潮头在画面右侧立起来
// S2 1.981 奔跑:横移跟拍,脚印被浪追着抹掉
// S3 4.015 倒影:慢下来,湿沙上的两道倒影(一道是光做的)
// S4 6.049 丢失:光做的身影碎成火星,他伸手去接
(() => {
  const HZ = 310, MX = 700, MY = 112, MR = 36;

  // —— S1 ————————————————————————————————————————————————
  function s1(t, lt, dur) {
    drift(lt, dur, 480, 296, 500, 300, .98, {});
    nightSky(t, HZ);
    stars(t, 70, 1, 'top', 290);
    cloudAt(220, 92, 200, 40, t, 'c1a');
    moonAt(MX, MY, MR, t);
    seaAt(t, HZ, .9);
    moonRoad(t, MX, HZ, 20, 150);
    shoreAt(470, F.sand, { ph: .4, amp: 6 });
    wetSandAt(462, .8);
    // 潮头在右边立起来,随拍子往上长(b3 = 1.981 正好切在浪最高的时候)
    const k = ease(seg(t, .45, 1.98));
    waveFront(t, lerp(980, 800, k), HZ, .4 + k * .9);
    sprayAt(lerp(950, 820, k), HZ + 4, 8 + k * 16, t, 's1spray');
    // 小小的背影,面向大海
    const wx = 300 + Math.sin(t * .5) * 6;
    hero(wx, 468, 13, { view: 'back', ...feel('neutral', t, { seed: 1 }), walk: t * .55 });
    sparks(t, 8, 40, W - 60, 340, 500, F.bio, .8, 3);
    fadeNight(1 - seg(t, 0, .5));                    // 从夜色里淡入
    if (lt > dur - .55) tideWipe((lt - (dur - .55)) / 1.1);   // 浪推过来盖屏,盖住时切
  }

  // —— S2 ————————————————————————————————————————————————
  function s2(t, lt, dur) {
    // 他在画面里从左跑到右,相机跟着;每拍落地抖一下
    const hx = lerp(150, 810, ease(seg(t, 1.98, 4.02)));
    const [shx, shy] = shakeXY(t, 1.6 * pulse(t));
    camBegin(hx + 40 + shx, 330 + shy, 1.06);
    nightSky(t, HZ + 40);
    stars(t, 46, .8, 'top', 250);
    moonAt(MX - 140, MY - 8, 30, t);
    seaAt(t, HZ + 40, .8);
    shoreAt(470, F.sand, { ph: 1.2, amp: 5 });
    wetSandAt(464, 1);
    // 脚印:他身后一路;浪从右边追上来,追过的脚印淡掉
    const run0 = 150, spacing = 34;
    const wp = ease(seg(t, 2.3, 4.1));               // 浪头位置:从右往左追
    const wx = lerp(880, hx - 60, wp);
    footprints(run0, hx - 20, 476, spacing, '#232F52', 130, 's2fp');
    // 追上来的那道浪边
    boilSeed('s2wave');
    for (let i = 0; i < 10; i++) {
      const y = 452 + i * 5;
      paint(ellPts(wx + 30 - i * 8, y, 40 + i * 12, 4, 14, 2), { wash: mixCol(F.seaHi, F.seaLo, i / 10), washOp: 200, ink: null });
    }
    ln([[wx - 30, 452], [wx + 40, 458], [wx + 90, 470]], 1, F.silver, 'inkfine', 1);
    if (wp > .55) sprayAt(wx, 462, 10 * wp, t, 's2spr');
    // 跑姿:侧视图,手臂前后打,拍点上压低(squash)
    const sq = .06 * pulse2(t), pump = Math.sin(bpOf(t) * Math.PI);
    hero(hx, 470, 17, { view: 'q', flip: true, walk: bpOf(t) * 1.15, sq, smear: pulse(t) * .3, smearDir: -1,
      aL: .5 + pump * .9, aR: .5 - pump * .9, ...feel('determined', t, { seed: 2 }) });
    // 拍点上的速度线
    if (pulse(t) > .35) for (let i = 0; i < 3; i++) {
      const y = 400 + i * 34 + hash(i + Math.floor(t * 12)) * 8;
      ln([[hx - 90, y], [hx - 160, y + 4]], .6, F.chalkDim, 'inkfine', 1);
    }
    camEnd();
    if (lt > dur - .45) tideWipe((lt - (dur - .45)) / .9);
  }

  // —— S3 ————————————————————————————————————————————————
  function s3(t, lt, dur) {
    pushIn(lt, dur, 470, 330, 1, 1.14);
    nightSky(t, HZ);
    stars(t, 60, .9, 'top', 280);
    moonAt(MX, MY - 6, 34, t);
    seaAt(t, HZ, .55, { lines: 7 });
    moonRoad(t, MX, HZ, 26, 200);
    shoreAt(462, F.sand, { ph: 2.2, amp: 4 });
    wetSandAt(452, 1);
    sparks(t, 6, 40, W - 40, 330, 470, F.bio, .6, 9);
    // 他停下来,回头看;光做的她走在他旁边(只有轮廓和光)
    const hx = 360, hy = 462;
    hero(hx, hy, 20, { view: 'q', ...feel('hopeful', t, { seed: 3 }), walk: seg(t, 4.02, 5.5) * 2.4 });
    reflectionStreak(hx, hy + 4, 20, F.me, { k: .9 });
    const fx = lerp(560, 520, ease(seg(t, 4.0, 6.0))), fy = 456;
    lightFigure(fx, fy, 15, t, .85);
    reflectionStreak(fx, fy + 4, 14, F.bio, { k: .7, op: 60 });
    // 倒影之间的水面碎光(拍点闪一下)
    for (let i = 0; i < 5; i++) {
      const a = 90 + pulse(t) * 60;
      ln([[120 + i * 170, 470 + hash(i * 3.1) * 30], [170 + i * 170, 476 + hash(i * 7.7) * 26]], .5, F.moonBeam, 'inkfine', 1);
    }
    camEnd();
    if (lt > dur - .45) tideWipe((lt - (dur - .45)) / .9);
  }

  // —— S4 ————————————————————————————————————————————————
  function s4(t, lt, dur) {
    // 她碎成火星往上飘;镜头跟着火星抬;他伸手去接
    drift(lt, dur, 480, 350, 480, 300, 1.05, {});
    nightSky(t, HZ);
    stars(t, 70, 1.1, 'top', 290);
    mistAt(HZ + 8, .8);
    moonAt(MX - 40, MY + 10, 30, t, { glowA: .34 });
    seaAt(t, HZ, 1.05);
    shoreAt(466, F.sand, { ph: 3.1, amp: 5 });
    wetSandAt(458, 1);
    const hx = 430, hy = 464;
    // 碎片:她的轮廓先散开,再化成往上飘的火星
    const brk = ease(seg(t, 6.05, 6.85));
    if (brk < 1) lightFigure(560 - brk * 20, 452 - brk * 6, 15, t, 1 - brk * .9);
    const up = ease(seg(t, 6.3, 8.0));
    sparks(t, 20, 470, 640, 260 - up * 130, 460 - up * 40, F.spark, 1.15, 7);
    for (let i = 0; i < 6; i++) {   // 六片小纸片(记忆的边角)打着旋上去
      const p = frac(t * .22 + i * .37), x = 480 + Math.sin(i * 2.2 + t * 1.4) * (60 + i * 16);
      const y = 430 - ((t - 6.05) * (26 + i * 9) + i * 22);
      if (y > 120 && y < 470) scrapAt(x, y, 7 + hash(i * 3) * 4, t * .8 + i, F.meLt, F.spark);
    }
    hero(hx, hy, 21, { view: 'q', flip: true, ...feel(t < 6.9 ? 'surprised' : 'sad', t, { seed: 4 }),
      aR: lerp(2.2, .2, ease(seg(t, 7.2, 8.0))), dy: seg(t, 6.5, 6.9) * -1.2 + seg(t, 7.6, 8.05) * 1.2 });
    reflectionStreak(hx, hy + 4, 21, F.me);
    // 浪漫上来,把倒影抹掉
    const ws = ease(seg(t, 7.0, 8.05));
    paint(ellPts(W / 2, 470, W * .75, 14 + ws * 16, 26, 4), { wash: F.seaLo, washOp: 170 * ws, ink: null });
    if (pulse(t) > .6) sprayAt(560, 452, 8, t, 's4spr');
    camEnd();
    // 不转场,硬切 —— 悲伤那一拍要「突然什么都没有」
  }

  shots([
    [0.0, s1],
    [beatNo(3), s2],
    [beatNo(7), s3],
    [beatNo(11), s4],
  ]);
})();
