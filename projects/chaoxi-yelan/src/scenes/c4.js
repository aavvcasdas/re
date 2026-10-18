// c4.js — 第四章「距离」19.015 → 31.219(拍 36.5 → 60)
//
// S10 19.015 隔海两崖:他在左,她的灯在右,镜头缓缓拉远(全片最长一镜)
// S11 22.829 心形水洼:退潮把心抹散(月牙转场进)
// S12 24.863 沙滩遗物:搁浅的灯、纸船;他往远处走,小蟹横穿
// S13 26.642 狂寻:逆风狂奔,左右张望,海鸟惊起
// S14 28.422(拍 55)浪尖:一面潮水在他面前立起来,他举灯相迎 —— 切在浪最高的一拍
(() => {
  const MX = 730, MR = 38;

  // —— S10 ————————————————————————————————————————————————
  function s10(t, lt, dur) {
    pullOut(lt, dur, 480, 290, 1.06, .84);           // 全片最长的一镜:一直退
    const HZ = 320;
    nightSky(t, HZ);
    stars(t, 110, 1.15, 'top', 300);
    cloudAt(480, 76, 260, 40, t, 'c4a');
    moonAt(MX, 96, MR, t, { glowA: .42 });
    ridges(t, HZ, { step: 24, amp: 40 });
    seaAt(t, HZ, .5, { lines: 8 });
    moonRoad(t, MX, HZ, 22, 230, { a: .45 });
    mistAt(HZ + 4, .8);
    // 左崖:他和他的灯
    cliffAt(10, 452, 170, 122, '#101830', 1);
    hero(150, 404, 9, { view: 'q', ...feel('sad', t, { seed: 10 }), aR: .9 });
    lanternAt(176, 390 + Math.sin(t * 1.4) * 3, 4, t, { seed: 41, glowK: 5 });
    // 右崖:对岸,只有一盏小小的青色的灯在闪(她的位置)
    cliffAt(950, 452, 170, 122, '#101830', -1);
    const fl = .6 + .4 * Math.sin(t * 2.2);
    glow(872, 396, 26, F.bio, .55 * fl);
    dotAt(872, 396, 2.6, F.spark, 230 * fl);
    // 两点之间:灯流在海面上连成一条虚线(看不清,但看得出是一排)
    lanternField(t, 9, { x0: 240, x1: 800, y0: HZ + 26, y1: 440, r0: 1.6, dr: 2.6, rise: 20, k: .8 });
    birds(t, 2, 300, 130, 260, .7);
    camEnd();
    // 月牙收场:画面被一枚从中心长出来的夜色圆吞掉
    if (lt > dur - .5) moonIris((lt - (dur - .5)) / 1.0);
  }

  // —— S11 ————————————————————————————————————————————————
  function s11(t, lt, dur) {
    drift(lt, dur, 470, 340, 500, 340, 1.08);
    const HZ = 300;
    nightSky(t, HZ, { haze: 60 });
    stars(t, 70, .95, 'top', 270);
    moonAt(MX - 260, 90, 30, t, { glowA: .36 });
    seaAt(t, HZ, .8, { lines: 6 });
    shoreAt(400, F.sand, { ph: 4.2, amp: 4 });
    wetSandAt(392, 1);
    sparks(t, 6, 60, 880, 300, 400, F.bio, .6, 30);
    // 心形水洼(发着很淡的青光),退潮把它抽干
    const ebb = ease(seg(t, 23.3, 24.86));
    boilSeed('s11heart');
    const hp = heartPts(480, 428, 58 * (1 - ebb * .35), 26);
    paint(hp, { wash: ebb > .8 ? F.seaLo : F.bioDeep, washOp: 150 * (1 - ebb * .72), ink: null });
    ln(hp, .9, mixCol(F.bio, F.chalkDim, ebb * .6), 'inkfine', 1);
    for (let i = 0; i < 6; i++) {   // 心里最后一点光,随退潮缩回去
      const p = frac(t * .3 + i * .6);
      if (ebb < .95) sparkAt(480 + Math.sin(i * 2.1) * 34 * (1 - ebb), 428 + Math.cos(i * 1.7) * 20 * (1 - ebb), 1.4, t, i + 50, F.spark, (1 - ebb) * (1 - p * .4));
    }
    // 退潮的水纹:从心往外退的一圈圈线
    for (let i = 0; i < 3; i++) {
      const r = 40 + frac(t * .22 + i * .33) * 130;
      ln(ellPts(480, 436, r, r * .34, 24, 2), .5, F.chalkDim, 'inkfine', 1);
    }
    // 他跪在心的边上
    const hx = 380, hy = 452;
    hero(hx, hy, 20, { view: 'q', noLegs: true, dy: 1.8, sq: .1, ...feel('cry', t, { seed: 11 }), aR: -1.2 });
    reflectionStreak(hx, hy + 4, 20, F.me, { k: .8 });
    if (pulse(t) > .7) sprayAt(560, 400, 6, t, 's11spr');
    camEnd();
    if (lt > dur - .4) tideWipe((lt - (dur - .4)) / .8);
  }

  // —— S12 ————————————————————————————————————————————————
  function s12(t, lt, dur) {
    pushIn(lt, dur, 480, 350, 1.04, 1.1);
    const HZ = 290;
    nightSky(t, HZ, { haze: 40 });
    stars(t, 66, .9, 'top', 260);
    moonAt(MX - 300, 86, 28, t, { glowA: .3 });
    seaAt(t, HZ, .55, { lines: 5 });
    shoreAt(398, F.sand, { ph: 5.1, amp: 4 });
    wetSandAt(390, .9);
    // 沙滩遗物:一盏搁浅的灭灯、一只纸船、两片碎纸
    boilSeed('s12still');
    paint(ellPts(330, 470, 10, 8, 12, 1), { wash: mixCol(F.lantern, F.sand, .55), washOp: 200, ink: null });
    ln(ellPts(330, 470, 10, 8, 12, 1), .6, F.chalkDim, 'inkfine', 1);
    boatAt(560, 452, 9, -.12, F.meLt, { seed: 3 });
    scrapAt(700, 492, 8, .4, F.meLt, F.bio);
    scrapAt(690, 502, 6, -.3, F.meLt, F.spark);
    // 远处他离开的背影(小),一路脚印
    const hx = lerp(560, 700, ease(seg(t, 24.86, 26.64)));
    hero(hx, 430, 9, { view: 'back', walk: seg(t, 24.86, 26.64) * 6, ...feel('sad', t, { seed: 12 }) });
    footprints(560, hx - 8, 438, 16, '#232F52', 120, 's12fp');
    // 小蟹横穿前景(第一拍从左进,末拍出画)
    const cx = lerp(120, 880, seg(t, 24.7, 26.8));
    boilSeed('s12crab');
    const cs = 7, cb = Math.sin(t * 14) * .04;
    push(); translate(cx, 512); rotate(cb);
    paint(ellPts(0, 0, cs, cs * .62, 12, .5), { wash: F.roseDk, ink: null });
    ln(ellPts(0, 0, cs, cs * .62, 12, .5), .6, F.chalkDim, 'inkfine', 0);
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) ln([[s * cs * .4, cs * .3 + i * 1.2], [s * cs * (.75 + Math.sin(t * 12 + i) * .12), cs * .7 + i * 1.6]], .5, F.chalkDim, 'inkfine', 0);
    for (const s of [-1, 1]) dotAt(s * cs * .95, -cs * .2, cs * .22, F.roseDk, 255);
    dotAt(0, -cs * .5, cs * .16, F.inkSoft, 255); dotAt(-cs * .22, -cs * .5, cs * .16, F.inkSoft, 255);
    pop();
    // 浪轻轻漫一下
    if (frac(t * .5) > .6) paint(ellPts(W / 2, 486, W * .8, 12, 24, 4), { wash: F.seaLo, washOp: 140, ink: null });
    camEnd();
    if (lt > dur - .4) tideWipe((lt - (dur - .4)) / .8);
  }

  // —— S13 ————————————————————————————————————————————————
  function s13(t, lt, dur) {
    // 手持感:跟着他左右小幅甩
    const hx = lerp(160, 780, seg(t, 26.64, 28.42));
    const look = Math.sin(bpOf(t) * Math.PI) > 0 ? 1 : -1;
    const [shx, shy] = shakeXY(t, 2.4);
    camBegin(lerp(hx, hx + look * 60, .4) + shx, 330 + shy, .82);
    const HZ = 300;
    nightSky(t, HZ);
    stars(t, 60, .9, 'top', 270);
    cloudAt(500, 80, 240, 36, t, 'c4b');
    moonAt(MX, 100, 32, t, { glowA: .4 });
    seaAt(t, HZ, 1.15);
    shoreAt(452, F.sand, { ph: 6.0, amp: 6 });
    wetSandAt(444, 1);
    // 逆风的线
    for (let i = 0; i < 6; i++) {
      const y = 120 + hash(i * 3.7 + Math.floor(t * 8)) * 240;
      ln([[hash(i * 5.1) * W + frac(t * 1.2 + i * .3) * 200 - 100, y], [hash(i * 5.1) * W + frac(t * 1.2 + i * .3) * 200 + 60, y + 6]], .5, F.chalkDim, 'inkfine', 1);
    }
    // 狂奔:侧视,头左右甩(lookX),灯在手里晃
    const pump = Math.sin(bpOf(t) * Math.PI);
    hero(hx, 470, 19, { view: 'side', walk: bpOf(t) * 1.3, sq: .05 * pulse2(t), smear: pulse(t) * .3, smearDir: 1,
      lookX: look * .8, ...feel('nervous', t, { seed: 13 }), aL: .4 + pump, aR: .4 - pump, dy: -Math.abs(pump) * 1.4 });
    // 惊起的海鸟:第二拍和第四拍各起一群
    for (const [t0, x0] of [[27.15, 620], [27.92, 260]]) {
      if (t > t0) birds(t, 5, x0 + (t - t0) * 60, 240 - (t - t0) * 70, 120, .9, F.chalkDim, Math.round(t0 * 10));
    }
    // 他的灯,风里晃得更凶
    lanternAt(hx + 24, 430 + Math.sin(t * 7) * 4, 7, t, { seed: 42, glowK: 5, glowA: .65 });
    camEnd();
    if (lt > dur - .45) tideWipe((lt - (dur - .45)) / .9);
  }

  // —— S14 浪尖 ———————————————————————————————————————————
  // 低机位:地平线压低,一道潮墙从画面顶端探进来,一拍一拍往下压;他就站在墙下,仰头举灯。
  // 潮墙头顶进画,阴影盖到他身上 —— 「下一拍就要拍下来」的那种压迫感。
  function s14(t, lt, dur) {
    const k = ease(seg(t, 28.5, 30.9));
    pushIn(lt, dur, 480, 350, 1, 1.14, { shake: 1.0 * pulse(t) });
    const HZ = 380;
    band(-60, HZ * .5, '#0A1024', 255, 0);
    band(HZ * .3, HZ, '#131C3A', 255, 2);
    band(HZ * .72, HZ + 20, '#22315C', 255, 3);
    stars(t, 80, 1, 'top', 330);
    cloudAt(200, 92, 190, 36, t, 'c4c');
    moonAt(790, 118, 40, t, { glowA: .5 });
    seaAt(t, HZ, 1.2, { lines: 5 });
    // 潮墙:从画面顶端垂下来的水壁,顶边随拍子往下长。
    // 全部用 band()(椭圆带)叠出来 —— 大多边形在 p5.brush 里不稳,带子永远可靠。
    const lip = 40 + k * 120;                        // 顶边的 y:一拍一拍压下来
    const rows = [                                   // 顶上被月光照透(亮),往下渐沉
      [0, 34, '#C9D6F0', 255], [34, 46, '#A9BDE4', 255], [82, 58, '#8FA8D8', 255],
      [142, 74, '#6E88C0', 255], [218, 96, '#4A5F96', 235], [316, 120, '#2C3E70', 200],
    ];
    for (const [dy, hh, col, op] of rows) {
      const yy = lip + dy + Math.sin(t * 1.8 + dy) * 3;
      if (yy - hh > H + 60) continue;
      paint(ellPts(W / 2, yy, W * .72, hh, 26, 5), { wash: col, washOp: op, ink: null });
    }
    // 冠边:一道墨蓝的棱线 + 深色小点(亮墙上的暗花纹),避开月亮那一块
    const crest = [];
    for (let i = 0; i <= 14; i++) crest.push([lerp(-40, W + 40, i / 14), lip + Math.sin(i * .9 + t * 2.2) * 7]);
    ln(crest, 1.1, '#33477E', 'inkfine', 1);
    for (let i = 0; i <= 14; i++) {
      const [px, py] = crest[i];
      if (Math.abs(px - 790) < 120) continue;
      dotAt(px + Math.sin(t * 4 + i) * 4, py + 8, 2 + hash(i * 8.1) * 3, '#3D5488', 235);
    }
    // 墙身上的水纹:几道竖向的深蓝纹(亮墙上的暗纹)
    for (let i = 0; i < 9; i++) {
      const px = lerp(20, W - 20, hash(i * 3.7)), py = lip + 44 + hash(i * 5.3) * 96;
      paint(ellPts(px + Math.sin(t * 3 + i) * 5, py, 3 + hash(i * 8.1) * 7, 8 + hash(i * 2.9) * 15, 10, 1.5), { wash: '#3D5488', washOp: 110, ink: null });
    }
    // 潮墙在他身前投下的阴影(随墙压下来变重)
    const sh = clamp((lip - 60) / 100);
    paint(ellPts(470, 500, 150, 16, 22, 3), { wash: '#0D1530', washOp: 70 * sh, ink: null });
    // 他背对我们举着灯,迎着浪;灯举得越高,墙上那一块越亮
    const lift = seg(t, 29.2, 30.2);
    hero(470, 505, 24, { view: 'back', ...feel('determined', t, { seed: 14 }), sq: .05 * pulse(t), noLamp: true, dy: -lift * 1.5 });
    lanternAt(506, 430 - lift * 40 + Math.sin(t * 2.4) * 4, 11, t, { seed: 43, glowK: 6.5, glowA: .85 });
    if (lift > .8) glow(506, 390, 90, F.lantern, .22);
    sparks(t, 12, 60, 900, 330, 520, F.bio, 1.1, 33);
    // 浪峰上那一下:轻轻地闪,不抢戏(真正的爆点在第五章)
    if (t > 30.7) lightUp(seg(t, 30.7, 31.25), .16);
    camEnd();
    // 切章:浪到最高、灯最亮的一拍(b61 = 31.473)落进黑场,下一章在水下醒来
    if (t > 31.0) fadeNight(seg(t, 31.0, 31.473) * .95);
  }

  shots([
    [beatNo(36.5), s10],
    [beatNo(44), s11],
    [beatNo(48), s12],
    [beatNo(51.5), s13],
    [beatNo(55), s14],
  ]);
})();
