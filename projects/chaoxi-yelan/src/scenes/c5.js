// c5.js — 终章「千灯齐明」31.473 → 55.99(拍 61 → 110)
//
// S15 31.473 潮水漫过:黑场后在水下醒来,他抱着灯,火星绕成漩涡
// S16 35.540 灯笼海:浮出水面,海面上漂满了小小的灯,月亮正在正前方
// S17 39.592 对岸的回音:两崖之间的灯连成一条虚线路,两盏光一唱一和地闪
// S18 43.645 涨潮:他往沙丘上爬,外海立起一面巨大的涌(剪影)
// S19 47.697 爆点·千灯齐明:月光水道涨成一条银路,光做的她站在路的那头,他沿着路跑过去
// S20 51.749 退潮·月沉:潮退,灯一盏盏暗下去,她缩成一粒光落在他手边;月沉,纸船漂远,淡出
(() => {
  const MX = 480, MR = 40;

  // —— S15 ————————————————————————————————————————————————
  function s15(t, lt, dur) {
    const sink = ease(seg(t, 31.5, 33.4));
    camBegin(480, lerp(180, 330, sink), lerp(1.12, 1.0, sink), Math.sin(lt * .5) * .035);   // 缓慢侧倾,水里的失重感
    band(-20, H * .5, '#23406F', 255, 0);
    band(H * .36, H * .8, '#182F5C', 255, 2);
    band(H * .66, H + 60, '#102245', 255, 3);
    band(H * .84, H + 60, '#0A1733', 255, 2);
    shafts(t, 20, 4, F.moonBeam, .8);
    // 火星漩涡:绕着他转,越收越紧(画面中心 = 他)
    for (let i = 0; i < 26; i++) {
      const a = t * (.5 + hash(i * 3.1) * .5) + i * .87, r = 30 + frac(i / 26 + t * .05) * 200;
      sparkAt(480 + Math.cos(a) * r * 1.35, 320 + Math.sin(a) * r * .55, 1 + hash(i * 5.7) * 2, t, i + 60, i % 3 ? F.bio : F.spark, 1.1);
    }
    bubbles(t, 240, 560, 6, 460, F.moonBeam, 21);
    bubbles(t, 730, 600, 5, 500, F.moonBeam, 27);
    // 他抱着灯慢慢往下沉(灯在水里还亮着)
    const hy = lerp(260, 350, sink);
    hero(452, hy, 17, { view: 'q', noLegs: true, dy: 2, sq: .05, ...feel('sad', t, { seed: 15 }), noLamp: true, aL: -1.3, aR: -1.3 });
    lanternAt(488, hy - 40 + Math.sin(t * 1.2) * 4, 8, t, { seed: 51, glowK: 5, glowA: .7 });
    jellyAt(140, 380 + Math.sin(t * .7) * 14, 16, t, { seed: 3 });
    jellyAt(850, 300 + Math.cos(t * .6) * 12, 13, t, { seed: 4, ph: 2.4 });
    for (let i = 0; i < 2; i++) {
      const ph = frac(t * .22 + i * .5);
      fishAt(160 + ph * 680, 150 + i * 60 + Math.sin(ph * 6) * 18, 8, 0, F.spark, t, 3 + i);
    }
    camEnd();
    fadeNight(1 - seg(t, 31.473, 32.1));             // 从上一章的黑场里淡入
    if (lt > dur - .5) tideWipe((lt - (dur - .5)) / 1.0, { col: '#182F5C' });
  }

  // —— S16 ————————————————————————————————————————————————
  function s16(t, lt, dur) {
    const HZ = 322;
    drift(lt, dur, 480, 300, MX, 296, 1.02);         // 缓缓摇向月亮
    nightSky(t, HZ);
    stars(t, 96, 1.05, 'top', 300);
    cloudAt(240, 92, 200, 38, t, 'c5a');
    cloudAt(700, 130, 150, 30, t, 'c5b');
    moonAt(MX, 112, MR, t, { glowA: .55 });
    ridges(t, HZ, { step: 26, amp: 44 });
    seaAt(t, HZ, .6, { lines: 8 });
    moonRoad(t, MX, HZ, 40, 260, { a: .6 });
    mistAt(HZ + 4, .8);
    // 灯笼海:一整片小灯漂在海面上(都在水线上下,轻轻起伏)
    for (let i = 0; i < 22; i++) {
      const s = i * 1.73;
      const x = 40 + hash(s * 1.13) * 880, y = HZ + 24 + hash(s * 2.71) * 180 + Math.sin(t * 1.1 + s) * 3;
      const r = 2 + hash(s * 5.3) * 4.4, fl = .65 + .35 * Math.sin(t * 2.3 + s * 2.2);
      glow(x, y, r * 4.6, F.lantern, .4 * fl);
      dotAt(x, y, r, F.lantern, 210 * fl);
    }
    // 他浮在水里,半个身子,灯举着头旁;浪一波一波把他轻轻抬
    const bob = Math.sin(t * 1.3) * 2.4;
    hero(300, HZ + 74 + bob, 19, { view: 'front', noLegs: true, dy: 2.5, ...feel('hopeful', t, { seed: 16 }), noLamp: true, aR: 2.1 });
    lanternAt(336, HZ + 44 + bob + Math.sin(t * 1.9) * 3, 8, t, { seed: 52, glowK: 5.4 });
    // 一步一漾的圈
    if (pulse(t) > .55) ln(ellPts(318, HZ + 80, 30 + pulse(t) * 26, 7 + pulse(t) * 6, 20, 2), .6, F.silver, 'inkfine', 1);
    birds(t, 3, 560, 140, 300, .8);
    camEnd();
    if (lt > dur - .45) tideWipe((lt - (dur - .45)) / .9);
  }

  // —— S17 ————————————————————————————————————————————————
  function s17(t, lt, dur) {
    // 镜头慢慢推向对岸那盏青色的光
    const k = ease(seg(t, 39.59, 43.6));
    pushIn(lt, dur, lerp(480, 640, k), 300, 1, 1.42);
    const HZ = 320;
    nightSky(t, HZ);
    stars(t, 100, 1.1, 'top', 300);
    cloudAt(300, 84, 220, 38, t, 'c5c');
    moonAt(760, 100, 36, t, { glowA: .45 });
    ridges(t, HZ, { step: 24, amp: 38 });
    seaAt(t, HZ, .5, { lines: 7 });
    moonRoad(t, 760, HZ, 22, 200, { a: .42 });
    mistAt(HZ + 4, .9);
    // 左崖:他和灯;右崖:她那盏小青灯,两盏光一唱一和地闪(相差半拍)
    cliffAt(0, 440, 160, 112, '#101830', 1);
    cliffAt(960, 440, 160, 112, '#101830', -1);
    const his = .45 + .55 * Math.abs(Math.sin(t * 1.55)), her = .45 + .55 * Math.abs(Math.sin(t * 1.55 + Math.PI));
    hero(148, 392, 10, { view: 'q', ...feel('sad', t, { seed: 17 }), aR: 1.1 });
    lanternAt(174, 378 + Math.sin(t * 1.5) * 3, 4.4, t, { seed: 53, glowK: 5, glowA: .4 + .4 * his });
    glow(878, 388, 24, F.bio, .35 + .5 * her);
    dotAt(878, 388, 2.4 + her, F.spark, 235 * her);
    // 两点之间:灯连成的虚线路(一排小灯,忽明忽暗)
    for (let i = 0; i < 9; i++) {
      const p = i / 8, x = lerp(150, 850, p), y = HZ + 30 + Math.pow(p, 1.4) * 100 + Math.sin(t + i) * 3;
      const fl = .55 + .45 * Math.sin(t * 2.1 + i * 1.1);
      glow(x, y, 10, F.lantern, .4 * fl);
      dotAt(x, y, 1.8 + hash(i * 3.7) * 1.8, F.lantern, 200 * fl);
    }
    birds(t, 2, 380, 130, 220, .6);
    camEnd();
    if (lt > dur - .45) tideWipe((lt - (dur - .45)) / .9);
  }

  // —— S18 ————————————————————————————————————————————————
  function s18(t, lt, dur) {
    const HZ = 330;
    pushIn(lt, dur, 480, 330, .98, 1.24, { shake: 1.4 * pulse(t) + seg(t, 45.7, 47.7) * 2 });
    nightSky(t, HZ);
    stars(t, 80, 1, 'top', 300);
    cloudAt(680, 90, 240, 42, t, 'c5d');
    moonAt(240, 116, 36, t, { glowA: .4 });
    seaAt(t, HZ, 1.35, { lines: 7 });
    // 外海的巨涌剪影:一层比一层高,末拍立到最高
    const k = ease(seg(t, 43.7, 47.5));
    boilSeed('s18swell');
    const top = HZ - 30 - k * 110, pts = [];
    for (let i = 0; i <= 12; i++) { const q = i / 12; pts.push([lerp(160, W + 80, q), top + Math.sin(q * 6 + t * 1.6) * 12 + q * 10]); }
    for (let i = 12; i >= 0; i--) { const q = i / 12; pts.push([lerp(160, W + 80, q), HZ + 40 + q * 10]); }
    paint(pts, { wash: '#0E1A3A', washOp: 255, ink: null });
    ln(pts.slice(0, 13), 1.2, F.silver, 'inkfine', 1);
    for (let i = 0; i < 12; i++) dotAt(lerp(180, W + 40, hash(i * 3.7)), top + 8 + hash(i * 5.1) * 26, 2 + hash(i * 8.3) * 3.6, F.silver, 210);
    // 涨潮:水线一拍一拍往沙丘上爬
    const tide = ease(seg(t, 43.7, 47.7));
    shoreAt(452 + tide * 10, F.sand, { ph: 7.2, amp: 5 });
    wetSandAt(440 + tide * 12, 1);
    for (let i = 0; i < 3; i++) ln(ellPts(W / 2, 456 + tide * 8, 200 + i * 150 + frac(t * .4 + i * .3) * 60, 8, 22, 3), .5, F.silver, 'inkfine', 1);
    // 逆风的线(画在人物后面)
    for (let i = 0; i < 5; i++) {
      const y = 130 + hash(i * 3.7 + Math.floor(t * 7)) * 240;
      ln([[frac(t * 1.3 + i * .37) * (W + 200) - 100, y], [frac(t * 1.3 + i * .37) * (W + 200) + 70, y + 5]], .5, F.chalkDim, 'inkfine', 1);
    }
    // 他往沙丘上爬(左→右上,风大,灯压得很低)
    const hx = lerp(150, 560, seg(t, 43.7, 46.8)), hy = lerp(500, 452, seg(t, 43.7, 46.8));
    const pump = Math.sin(bpOf(t) * Math.PI);
    hero(hx, hy, 19, { view: 'q', rot: -.06, walk: bpOf(t) * 1.05, sq: .05 * pulse2(t),
      lookX: -.6, ...feel('determined', t, { seed: 18 }), aL: .3 + pump, aR: .3 - pump });
    lanternAt(hx + 22, hy - 34 + Math.sin(t * 6) * 3, 7, t, { seed: 54, glowK: 5, glowA: .7 });
    camEnd();
    if (lt > dur - .45) tideWipe((lt - (dur - .45)) / .9);
  }

  // —— S19 爆点 ———————————————————————————————————————————
  function s19(t, lt, dur) {
    const HZ = 300;
    // 开画一拍(b93):闪一下,然后镜头一路推向她
    const k = ease(seg(t, 47.8, 51.4));
    pushIn(lt, dur, lerp(430, 620, k), lerp(320, 350, k), 1.1, 1.4, { shake: 1.6 * pulse(t) });
    nightSky(t, HZ, { haze: 70 });
    stars(t, 120, 1.2, 'top', 280);
    cloudAt(250, 80, 200, 36, t, 'c5e');
    moonAt(700, 96, 44, t, { glowA: .7, glowK: 4.2 });
    seaAt(t, HZ, 1.0, { lines: 6 });
    // 银路:涨成一条宽路,从他的脚下一直到对岸
    moonRoad(t, 700, HZ, 60, 420, { a: .85, n: 18 });
    mistAt(HZ + 4, .7);
    // 千灯齐明:整片灯笼海都亮着,还在往上飘
    lanternField(t, 26, { x0: 30, x1: 930, y0: 60, y1: HZ + 40, r0: 2, dr: 4.6, rise: 90, k: 1.25 });
    // 她站在路的那头(光做的人),越靠近越清楚
    const herA = .35 + .65 * ease(seg(t, 48.6, 51.2));
    lightFigure(718, 386 - seg(t, 50.2, 51.4) * 4, 15, t, herA);
    // 他沿着银路跑向她:一步一簇火星,拍点起跳
    const hx = lerp(140, 600, k), hy = lerp(500, 424, Math.pow(k, 1.3)) - Math.abs(Math.sin(bpOf(t) * Math.PI)) * 5;
    const pump = Math.sin(bpOf(t) * Math.PI);
    hero(hx, hy, 21, { view: 'q', walk: bpOf(t) * 1.25, sq: .05 * pulse2(t), smear: pulse(t) * .25, smearDir: 1,
      ...feel('excited', t, { seed: 19 }), aL: .5 + pump, aR: .5 - pump });
    if (pulse(t) > .5) stepSpark(hx, hy + 6, t, 1.4, Math.floor(bpOf(t)));
    sparks(t, 20, 60, 900, 200, 520, F.bio, 1.3, 44);
    // 爆点那一拍:一次干脆的曝光
    lightUp(seg(t, 47.697, 48.35), .8);
    camEnd();
    if (lt > dur - .45) fadeNight(seg(t, 51.3, 51.749) * .8);
  }

  // —— S20 ————————————————————————————————————————————————
  function s20(t, lt, dur) {
    const HZ = 318;
    // 先缓缓拉远,再定住
    const zp = seg(t, 51.749, 53.8);
    pushIn(lt, dur, 480, 310, lerp(1.12, .92, ease(zp)), lerp(1.12, .92, ease(zp)) + .001);
    nightSky(t, HZ);
    stars(t, 90, .9, 'top', 290);
    cloudAt(280, 86, 210, 36, t, 'c5f');
    // 月沉:月亮一点点沉到海平线下面(海面画在月亮后面,会把下半盖掉)
    const setK = ease(seg(t, 52.3, 55.6));
    moonAt(700, lerp(150, HZ + 26, setK), 34, t, { glowA: .45 * (1 - setK * .55) });
    ridges(t, HZ, { step: 22, amp: 34 });
    seaAt(t, HZ, .8, { lines: 7 });
    // 水道收窄成一条细线
    moonRoad(t, lerp(700, 640, setK), HZ, 14, lerp(150, 26, setK), { a: .5 * (1 - setK * .5) });
    mistAt(HZ + 4, .9);
    // 退潮:湿线往下退,灯一盏盏暗下去
    const ebb = ease(seg(t, 51.9, 55.2));
    shoreAt(432, F.sand, { ph: 8.1, amp: 5 });
    wetSandAt(424 + ebb * 30, 1 - ebb * .5);
    lanternField(t, 8, { x0: 120, x1: 860, y0: HZ + 30, y1: 470, r0: 1.6, dr: 3, rise: 10, k: 1 - ebb * .8 });
    // 她缩成一粒光,飘落到他手边,变成一盏小灯(和第二章捡起的那盏是同一盏)
    const fall = ease(seg(t, 52.0, 53.2));
    const kneel = ease(seg(t, 53.4, 54.2));
    const spx = lerp(640, 560, fall), spy = lerp(360, 496, fall);
    if (fall < 1) { glow(spx, spy, 20, F.bio, .6 * (1 - fall * .3)); dotAt(spx, spy, 2.2, F.spark, 235); }
    else if (kneel < .9) { glow(560, 480, 18, F.bio, .5); dotAt(560, 480, 2.4, F.spark, 235); }
    // 他跪下去,双手拢住那盏小灯
    hero(500, 500, 24, { view: 'q', noLegs: kneel > .5, dy: kneel * 1.6, sq: .08 * kneel,
      ...feel(kneel > .7 ? 'relieved' : 'sad', t, { seed: 20 }), aL: -1.1 * kneel, aR: -1.2 * kneel, noLamp: kneel > .5 });
    const fl2 = .75 + .25 * Math.sin(t * 2.8);
    glow(548, 484 - kneel * 12, 26, F.lantern, .5 * fl2 * kneel);
    dotAt(548, 484 - kneel * 12, 3.6, F.lanternHot, 235 * kneel);
    reflectionStreak(500, 504, 24, F.me, { k: .7 });
    // 末景:小纸船载着一粒灯,顺着退潮漂远、变小
    const bk = seg(t, 52.6, 55.99);
    boatAt(lerp(360, 700, bk), lerp(500, HZ + 16, Math.pow(bk, 1.5)), lerp(8, 2.4, bk), .08 * Math.sin(t * 1.4), F.meLt, { seed: 6 });
    dotAt(lerp(360, 700, bk), lerp(500, HZ + 16, Math.pow(bk, 1.5)) - 10, lerp(2.4, .8, bk), F.lantern, 220);
    camEnd();
    fadeNight(seg(t, 55.1, 55.99));                  // 淡出到夜色里
  }

  shots([
    [beatNo(61), s15],
    [beatNo(69), s16],
    [beatNo(77), s17],
    [beatNo(85), s18],
    [beatNo(93), s19],
    [beatNo(101), s20],
  ]);
})();
