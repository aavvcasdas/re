// c2.js — 第二章「灯笼,替我们说话」8.083 → 14.693(拍 15 → 28)
//
// S5  8.083 回忆:崖顶,两个人坐着看一整片灯往上升(暖金记忆色)
// S6 10.117 捡灯:沙滩上半埋的旧纸灯,他捡起来点亮
// S7 12.151 放灯:灯从他手里升上去,镜头跟着抬头;远处还有两盏
(() => {
  const HZ = 320, MX = 250, MY = 108, MR = 34;

  // —— S5 ————————————————————————————————————————————————
  function s5(t, lt, dur) {
    pullOut(lt, dur, 430, 320, 1.28, .98);           // 从两人身上拉远到全景
    // 记忆色:天空偏暖一层,像旧照片
    nightSky(t, HZ, { lo: '#2C3055' });
    band(-20, 140, '#3A2F4E', 120, 0);
    stars(t, 60, .9, 'top', 280);
    moonAt(MX, MY, MR, t);
    seaAt(t, HZ, .5, { lines: 7 });
    moonRoad(t, MX, HZ, 18, 130, { a: .4 });
    // 崖(左下),两个人坐在崖沿
    cliffAt(90, 470, 240, 150, '#1B2340', 1);
    shoreAt(500, '#3D4A6E', { ph: .8, amp: 5 });
    // 灯笼海从崖下升起来
    lanternField(t, 12, { x0: 140, x1: 900, y0: 330, y1: 470, r0: 2.4, dr: 5, rise: 60, k: 1 });
    // 两个人坐在崖沿(不用腿),小小的,中间一点距离
    hero(330, 424, 11, { noLegs: true, view: 'back', ...feel('neutral', t, { seed: 5 }), sq: .04 });
    lightFigure(412, 421, 9, t, .95);
    // 他们放出去的那盏灯,已经飞到崖外
    lanternAt(372, 318 + Math.sin(t * 1.3) * 7, 6, t, { seed: 9, glowK: 4 });
    sparks(t, 6, 200, 800, 250, 420, F.bio, .55, 12);
    camEnd();
    if (lt > dur - .5) tideWipe((lt - (dur - .5)) / 1.0);
  }

  // —— S6 ————————————————————————————————————————————————
  function s6(t, lt, dur) {
    pushIn(lt, dur, 480, 360, 1.02, 1.18);
    nightSky(t, HZ);
    stars(t, 54, .85, 'top', 280);
    cloudAt(700, 90, 170, 34, t, 'c2b');
    moonAt(MX + 460, MY - 20, 30, t, { glowA: .4 });
    seaAt(t, HZ, .75, { lines: 7 });
    shoreAt(452, F.sand, { ph: 1.7, amp: 5 });
    wetSandAt(444, 1);
    sparks(t, 5, 40, 500, 320, 450, F.bio, .5, 15);
    // 沙上半埋的旧灯:两盏灭的,一盏他正要捡的
    const hx = 430, hy = 462;
    boilSeed('s6dead');
    for (const [dx, dy] of [[560, 480], [640, 500], [240, 496]]) {
      paint(ellPts(dx, dy, 9, 7, 12, 1), { wash: mixCol(F.lantern, F.sand, .5), washOp: 190, ink: null });
      ln(ellPts(dx, dy, 9, 7, 12, 1), .6, F.chalkDim, 'inkfine', 1);
    }
    // 他蹲下去捡(拍 19 = 10.117 落蹲,拍 21 = 11.134 点亮)
    const crouch = ease(seg(t, 10.1, 10.7)), lit = ease(seg(t, 11.05, 11.5));
    hero(hx, hy, 23, { view: 'q', noLegs: crouch > .5, dy: 2 * clamp((crouch - .5) * 2), sq: .06 * crouch,
      ...feel(t < 11.0 ? 'sad' : 'idea', t, { seed: 6 }),
      aR: crouch > .5 ? -1.1 : .3 });
    reflectionStreak(hx, hy + 4, 23, F.me, { k: .8 });
    // 手边那盏灯:点亮前是灰的,点亮后一拍亮起来
    const lx = hx + 34, ly = hy - (crouch > .5 ? 6 : 2) - lit * 8;
    if (lit > .02) lanternAt(lx, ly, 9, t, { seed: 10, glowK: 5.2, glowA: .7 * lit });
    else { boilSeed('s6dim'); paint(ellPts(lx, ly, 8, 9, 12, 1), { wash: mixCol(F.lantern, F.sand, .55), washOp: 200, ink: null }); ln(ellPts(lx, ly, 8, 9, 12, 1), .6, F.chalkDim, 'inkfine', 1); }
    // 浪在远处轻轻走
    waveFront(t, 880 + Math.sin(t) * 30, HZ, .35);
    camEnd();
    if (lt > dur - .45) tideWipe((lt - (dur - .45)) / .9);
  }

  // —— S7 ————————————————————————————————————————————————
  function s7(t, lt, dur) {
    // 镜头跟着灯抬头:cam 从沙滩摇到天上
    const up = ease(seg(t, 12.6, 14.4));
    camBegin(470, lerp(400, 180, up), lerp(1.02, 1.12, up));
    nightSky(t, HZ);
    stars(t, 80, 1.1, 'top', 300);
    moonAt(MX + 440, 130, 36, t);
    seaAt(t, HZ, .6, { lines: 6 });
    shoreAt(470, F.sand, { ph: 2.6, amp: 5 });
    const hx = 430, hy = 452;
    hero(hx, hy, 19, { view: 'q', ...feel(t < 13.9 ? 'hopeful' : 'proud', t, { seed: 7 }),
      aR: lerp(-.8, 1.9, ease(seg(t, 12.15, 12.75))), dy: seg(t, 12.15, 12.5) * -.8 });
    reflectionStreak(hx, hy + 4, 19, F.me, { k: .7 });
    // 那盏灯从手里升起来,越升越远、越小
    const k = ease(seg(t, 12.55, 14.6));
    const lyy = lerp(hy - 16, 130, k), lxx = lerp(hx + 30, 640, k), ls = lerp(9, 3.2, k);
    if (k < 1) lanternAt(lxx, lyy + Math.sin(t * 1.8) * 5 * (1 - k), ls, t, { seed: 11, glowK: 5, string: k < .3 });
    stepSpark(lxx, lyy + 14, t, 1 - k, 21);
    // 远处已经有同伴的灯在飘
    lanternField(t, 5, { x0: 520, x1: 920, y0: 150, y1: 300, r0: 2, dr: 3.4, rise: 40, k: .9 });
    sparks(t, 8, 60, 900, 260, 460, F.bio, .7, 18);
    // 收尾:灯汇进灯流,浪把画面接走
    if (t > 13.9) mistAt(HZ + 6, seg(t, 13.9, 14.69) * .9);
    camEnd();
    if (lt > dur - .5) tideWipe((lt - (dur - .5)) / 1.0);
  }

  shots([
    [beatNo(15), s5],
    [beatNo(19), s6],
    [beatNo(23), s7],
  ]);
})();
