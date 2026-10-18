// _lib.js — 《潮汐 · 夜蓝》共用美术词汇:夜色色板、月/海/生物光、转场、运镜。
//
// 节拍网格来自 tools/beat_grid.py 对这一版音频的量测(audiomap.json):118 BPM / 4/4,第一正拍 0.456 s。
// assets/song.lrc 的 13 个唱句起点落在这套网格上,残差 ±5 ms(两处半拍),镜头切点就用这套网格。
//
// 画法约定(这一部是「夜色粉彩」,不是上一部的日间水粉):
//   · 底是深色纸(core.js 的 NIGHT),所以「线」用浅色粉笔画,不用墨线;
//   · 一切发光的东西用 glow() 画,不用颜料(p5.brush 是颜料混合,黄加蓝会变绿,画不出光);
//   · 每个镜头都要有运镜(推/拉/摇/移),不留死镜;爆点镜另加 flash + shake。
const BEAT_S = 60 / 118;            // 0.5085 s
const BAR_S = 4 * BEAT_S;           // 2.0339 s
const GRID0 = 0.456;                // 第一个正拍
const bar = n => GRID0 + n * BAR_S;
const beatNo = n => GRID0 + n * BEAT_S;
const BAR = BAR_S;

// 唱段时间(assets/song.lrc;karaoke.js 做逐字填充,场景拿它定走位)
const LYR = [
  [0.04, 1.98, '当海面迎来汹涌的潮汐'],
  [1.98, 4.02, '我奔跑寻找昔日的足迹'],
  [4.02, 6.05, '夕阳下倒影迷人的美丽'],
  [6.05, 8.08, '可我却丢失故事和你'],
  [8.08, 10.12, '你说过向往大海的神秘'],
  [10.12, 12.15, '也憧憬我们遗失的过去'],
  [12.15, 14.69, '分享给大海秘密'],
  [14.69, 16.73, '蓝色的海底'],
  [16.73, 19.02, '远山的风景'],
  [19.02, 22.83, '我们的距离 遥不可及'],
  [22.83, 24.86, '退守的爱情'],
  [24.86, 26.64, '还剩下回忆'],
  [26.64, 29.20, '疯狂的寻觅你的身影'],
];

// ---------- 色板:夜 ----------
const F = {
  // 夜空
  skyHi: '#080C1C', skyMid: '#131C3A', skyLo: '#22315C', haze: '#33456F',
  // 海
  seaHi: '#2C4470', sea: '#1B2A4E', seaLo: '#101A34', seaDeep: '#080F22', abyss: '#050A18',
  // 月光
  moon: '#FFF3CE', moonDk: '#E8D29A', moonBeam: '#CFE0FF', silver: '#DCE7FF',
  // 生物光
  bio: '#6FE3D6', bioDk: '#2E9E96', bioDeep: '#1B6C74', spark: '#A9F5E8',
  // 灯笼 / 暖
  lantern: '#FFC46B', lanternHot: '#FFE6AE', lampGlow: '#FFB44D',
  // 角色
  meLt: '#FFF6E2', me: '#FFE3B0', meDk: '#D9A45F',
  youLt: '#D6FFFB', you: '#79E9DF', youDk: '#2E9E96',
  // 情绪
  rose: '#F2A0BC', roseDk: '#B36A85', violet: '#9C86E0', violetDk: '#5E4C9C',
  chalk: '#EAF0FF', chalkDim: '#93A3CC', inkSoft: '#5B6A94', sand: '#39466B', sandLit: '#44537D',
};

// ---------- 小工具 ----------
function slab(x, y, w, h, col, j = 3, op = 255) { paint(rectPts(x, y, w, h, j), { wash: col, washOp: op, ink: null }); }
function ln(pts, sw = 1, col = F.chalk, br = 'inkfine', curv = .6) { inkLine(pts, sw, col, br, curv); }
function dotAt(x, y, r, col, op = 255) { paint(ellPts(x, y, r, r * .95, 8, .4), { wash: col, washOp: op, ink: null }); }
function band(y0, y1, col, op = 255, j = 5) { paint(ellPts(W / 2, (y0 + y1) / 2, W * .98, Math.max(2, (y1 - y0) / 2), 24, j), { wash: col, washOp: op, ink: null }); }
// 一条抖动的线(海面、沙面、远山的轮廓都用它,别用直尺)
function wobLine(x0, x1, y, amp, ph, col, sw = 1, segs = 6, t = 0) {
  const p = []; for (let i = 0; i <= segs; i++) p.push([lerp(x0, x1, i / segs), y + Math.sin(i * .8 + ph + t) * amp]);
  ln(p, sw, col, 'inkfine', 1);
}
// 一块光落在地上(暖光/冷光)
function pool(x, y, r, k = 1, col = '#FFCE86') {
  if (k <= .02) return;
  paint(ellPts(x, y, r, r * .70, 22, r * .05), { wash: col, washOp: 26 * clamp(k), ink: null });
  paint(ellPts(x, y, r * .58, r * .42, 18, r * .04), { wash: col, washOp: 30 * clamp(k), ink: null });
}

// ---------- 夜空 ----------
// 三段式夜空:上深下浅(月光从海面上返上来)。band() 是椭圆带,边缘本身就是毛的。
function nightSky(t, hz = 330, o = {}) {
  band(-60, hz * .62, F.skyHi, 255, 0);
  band(hz * .30, hz * 1.02, F.skyMid, 255, 2);
  band(hz * .78, hz + 26, o.lo || F.skyLo, 255, 3);
  if (o.haze) band(hz - 46, hz + 16, F.haze, o.haze, 4);
}
// 星:同一批种子每帧位置不变,只有亮度在呼吸。kind='all' 满天;'top' 只画上半。
function stars(t, n = 90, k = 1, kind = 'all', y1 = null) {
  const top = y1 == null ? (kind === 'top' ? 200 : 330) : y1;
  for (let i = 0; i < n; i++) {
    const x = hash(i * 3.1 + 1) * W, y = hash(i * 7.7 + 2) * top;
    const r = (.5 + hash(i * 11.3) * 1.5) * k, tw = .45 + .55 * Math.abs(Math.sin(t * (.5 + hash(i * 5.5) * 1.4) + i));
    if (r < .55) continue;
    dotAt(x, y, r, i % 11 === 0 ? F.moonBeam : F.silver, 200 * tw * k);
  }
}
// 月亮:圆面 + 两个环形山 + 一圈光。x,y 是圆心。
function moonAt(x, y, r, t, o = {}) {
  glow(x, y, r * (o.glowK ?? 3.6), F.moonBeam, o.glowA ?? .5);
  boilSeed('moon');
  paint(ellPts(x, y, r, r, 30, r * .012), { wash: F.moon, ink: null });
  paint(ellPts(x - r * .30, y - r * .18, r * .26, r * .22, 14, r * .02), { wash: F.moonDk, washOp: 150, ink: null });
  paint(ellPts(x + r * .26, y + r * .26, r * .17, r * .15, 12, r * .02), { wash: F.moonDk, washOp: 130, ink: null });
  if (o.crescent) {   // 弯月:用一个偏心的夜色圆咬掉一块
    paint(ellPts(x + r * .52, y - r * .30, r * .98, r * .98, 26, r * .01), { wash: F.skyHi, ink: null });
  }
  ln(ellPts(x, y, r, r, 30, r * .02), o.sw ?? .8, F.moonDk, 'inkfine', 1);
}
// 一条被风吹开的云(横着的软带,月亮从后面透出来)。月光照的云比夜空**亮**一档,
// 三节香肠式的软带叠出来,透明度压低,不然会读成一个洞。
function cloudAt(x, y, w, h, t, seed = 'cloud', o = {}) {
  boilSeed(seed);
  const col = o.col || '#2A3A66', op = o.op ?? 80;
  for (let i = 0; i < 3; i++) {
    const k = 1 - i * .18, dx = Math.sin(t * .12 + i * 2 + hash(seed.length)) * 7;
    paint(ellPts(x - w * .30 + dx + i * w * .30, y + (i - 1) * h * .14, w * .36 * k, h * (.52 + i * .1), 18, w * .01), { wash: col, washOp: op * (.6 + i * .2), ink: null });
  }
}
// 雾:贴在海面上的一层
function mistAt(y, k = 1, col = F.haze, op = 90) {
  for (let i = 0; i < 3; i++) paint(ellPts(W / 2 + i * 40 - 40, y + i * 9, W * (.7 - i * .12), 16 + i * 6, 22, 6), { wash: col, washOp: op * k * (1 - i * .2), ink: null });
}

// ---------- 海 ----------
// 海面:一条地平线 + 几层横带 + 抖动的高光线。waves 越大浪越高。
function seaAt(t, hz, k = 1, o = {}) {
  const deep = o.deep ?? F.sea, mid = o.mid ?? F.seaHi;
  band(hz, hz + 40, mid, 255, 2);
  band(hz + 26, hz + 130, deep, 255, 3);
  band(hz + 100, H + 60, o.lo ?? F.seaLo, 255, 4);
  const n = o.lines ?? 9;
  for (let i = 0; i < n; i++) {
    const p = i / (n - 1), y = hz + 8 + Math.pow(p, 1.7) * (H - hz) * .92;
    const amp = (1.2 + p * 7) * k, w = 40 + p * 220;
    for (let s = 0; s < 3; s++) {
      const x0 = hash(i * 13 + s * 7) * (W + 300) - 150 + Math.sin(t * (.25 + p * .5) + i + s) * (10 + p * 40);
      const seg = 5, pts = [];
      for (let q = 0; q <= seg; q++) pts.push([lerp(x0, x0 + w, q / seg), y + Math.sin(q * 1.1 + i * 2 + t * (1 + p)) * amp * .35]);
      ln(pts, .5 + p * 1.1, o.lineCol || F.moonBeam, 'inkfine', 1);
    }
  }
}
// 月光水道:从月亮脚下铺到画面前的一条碎光路(这一部的记号)
function moonRoad(t, mx, hz, w0 = 26, w1 = 210, o = {}) {
  const n = o.n ?? 15;
  for (let i = 0; i < n; i++) {
    const p = i / (n - 1), y = hz + 4 + Math.pow(p, 1.55) * (H - hz) * .95;
    const w = lerp(w0, w1, Math.pow(p, 1.3)), a = (1 - p * .55) * (o.a ?? .5);
    const sh = Math.sin(t * 1.5 + i * 1.7) * (4 + p * 16);
    boilSeed('road' + i);
    paint(ellPts(mx + sh, y, w * (.45 + .2 * Math.abs(Math.sin(i * 1.3 + t))), 1.6 + p * 4.5, 14, 2), { wash: o.col || F.moonBeam, washOp: 255 * a, ink: null });
  }
  glow(mx, hz + (H - hz) * .3, w1 * 1.1, F.moonBeam, .18);
}
// 一道浪:一条抛物线水墙 + 顶上的碎沫。x 是浪头位置,p 0..1 推进。
function waveFront(t, x, hz, k = 1, o = {}) {
  boilSeed('wave' + Math.round(x));
  const h = (26 + 40 * k), pts = [];
  for (let i = 0; i <= 10; i++) {
    const q = i / 10, px = x - 190 + q * 380;
    pts.push([px, hz + 16 - Math.sin(q * Math.PI) * h * (1 + .12 * Math.sin(q * 9 + t * 6))]);
  }
  for (let i = 10; i >= 0; i--) { const q = i / 10; pts.push([x - 190 + q * 380, hz + 34 + q * 6]); }
  paint(pts, { wash: o.col || F.seaHi, washOp: 255, ink: null });
  // 沫
  for (let i = 0; i < 14; i++) {
    const q = hash(i * 5.1), px = x - 170 + q * 340, py = hz + 14 - Math.sin(q * Math.PI) * h + hash(i * 3.3) * 10;
    dotAt(px + Math.sin(t * 5 + i) * 3, py, 1.4 + hash(i * 9.1) * 3.4, F.silver, 210);
  }
  ln(pts.slice(0, 11), 1.1, F.silver, 'inkfine', 1);
}
// 浪花扑散:一小簇飞沫
function sprayAt(x, y, s, t, seed = 'spray', col = F.silver) {
  boilSeed(seed);
  for (let i = 0; i < 9; i++) {
    const a = -Math.PI * (.15 + hash(i * 2.7) * .7), d = s * (.4 + hash(i * 4.1) * 1.5);
    dotAt(x + Math.cos(a) * d, y + Math.sin(a) * d * .8, 1 + hash(i * 6.3) * s * .12, col, 200);
  }
}

// ---------- 沙 / 岸 ----------
// 沙滩:一块夜色下的沙。大块的平涂会读成「色块」,所以上面铺两层:
// 水线附近一条浅一点的湿沙(月光反射),再往下一道道横向的沙纹。
function shoreAt(y, col = F.sand, o = {}) {
  const pts = [[-40, y]];
  for (let i = 0; i <= 8; i++) pts.push([lerp(-40, W + 40, i / 8), y + Math.sin(i * .9 + (o.ph || 0)) * (o.amp ?? 7)]);
  pts.push([W + 40, H + 40], [-40, H + 40]);
  paint(pts, { wash: col, ink: null });
  // 湿沙浅带(贴水线,微微反光)
  paint(ellPts(W / 2, y + 12, W * .85, 12, 22, 4), { wash: o.lit || F.sandLit, washOp: 150, ink: null });
  // 沙纹:一横道一横道,越往下越稀
  boilSeed('shore' + Math.round(y));
  for (let i = 0; i < 5; i++) {
    const yy = y + 18 + i * 17 + hash(i * 3.3) * 8;
    const x0 = hash(i * 5.1) * 300 - 100, x1 = x0 + 260 + hash(i * 7.7) * 380;
    ln([[x0, yy], [x0 + (x1 - x0) * .4, yy + 3], [x1, yy - 1]], .55, '#2C3860', 'inkfine', 1);
  }
  ln(pts.slice(0, 10), o.sw ?? .9, o.line || F.chalkDim, 'inkfine', 1);
}
// 湿沙:靠水的一条深色带,能映出东西
function wetSandAt(y, k = 1) {
  paint(ellPts(W / 2, y + 8, W * .8, 22, 26, 4), { wash: F.seaLo, washOp: 200 * k, ink: null });
}
// 一小丛海草
function tuftAt(x, y, s, t, col = F.bioDk, seed = 'tuft') {
  boilSeed(seed);
  for (let i = 0; i < 5; i++) {
    const a = -.5 + i * .25 + Math.sin(t * 1.4 + i) * .12, h = s * (.6 + hash(i * 3.7) * .7);
    ln([[x, y], [x + Math.sin(a) * h * .5, y - h * .6], [x + Math.sin(a) * h, y - h]], 1, col, 'inkfine', 1);
  }
}

// ---------- 发光的活物 ----------
// 一枚浮游光点(生物光):会漂、会呼吸
function sparkAt(x, y, r, t, seed = 0, col = F.spark, k = 1) {
  const br = .5 + .5 * Math.sin(t * (1.2 + hash(seed * 3.1) * 2) + seed * 2.4);
  glow(x, y, r * 6, col, .5 * br * k);
  dotAt(x, y, r * (.5 + br * .5), col, 230 * k);
}
// 一片浮游光群
function sparks(t, n = 16, x0 = 0, x1 = W, y0 = 200, y1 = H, col = F.spark, k = 1, seed = 0) {
  for (let i = 0; i < n; i++) {
    const s = seed + i * 1.7;
    const x = x0 + hash(s * 1.13) * (x1 - x0) + Math.sin(t * .35 + s) * 14;
    const y = y0 + hash(s * 2.71) * (y1 - y0) + Math.cos(t * .28 + s * 1.7) * 10;
    sparkAt(x, y, .8 + hash(s * 5.3) * 1.8, t, s, col, k);
  }
}
// 水母:半透明的伞 + 触手,自己会发光
function jellyAt(x, y, s, t, o = {}) {
  const col = o.col || F.bio, pulse = .88 + .12 * Math.sin(t * 1.6 + (o.ph || 0));
  glow(x, y, s * 3.2, col, .45);
  boilSeed('jelly' + (o.seed || 0));
  const dome = [];
  for (let i = 0; i <= 12; i++) { const a = Math.PI + i / 12 * Math.PI; dome.push([x + Math.cos(a) * s * pulse, y + Math.sin(a) * s * .82 * pulse]); }
  for (let i = 0; i <= 6; i++) dome.push([x + s * (1 - i / 3) * pulse, y + s * .16]);
  paint(dome, { wash: col, washOp: 130, ink: null });
  ln(dome.slice(0, 13), .9, o.line || F.spark, 'inkfine', 1);
  for (let i = 0; i < 6; i++) {   // 触手
    const x0 = x - s * .8 + i * s * .32, pts = [];
    for (let q = 0; q <= 5; q++) pts.push([x0 + Math.sin(t * 1.8 + i + q * .8) * s * .18 * q / 5, y + q * s * .42]);
    ln(pts, .7, o.line || F.spark, 'inkfine', 1);
  }
}
// 一条纸鱼(记忆做的鱼),自己发一点光
function fishAt(x, y, s, rot = 0, col = F.spark, t = 0, seed = 0) {
  boilSeed('fish' + seed);
  push(); translate(x, y); rotate(rot);
  glow(0, 0, s * 3, col, .3);
  paint([[-s, 0], [s * .5, -s * .5], [s * .9, 0], [s * .5, s * .5]], { wash: col, washOp: 210, ink: null });
  paint([[s * .8, 0], [s * 1.5, -s * .5], [s * 1.35, 0], [s * 1.5, s * .5]], { wash: col, washOp: 170, ink: null });
  dotAt(-s * .55, -s * .1, s * .13, F.abyss, 220);
  ln([[-s, 0], [s * .5, -s * .5], [s * .9, 0], [s * .5, s * .5], [-s, 0]], .6, F.moonBeam, 'inkfine', 0);
  pop();
}
// 气泡
function bubbles(t, x, y, n = 6, h = 120, col = F.moonBeam, seed = 0) {
  for (let i = 0; i < n; i++) {
    const p = frac(t * (.22 + hash(seed + i * 3.1) * .22) + hash(seed + i) );
    const r = 1.5 + hash(seed + i * 7.7) * 4;
    ln(ellPts(x + Math.sin(p * 7 + i) * 10 + hash(seed + i * 2.3) * 30 - 15, y - p * h, r, r, 10, .2), .5, col, 'inkfine', 1);
  }
}
// 水下光柱(从水面斜射下来)
function shafts(t, hz, n = 5, col = F.moonBeam, k = 1) {
  for (let i = 0; i < n; i++) {
    const x = hash(i * 5.9) * W * 1.1 - W * .05, w = 24 + hash(i * 3.3) * 54, sway = Math.sin(t * .4 + i) * 20;
    const a = .10 * k * (.5 + .5 * Math.sin(t * .8 + i * 1.9));
    paint([[x - w / 2, hz], [x + w / 2, hz], [x + w * 1.5 + sway, H + 40], [x - w * .4 + sway, H + 40]], { wash: col, washOp: 255 * a, ink: null });
  }
}

// ---------- 道具 ----------
// 一盏纸灯笼(全片的记号:记忆里的人都变成灯笼)
function lanternAt(x, y, s, t, o = {}) {
  const col = o.col || F.lantern, fl = .82 + .18 * Math.sin(t * 3.1 + (o.ph || 0));
  glow(x, y, s * (o.glowK ?? 5), col, .55 * fl);
  boilSeed('lantern' + (o.seed || 0));
  paint(ellPts(x, y, s * .8, s, 16, s * .02), { wash: col, washOp: 235, ink: null });
  paint(ellPts(x, y, s * .42, s * .92, 12, s * .02), { wash: F.lanternHot, washOp: 190 * fl, ink: null });
  ln(ellPts(x, y, s * .8, s, 16, s * .03), .7, o.line || F.lanternHot, 'inkfine', 1);
  slab(x - s * .34, y - s * 1.16, s * .68, s * .18, F.meDk, .4);
  if (o.string) ln([[x, y - s * 1.16], [x + Math.sin(t * 1.3) * 4, y - s * 2.4]], .6, F.chalkDim, 'inkfine', 1);
}
// 一只漂流瓶(这一部里它装的是灯笼,不是信)
function bottleAt(x, y, s, rot = 0, t = 0, o = {}) {
  boilSeed('bottle' + (o.seed || 0));
  push(); translate(x, y); rotate(rot);
  paint([[-s * .5, -s * .2], [s * .5, -s * .2], [s * .42, s * .9], [-s * .42, s * .9]], { wash: F.seaHi, washOp: 220, ink: null });
  slab(-s * .16, -s * .8, s * .32, s * .62, F.seaHi, .4);
  ln([[-s * .5, -s * .2], [s * .5, -s * .2], [s * .42, s * .9], [-s * .42, s * .9], [-s * .5, -s * .2]], .8, F.moonBeam, 'inkfine', 0);
  ln([[-s * .16, -s * .8], [s * .16, -s * .8]], .8, F.moonBeam, 'inkfine', 0);
  const fl = .7 + .3 * Math.sin(t * 3.4);
  glow(0, s * .3, s * 2.6, F.lantern, .5 * fl);
  dotAt(0, s * .35, s * .22, F.lanternHot, 230);
  pop();
}
// 一只纸船
function boatAt(x, y, s, rot = 0, col = F.meLt, o = {}) {
  boilSeed('boat' + (o.seed || 0));
  push(); translate(x, y); rotate(rot);
  paint([[-s, 0], [s, 0], [s * .55, s * .55], [-s * .55, s * .55]], { wash: col, washOp: 240, ink: null });
  paint([[0, -s * 1.25], [s * .1, 0], [-s * .62, 0]], { wash: mixCol(col, F.violet, .18), washOp: 230, ink: null });
  ln([[-s, 0], [s, 0], [s * .55, s * .55], [-s * .55, s * .55], [-s, 0]], .7, F.chalk, 'inkfine', 0);
  ln([[0, -s * 1.25], [s * .1, 0], [-s * .62, 0], [0, -s * 1.25]], .7, F.chalk, 'inkfine', 0);
  pop();
}
// 一星记忆碎片(小纸片,发一点光)
function scrapAt(x, y, s, rot = 0, col = F.meLt, mark = F.bio) {
  push(); translate(x, y); rotate(rot);
  slab(-s / 2, -s / 2, s, s, col, .3);
  ln([[-s / 2, -s / 2], [s / 2, -s / 2], [s / 2, s / 2], [-s / 2, s / 2], [-s / 2, -s / 2]], .6, F.chalkDim, 'inkfine', 0);
  dotAt(0, 0, s * .17, mark, 220);
  pop();
}
// 远山:三层剪影
function ridges(t, hz, o = {}) {
  const layers = o.cols || ['#1A2444', '#151E3A', '#101731'];
  layers.forEach((col, li) => {
    const base = hz - li * (o.step ?? 26), amp = (o.amp ?? 46) * (1 - li * .22), pts = [[-40, base + 40]];
    boilSeed('ridge' + li);
    for (let i = 0; i <= 9; i++) {
      const q = i / 9, x = lerp(-40, W + 40, q);
      const y = base - Math.abs(Math.sin(q * (2.2 + li * .7) + li * 1.7)) * amp - hash(li * 31 + i) * amp * .35;
      pts.push([x, y]);
    }
    pts.push([W + 40, base + 40]);
    paint(pts, { wash: col, ink: null });
    ln(pts.slice(1, 10), .7, li === 0 ? F.chalkDim : mixCol(col, F.moonBeam, .3), 'inkfine', 1);
  });
}
// 海鸟
function birds(t, n = 4, x0 = 0, y0 = 90, spread = 220, k = 1, col = F.chalkDim, seed = 0) {
  for (let i = 0; i < n; i++) {
    const s = seed + i * 2.3, x = x0 + hash(s) * spread + Math.sin(t * .5 + s) * 12, y = y0 + hash(s * 3.1) * 70;
    const f = Math.sin(t * 4 + s * 2) * .5, w = (4 + hash(s * 7) * 5) * k;
    ln([[x - w, y + f * w], [x, y - Math.abs(f) * w * .4], [x + w, y + f * w]], .7, col, 'inkfine', 1);
  }
}
// 崖:一面带台地的海蚀头(先陡上去,再一块平顶伸出去),不是一片三角鳍
function cliffAt(x, y, w, h, col = '#141C36', side = 1) {
  boilSeed('cliff' + Math.round(x));
  const P = k => x + side * w * k;
  const pts = [[x, y], [P(.12), y - h * .62], [P(.34), y - h * .88], [P(.46), y - h],
               [P(1.12), y - h * 1.02], [P(1.24), y - h * .9], [P(1.3), y + 40], [x, y + 40]];
  paint(pts, { wash: col, ink: null });
  ln(pts.slice(0, 6), 1, F.chalkDim, 'inkfine', 1);
  // 崖面上两道裂纹 + 台地边一丛草
  ln([[P(.3), y - h * .5], [P(.4), y - h * .3], [P(.36), y - h * .1]], .6, '#0E1530', 'inkfine', 1);
  ln([[P(.75), y - h * .82], [P(.85), y - h * .6]], .6, '#0E1530', 'inkfine', 1);
  tuftAt(P(1.05), y - h * 1.02, 7, T, F.bioDk, 'clifftuft' + Math.round(x));
}

// ---------- 角色 ----------
// 我(月白色,暖)和 你(生物光的青)。同一个模子(clawd.js),两种颜色;
// 你身上那一点光是全片的记号 —— 上一部是头上那朵纸花,这一部是手里那盏小灯。
const ME_COL = { col: F.me, dk: F.meDk, lt: F.meLt };
const YOU_COL = { col: F.you, dk: F.youDk, lt: F.youLt };
// 夜色里影子不是墨,是更深的一层夜;深墨描边在深底上会「吃掉」轮廓,所以描边改成月光色。
const NIGHT_FIG = { swMul: .8 };
function hero(x, y, u, o = {}) {
  clawd(x, y, u, { ...ME_COL, ...NIGHT_FIG, ...o, boilKey: o.boilKey || 'hero' });
  if (!o.noLamp) {   // 手里那盏灯:全片跟着他走的一点暖光
    const s = u * .55, lx = x + (o.flip ? -1 : 1) * u * 3.1, ly = y - u * 3.4 + (o.dy || 0) * u;
    lanternAt(lx, ly, s, T, { seed: 3, glowK: 4.2, ph: 1.1 });
  }
}
function dear(x, y, u, o = {}) {
  clawd(x, y, u, { ...YOU_COL, ...NIGHT_FIG, ...o, boilKey: o.boilKey || 'dear' });
  glow(x, y - u * 4, u * 7.5, F.bio, .30);   // 她自己就在发光
}
// 一个「光做的人」:只有轮廓和光,用来做回忆里的你
function lightFigure(x, y, u, t, k = 1, col = F.spark, o = {}) {
  glow(x, y - u * 4, u * 9, col, .5 * k);
  const br = .75 + .25 * Math.sin(t * 2.2);
  paint(rectPts(x - u * 3, y - u * 8, u * 6, u * 6, u * .1), { wash: col, washOp: 120 * br * k, ink: null });
  ln(rectPts(x - u * 3, y - u * 8, u * 6, u * 6, u * .12), .9, F.moonBeam, 'inkfine', 0);
  // 一对发光的眼睛:有脸才是「人」,不然只是一块玻璃
  for (const sd of [-1, 1]) dotAt(x + sd * u * 1.15 + (o.lookX || 0) * u * .5, y - u * 5.4, u * .34, F.moonBeam, 240);
  dotAt(x + (o.lookX || 0) * u * .5, y - u * 3.6, u * .22, F.moonBeam, 160);
  for (let i = 0; i < 5; i++) sparkAt(x + (hash(i * 3.7 + Math.floor(t * 3)) - .5) * u * 8, y - u * (2 + hash(i * 5.1) * 7), 1 + hash(i) * 1.6, t, i + Math.floor(t * 2), col, k * .8);
}

// ---------- 转场 ----------
// 这一部不用毛笔横扫(那是上一部的转场)。三套新的,都画在屏幕空间(相机之外),都在小节线上起手:
//   tideWipe  一道浪从左推过来盖满(p=.5),盖满时切镜,然后浪往右退开 —— 和歌同呼吸
//   moonIris  月亮从画面中心长出来吞掉画面 / 再缩回去
//   lightUp   一次曝光:整幅亮起来再落回去(爆点用)
// A 镜末尾: if (lt > dur - .55) tideWipe((lt - (dur - .55)) / 1.1);
// B 镜开头: if (lt < .55) tideWipe(.5 + lt / 1.1);
function tideWipe(p, o = {}) {
  if (p <= 0 || p >= 1) return;
  const col = o.col || F.seaHi, foam = o.foam || F.silver;
  // 水体永远在 edge 的右边 [edge, W+420]:前半程 edge 从左扫到右(盖满),后半程继续往右退干净
  const edge = p < .5 ? lerp(-260, W + 260, easeOut(clamp(p * 2)))
                      : lerp(W + 260, W + 1980, easeOut(clamp((p - .5) * 2)));
  const pts = [];
  for (let i = 0; i <= 14; i++) {
    const y = -60 + (H + 120) * i / 14;
    pts.push([edge + Math.sin(i * .8 + p * 7) * 46, y]);
  }
  for (let i = 14; i >= 0; i--) pts.push([W + 420, -60 + (H + 120) * i / 14]);
  paint(pts, { wash: col, washOp: 255, ink: null });
  // 浪头的沫
  for (let i = 0; i <= 16; i++) {
    const y = -40 + (H + 100) * i / 16, r = 5 + hash(i * 4.3 + Math.floor(p * 6)) * 12;
    dotAt(edge + Math.sin(i * .9 + p * 8) * 44 + hash(i * 2.1) * 20 - 10, y, r, foam, 200);
  }
  ln(pts.slice(0, 15), 1.3, foam, 'inkfine', 1);
  for (let i = 0; i < 10; i++) sparkAt(edge - (30 + hash(i * 6.1) * 160), hash(i * 3.3) * H, 1.2 + hash(i * 8.8) * 2, p * 3, i + 40, F.bio, .8);
}
function moonIris(p, o = {}) {
  if (p <= 0 || p >= 1) return;
  const k = p < .5 ? easeOut(clamp(p * 2)) : 1 - easeOut(clamp((p - .5) * 2));
  const r = lerp(4, Math.hypot(W, H) * .72, k), cx = o.x ?? W / 2, cy = o.y ?? H * .42;
  irisShape(ellPts(cx, cy, Math.max(3, r), Math.max(3, r), 44), o.col || F.skyHi);
  ln(ellPts(cx, cy, Math.max(4, r), Math.max(4, r), 44), 1.2, F.moonBeam, 'inkfine', 1);
}
function lightUp(p, k = 1, col = '#EAF2FF') {
  const a = Math.sin(clamp(p) * Math.PI) * k;
  if (a > .01) flash(a, col);
}
// 淡入/淡出夜色
function fadeNight(k, col = F.skyHi) { if (k > .01) paint(rectPts(-60, -60, W + 120, H + 120), { wash: col, washOp: 255 * clamp(k), ink: null }); }

// ---------- 运镜(每个镜头都要有一个) ----------
// pushIn(lt, dur, cx, cy, z0, z1): 从 z0 缓推到 z1,中心从 (cx,cy) 缓缓移开。
function pushIn(lt, dur, cx, cy, z0 = 1, z1 = 1.16, o = {}) {
  const k = ease(clamp(lt / Math.max(.001, dur)));
  const [sx, sy] = o.shake ? shakeXY(lt, o.shake) : [0, 0];
  camBegin(cx + (o.dx || 0) * k + sx, cy + (o.dy || 0) * k + sy, lerp(z0, z1, k), (o.rot || 0) * k);
}
// drift(lt, dur, x0, y0, x1, y1, z): 横移/升降镜头
function drift(lt, dur, x0, y0, x1, y1, z = 1, o = {}) {
  const k = ease(clamp(lt / Math.max(.001, dur)));
  const [sx, sy] = o.shake ? shakeXY(lt, o.shake) : [0, 0];
  camBegin(lerp(x0, x1, k) + sx, lerp(y0, y1, k) + sy, z, (o.rot || 0) * Math.sin(k * Math.PI));
}
// pullOut: 拉远(结尾用)
function pullOut(lt, dur, cx, cy, z0 = 1.3, z1 = .86) { pushIn(lt, dur, cx, cy, z0, z1); }

// ---------- 再几个共用件 ----------
// 沙滩脚印:从 x0 到 x1 每隔 spacing 一对小雨点状的坑。op 可以被后面的浪压掉。
function footprints(x0, x1, y, spacing, col, op = 130, seed = 'fp') {
  const n = Math.floor((x1 - x0) / spacing);
  if (n < 1) return;
  boilSeed(seed);
  for (let i = 0; i <= n; i++) {
    const x = x0 + i * spacing, s = 2.6 + hash(i * 3.3 + seed.length) * .8;
    paint(ellPts(x, y + (i % 2 ? 3.4 : -3.4), s, s * .55, 8, .5), { wash: col, washOp: op * (.75 + .25 * hash(i * 7.1)), ink: null });
  }
}
// 湿沙上的倒影:一条从脚往下淌的色带 + 几道碎光(不是镜像,是「压扁的倒影」)
function reflectionStreak(x, y, u, col, o = {}) {
  const h = u * 3.4 * (o.k ?? 1);
  boilSeed('refl' + Math.round(x));
  for (let i = 0; i < 4; i++) {
    const p = i / 4, w = u * (3.4 - i * .55);
    paint(ellPts(x + Math.sin(i * 1.7) * u * .2, y + h * (p + .1), w, u * .34 * (1 - p * .3), 12, 1), { wash: col, washOp: (o.op ?? 80) * (1 - p * .55), ink: null });
  }
  ln([[x - u * 2, y + h * .5], [x + u * 2, y + h * .45]], .6, F.moonBeam, 'inkfine', 1);
}
// 一步一簇的火星(踩在月光水道上的那一下)
function stepSpark(x, y, t, k = 1, seed = 0) {
  boilSeed('step' + seed);
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI * (.1 + hash(i * 2.3 + seed) * .8), d = (6 + hash(i * 4.7 + seed) * 22) * k;
    dotAt(x + Math.cos(a) * d, y + Math.sin(a) * d, .8 + hash(i * 6.1) * 1.6, i % 2 ? F.spark : F.moonBeam, 220);
  }
}
// 挂在天上/漂在海上的一串灯(灯笼海用):n 盏,慢速上飘,各自呼吸
function lanternField(t, n, o = {}) {
  for (let i = 0; i < n; i++) {
    const s = i * 1.7 + (o.seed || 0);
    const x = o.x0 + hash(s * 1.13) * (o.x1 - o.x0) + Math.sin(t * .2 + s) * 8;
    const rise = frac(t * (.012 + hash(s * 3.9) * .02)) * (o.rise ?? 46);
    const y = (o.y0 + hash(s * 2.71) * (o.y1 - o.y0)) - rise;
    const r = (o.r0 ?? 2) + hash(s * 5.3) * (o.dr ?? 4);
    const fl = .7 + .3 * Math.sin(t * 2.6 + s * 2.1);
    glow(x, y, r * 4, F.lantern, .34 * fl * (o.k ?? 1));
    dotAt(x, y, r, F.lantern, 200 * fl);
  }
}
