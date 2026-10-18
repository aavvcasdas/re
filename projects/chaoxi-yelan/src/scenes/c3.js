// c3.js — 第三章「海把话带走,又还回来」14.693 → 19.015(拍 28 → 36.5)
//
// S8 14.693 蓝色的海底:镜头沉进水里,灯往下沉,他跟着潜下来
// S9 16.727 远山的风景:破水而出的大远景,三层远山、海鸟、开阔海面
(() => {
  const MX = 720, MR = 40;

  // —— S8 水下 ————————————————————————————————————————————
  function s8(t, lt, dur) {
    // 相机跟着灯往下:从水面摇到深处
    const sink = ease(seg(t, 14.7, 16.7));
    drift(lt, dur, 480, lerp(260, 420, sink), 480, lerp(270, 430, sink), 1.04);
    // 水体:上亮下暗,越深越蓝
    band(-20, H * .5, '#27447C', 255, 0);
    band(H * .36, H * .8, '#1B3566', 255, 2);
    band(H * .66, H + 60, '#12264E', 255, 3);
    band(H * .84, H + 60, '#0B1836', 255, 2);
    shafts(t, 30, 5, F.moonBeam, 1);
    // 水面的碎光(从下面看)
    boilSeed('s8surf');
    for (let i = 0; i < 12; i++) {
      const x = hash(i * 3.3) * W, y = 24 + hash(i * 7.1) * 26;
      ln([[x - 16, y], [x + 16, y + 3]], .7, F.moonBeam, 'inkfine', 1);
    }
    bubbles(t, 300, 560, 7, 480, F.moonBeam, 4);
    bubbles(t, 640, 600, 6, 520, F.moonBeam, 9);
    sparks(t, 16, 20, 940, 120, 520, F.bio, 1.1, 22);
    // 三条纸鱼游过(方向随拍子变)
    for (let i = 0; i < 3; i++) {
      const ph = t * (.35 + i * .1) + i * 2.1;
      fishAt(200 + frac(ph) * 700, 200 + i * 90 + Math.sin(ph * 3) * 26, 9 + i * 2, frac(ph) > .5 ? 0 : Math.PI, i % 2 ? F.spark : F.bio, t, i);
    }
    // 灯在水里继续往下沉(愿望已经交出去了),光在水里变成青色
    const ly = lerp(90, 330, sink), lx = 560 + Math.sin(t * 1.1) * 12;
    lanternAt(lx, ly, 8, t, { seed: 31, glowK: 4, glowA: .6 });
    // 他跟在灯后面,斜斜地往下潜(侧视,手臂前伸)
    const hy = lerp(230, 350, ease(seg(t, 15.0, 16.7)));
    hero(330 + Math.sin(t * .9) * 8, hy, 16, { view: 'side', rot: .35, aR: 2.4, aL: 2.0, ...feel('determined', t, { seed: 8 }), noLamp: true });
    bubbles(t, 372, hy - 60, 5, 120, F.moonBeam, 14);
    // 两只水母在边上亮着
    jellyAt(150, 300 + Math.sin(t * .8) * 16, 20, t, { seed: 1 });
    jellyAt(840, 420 + Math.cos(t * .7) * 14, 15, t, { seed: 2, ph: 2 });
    camEnd();
    // 出水:浪从下往上把画面接走
    if (lt > dur - .5) tideWipe((lt - (dur - .5)) / 1.0, { col: '#1B3566', foam: F.silver });
  }

  // —— S9 破水而出 ————————————————————————————————————————
  function s9(t, lt, dur) {
    pullOut(lt, dur, 480, 300, 1.22, .92);
    const HZ = 330;
    nightSky(t, HZ);
    stars(t, 90, 1.1, 'top', 300);
    cloudAt(300, 88, 210, 40, t, 'c3a');
    cloudAt(660, 130, 150, 30, t, 'c3b');
    moonAt(MX, 110, MR, t);
    ridges(t, HZ, { step: 30, amp: 52 });            // 三层远山
    seaAt(t, HZ, .6, { lines: 8 });
    moonRoad(t, MX, HZ, 24, 190);
    mistAt(HZ + 4, .7);
    // 破水的位置还剩一圈浪花
    sprayAt(240, HZ + 12, 18, t, 's9splash');
    boilSeed('s9ring');
    for (let i = 0; i < 3; i++) ln(ellPts(240, HZ + 14, 20 + i * 14, 4 + i * 2.6, 18, 1.5), .6, F.silver, 'inkfine', 1);
    // 他从水里冒出来(半个身子),灯举在头上,滴着光
    const rise = ease(seg(t, 16.9, 17.7));
    hero(240, HZ + 26 + (1 - rise) * 26, 17, { view: 'front', noLegs: true, aR: 2.3, ...feel('relieved', t, { seed: 9 }), dy: 2.5 });
    lanternAt(268, HZ - 12 + Math.sin(t * 1.6) * 3, 6.5, t, { seed: 32, glowK: 5 });
    // 海鸟横飞
    birds(t, 5, 380, 120, 420, 1);
    birds(t, 3, 620, 170, 300, .8, F.chalkDim, 40);
    // 灯还在水面漂着,往海心去
    boatAt(700, HZ + 40, 6, .06 * Math.sin(t), F.meLt, { seed: 2 });
    sparks(t, 10, 40, 920, HZ + 10, 520, F.bio, .8, 26);
    camEnd();
    if (lt > dur - .45) tideWipe((lt - (dur - .45)) / .9);
  }

  shots([
    [beatNo(28), s8],
    [beatNo(32), s9],
  ]);
})();
