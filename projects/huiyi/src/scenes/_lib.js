// _lib.js — 《把回忆拼好给你》的共享美术词汇(shared art vocabulary)
//
// 整片只用「平涂水粉块面 + 细笔水墨线条 + 纸纹」:背景是扁平的 wash 色块,线是细的 inkfine,
// 光用 glow()。引擎在 software GL 上跑,水彩 fill 一次 3.2 s,一律不用(见 core.js 的 FLAT)。
//
// 拍子:95 BPM,4/4,BEAT = 0.6316 s,BAR = 2.5263 s,第一个正拍在 0.62 s。
// assets/song.lrc 的每一句都落在小节线上,所以「卡点」= 每一句的起点切一刀,动作落在正拍。
// 表格里的时间都是歌曲时间(也是影片时间,音频没有裁剪)。

// ---------- 拍子网格 ----------
const BEAT_S = 60 / 95;            // 0.6316 s
const BAR_S = 4 * BEAT_S;          // 2.5263 s
const GRID0 = 0.62;                // 第一个正拍
const bar = n => GRID0 + n * BAR_S; // 第 n 小节的正拍
const beatNo = n => GRID0 + n * BEAT_S;
const BAR = BAR_S;

// 每一句歌词的起点(来自 assets/song.lrc)——镜头就在这些点切。
const LYR = [
  [0.06, '那天你在雨后街角答应接受我的爱'],
  [3.15, '那一刻我的世界有了色彩'],
  [5.67, '这一生无法忘记关于澄蓝色的你'],
  [8.16, '像一份礼物悄然呈现在我的境遇'],
  [10.68, '我们从清晨起玩一整天游戏'],
  [13.23, '到夜晚一起看我最爱的剧'],
  [15.87, '能够拥有这些已足够幸运'],
  [17.97, '我已经不再期待其他什么东西'],
  [20.79, '我们也经常争执互相不接电话'],
  [23.31, '在同一房间终于呼叫冷漠抵达'],
  [25.86, '也曾想过以后生活没有人牵挂'],
  [28.41, '把爱扔掉只剩一块残酷伤疤'],
  [30.99, '而那些你送我的梦 教我折的花'],
  [33.78, '逃亡的盛夏'],
  [35.01, '在夜空隐没之际 为我点燃烟花'],
  [37.56, '寂寞时让我把快乐拼起来吧'],
  [40.17, '我们之间的回忆'],
  [42.69, '全部都小心地收集'],
  [45.21, '我总是偷偷地哭泣'],
  [47.73, '像倦鸟失了归期'],
  [50.31, '但愿我相信的爱情'],
  [52.80, '结局紧握在我手心'],
  [55.29, '时光匆匆却没有遗失过去'],
  [60.69, '我们可以就像是孩子一样成长'],
  [65.76, '永远无所畏惧义无反顾向着未知的前方'],
  [70.86, '原来我们每天努力长成看似大人的模样'],
  [75.87, '为了可以一起跨越山和海洋'],
  [101.10, '那时的我每天都祈祷实现这个梦想'],
];

// ---------- 调色板 ----------
// 一条颜色弧:雨后的冷灰蓝 → 暖灯下的琥珀 → 争执时的靛青 → 烟花的金/玫瑰 → 回忆的灰蓝 → 黎明的青 → 海上的金。
const F = {
  ink: '#2E2A3B', inkSoft: '#4B4560', cream: '#F7EEDA', paper: '#F1E6D2',
  // 雨 / 街
  skyRain: '#8CA0B6', skyRainLo: '#6D8299', sky: '#8EC3E6', wet: '#5D7189', kerb: '#7E90A4',
  // 夜
  night: '#232A4A', nightLo: '#171C36', window: '#F3CE84',
  // 屋子
  wallDay: '#EFE0C4', wallDayLo: '#DFC9A6', wallNight: '#4A3F5C', wallNightLo: '#332C42',
  floorDay: '#C9A87C', floorNight: '#3A3350',
  // 光 / 暖
  lamp: '#EFC069', lampHot: '#F8DFA6', gold: '#E8AA38', cream2: '#F3E3BE',
  // 情绪
  rose: '#E08A96', roseDk: '#B65F6E', blue: '#6FA3CE', blueDk: '#4A7BA3', blueLt: '#A9CEE6',
  clay: '#D97757', clayDk: '#A84D33', clayLt: '#F2A283',
  // 海 / 梦
  sea: '#3E7F86', seaLt: '#69A8A6', seaDk: '#2B5F68', sand: '#E4CFA6',
  // 烟花
  fwGold: '#FFD37A', fwRose: '#FF9FB0', fwTeal: '#8FE0D2', fwViolet: '#C6A8F0',
  cold: '#5C6E85', coldLo: '#414F63', grey: '#8C8A92', greyLo: '#6E6C76',
  green: '#7E9F63', greenDk: '#5C7A47',
};

// ---------- 小工具 ----------
function slab(x, y, w, h, col, j = 3, op = 255) { paint(rectPts(x, y, w, h, j), { wash: col, washOp: op, ink: null }); }
function ln(pts, sw = 1.1, col = F.ink, br = 'inkfine', curv = .6) { inkLine(pts, sw, col, br, curv); }
function dotAt(x, y, r, col, op = 255) { paint(ellPts(x, y, r, r * .95, 8, .4), { wash: col, washOp: op, ink: null }); }
function band(y0, y1, col, op = 255, j = 5) { paint(ellPts(W / 2, (y0 + y1) / 2, W * .98, Math.max(2, (y1 - y0) / 2), 24, j), { wash: col, washOp: op, ink: null }); }
function wobLine(x0, x1, y, amp, ph, col, sw = 1, segs = 6, t = 0) {
  const p = []; for (let i = 0; i <= segs; i++) p.push([lerp(x0, x1, i / segs), y + Math.sin(i * .8 + ph + t) * amp]);
  ln(p, sw, col, 'inkfine', 1);
}
// 一块暖光/冷光落在地上
function pool(x, y, r, k = 1, col = '#FFCE86') {
  if (k <= .02) return;
  paint(ellPts(x, y, r, r * .70, 22, r * .05), { wash: col, washOp: 40 * clamp(k), ink: null });
  paint(ellPts(x, y, r * .58, r * .42, 18, r * .04), { wash: col, washOp: 44 * clamp(k), ink: null });
}

// ---------- 屋里的小东西 ----------
// 电视:会发光,里面在放东西(游戏 / 剧)
function tvAt(x, y, w, h, t, kind = 'game', col = '#9FD3E8') {
  slab(x - w / 2 - 7, y - h / 2 - 7, w + 14, h + 14, '#5E5142', 1.5);
  slab(x - w / 2, y - h / 2, w, h, col, 1.2);
  glow(x, y, Math.max(w, h) * .85, col, .4);
  boilSeed('tv' + kind);
  if (kind === 'game') {                       // 一个跳来跳去的小方块
    const ph = frac(t * .5);
    const bx = x + Math.sin(t * 3.1) * w * .28, by = y + h * .30 - Math.abs(Math.sin(t * 3.1)) * h * .55;
    slab(bx - w * .07, by - w * .07, w * .14, w * .14, F.gold, .8);
    slab(x - w * .40, y + h * .30, w * .16, h * .12, F.rose, .8);
  } else {                                    // 剧:一个慢慢变形的光斑
    const r = w * (.16 + .05 * Math.sin(t * 1.3));
    paint(ellPts(x + Math.sin(t * .8) * w * .1, y, r, r * .8, 16, 1.2), { wash: F.cream2, washOp: 210, ink: null });
    paint(ellPts(x - w * .22, y + h * .12, r * .7, r * .6, 14, 1), { wash: F.rose, washOp: 150, ink: null });
  }
  slab(x - w * .12, y + h / 2 + 4, w * .24, h * .16, '#5E5142', 1);
}
// 一块搁板
function shelfAt(x, y, w) {
  slab(x, y, w, 11, '#B2835A', 1);
  slab(x + w * .06, y + 11, 9, 16, '#8E6742', .8);
  slab(x + w * .90, y + 11, 9, 16, '#8E6742', .8);
  ln([[x, y], [x + w, y]], .9, F.inkSoft, 'inkfine', 0);
}
// 地毯
function rugAt(x, y, rx, ry) {
  paint(ellPts(x, y, rx, ry, 26, 2), { wash: '#B9705E', washOp: 235, ink: null });
  paint(ellPts(x, y, rx * .74, ry * .74, 22, 2), { wash: '#D08D6E', washOp: 220, ink: null });
  paint(ellPts(x, y, rx * .44, ry * .46, 18, 1.5), { wash: '#C9A87C', washOp: 220, ink: null });
}
// 沙发(晚上看剧)
function sofaAt(x, y, w) {
  slab(x - w / 2, y - 26, w, 40, '#8E6E86', 2);
  slab(x - w / 2, y - 70, 26, 78, '#7A5C74', 2);
  slab(x + w / 2 - 26, y - 70, 26, 78, '#7A5C74', 2);
  slab(x - w / 2 + 6, y - 14, w - 12, 18, '#9C7C94', 2);
  ln([[x - w / 2, y - 26], [x + w / 2, y - 26]], 1, F.inkSoft, 'inkfine', 0);
}
// 一条盖在两个人身上的毯子
function blanketAt(x, y, w, h, col = '#C4744F') {
  paint([[x - w / 2, y], [x + w / 2, y], [x + w / 2 + 10, y + h * .55], [x - w / 2 - 10, y + h * .55]], { wash: col, ink: null });
  paint([[x - w / 2, y + h * .22], [x + w / 2, y + h * .22], [x + w / 2 + 10, y + h * .55], [x - w / 2 - 10, y + h * .55]], { wash: mixCol(col, F.ink, .20), washOp: 150, ink: null });
  ln([[x - w / 2, y], [x + w / 2, y]], 1.1, mixCol(col, F.ink, .4), 'inkfine', 0);
}
// 时钟(墙上)
function clockAt(x, y, r, t) {
  paint(ellPts(x, y, r, r, 20, .8), { wash: F.cream2, ink: null });
  ln([[x, y], [x + Math.cos(t * .1 - 1.57) * r * .5, y + Math.sin(t * .1 - 1.57) * r * .5]], 1.4, F.ink, 'inkfine', 0);
  ln([[x, y], [x + Math.cos(t * 1.1 - 1.57) * r * .72, y + Math.sin(t * 1.1 - 1.57) * r * .72]], 1, F.ink, 'inkfine', 0);
  ln(ellPts(x, y, r, r, 20, .8), .9, F.ink, 'inkfine', 1);
}

// ---------- 角色 ----------
// 我(陶土色)和 你(澄蓝色)。同一个模子,两种颜色;你头上那朵纸花是全片的记号。
const HER_COL = { col: F.clay, dk: F.clayDk, lt: F.clayLt };
const YOU_COL = { col: F.blue, dk: F.blueDk, lt: F.blueLt };

function hero(x, y, u, o = {}) { clawd(x, y, u, { ...HER_COL, ...o, boilKey: o.boilKey || 'hero' }); }
function dear(x, y, u, o = {}) {
  const extra = o.noFlower ? null : (uu) => paperFlowerAt(0, -8.3 * uu, uu * .62, F.cream2, F.rose, 0);
  clawd(x, y, u, { ...YOU_COL, ...o, draw: o.draw || extra, boilKey: o.boilKey || 'dear' });
}

// ---------- 纸(全片的记号) ----------
// 一枚记忆碎片:一小张纸,上面有一点点画过的痕迹。
function scrapAt(x, y, s, rot = 0, col = F.cream2, mark = F.blue) {
  push(); translate(x, y); rotate(rot);
  slab(-s / 2, -s / 2, s, s, col, .3);
  ln([[-s / 2, -s / 2], [s / 2, -s / 2], [s / 2, s / 2], [-s / 2, s / 2], [-s / 2, -s / 2]], .7, F.inkSoft, 'inkfine', 0);
  paint(ellPts(0, 0, s * .22, s * .16, 8, .2), { wash: mark, ink: null });
  pop();
}
// 纸鹤:折出来的鸟。全片一直在的那一只。
function birdAt(x, y, s, rot = 0, col = F.cream2, flap = 0, ink = F.ink) {
  push(); translate(x, y); rotate(rot);
  const w = flap * .55;                                     // 扇翅膀
  // 身体
  paint([[-.95 * s, .10 * s], [.95 * s, .05 * s], [.40 * s, -.60 * s], [-.55 * s, -.48 * s]], { wash: col, ink: null });
  // 翅膀(上)
  paint([[.15 * s, -.52 * s], [.60 * s, (-1.30 - w) * s], [-.30 * s, (-.70 - w * .5) * s]], { wash: mixCol(col, F.ink, .12), ink: null });
  // 翅膀(下)
  paint([[.10 * s, -.40 * s], [.45 * s, (.20 + w * .55) * s], [-.35 * s, -.05 * s]], { wash: mixCol(col, F.ink, .22), ink: null });
  // 尾
  paint([[-.90 * s, .08 * s], [-1.55 * s, -.38 * s], [-.80 * s, -.34 * s]], { wash: mixCol(col, F.ink, .16), ink: null });
  // 头颈 + 喙
  paint([[.90 * s, .02 * s], [1.30 * s, -.52 * s], [1.52 * s, -.42 * s], [1.12 * s, -.02 * s]], { wash: col, ink: null });
  paint([[1.30 * s, -.52 * s], [1.66 * s, -.44 * s], [1.28 * s, -.30 * s]], { wash: F.gold, ink: null });
  // 一条细线把折痕点出来
  ln([[-.55 * s, -.48 * s], [.15 * s, -.52 * s], [.90 * s, .02 * s]], .8, ink, 'inkfine', .8);
  ln([[1.30 * s, -.52 * s], [1.12 * s, -.02 * s]], .7, ink, 'inkfine', .8);
  pop();
}
// 折出来的花(你教我的那朵)
function paperFlowerAt(x, y, s, col = F.cream2, heart = F.rose, open = 1) {
  const n = 5, r = s * (.55 + .45 * open);
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU - Math.PI / 2;
    const px = x + Math.cos(a) * r * .52, py = y + Math.sin(a) * r * .52;
    paint([[x, y], [px - Math.sin(a) * r * .42, py + Math.cos(a) * r * .42], [px + Math.cos(a) * r * .18, py + Math.sin(a) * r * .18],
           [px + Math.sin(a) * r * .42, py - Math.cos(a) * r * .42]], { wash: i % 2 ? col : mixCol(col, F.rose, .25), ink: null });
  }
  paint(ellPts(x, y, s * .26, s * .24, 10, .3), { wash: heart, ink: null });
}
// 纸盒:装回忆的盒子
function boxAt(x, y, s, open = 0, col = '#B98A5E') {
  slab(x - s / 2, y - s * .78, s, s * .78, col, 1.2);
  slab(x - s / 2, y - s * .78, s * .16, s * .78, mixCol(col, F.ink, .22), 1);
  if (open > .01) {
    slab(x - s / 2, y - s * (.78 + open * .5), s, s * .12, mixCol(col, '#FFF', .22), 1);
    slab(x - s / 2 - s * .06, y - s * (.78 + open * .5) - s * .42, s * 1.12, s * .10, mixCol(col, F.ink, .12), 1);
  } else {
    slab(x - s * .56, y - s * .86, s * 1.12, s * .12, mixCol(col, '#FFF', .18), 1);
  }
  ln([[x - s / 2, y - s * .78], [x + s / 2, y - s * .78]], .8, F.inkSoft, 'inkfine', 0);
}
// 一把伞(澄蓝色的那把):伞面是一个拱 + 一条波浪的下沿,伞柄是一根细线。
function umbrellaAt(x, y, s, col = F.blue, tilt = 0, sway = 0) {
  const sx = x + sway, top = y - s * .78;
  push(); translate(sx, top); rotate(tilt);
  const dome = [], rim = [];
  for (let i = 0; i <= 8; i++) {
    const a = Math.PI + i / 8 * Math.PI;
    dome.push([Math.cos(a) * s * 1.08, Math.sin(a) * s * .60]);
    rim.push([Math.cos(a) * s * 1.08, (i % 2 ? s * .13 : 0)]);
  }
  paint(dome.concat(rim.slice().reverse()), { wash: col, ink: null });            // 伞面
  paint([[-s * 1.08, 0], [0, -s * .10], [s * 1.08, 0]], { wash: mixCol(col, F.ink, .20), ink: null });  // 阴影面
  ln(dome.concat([[s * 1.08, 0]]), 1.0, F.ink, 'inkfine', .4);
  ln(rim.slice().reverse().concat([[-s * 1.08, 0]]), .9, F.ink, 'inkfine', .4);
  ln([[0, -s * .60], [0, s * .06]], .8, mixCol(col, F.ink, .35), 'inkfine', 0);   // 中间的伞骨
  pop();
  ln([[sx, top + s * .12], [sx, y + s * 1.0]], 1.2, F.ink, 'inkfine', 0);         // 伞柄
  ln([[sx, y + s * 1.0], [sx + s * .24, y + s * 1.10], [sx + s * .30, y + s * .90]], 1.2, F.ink, 'inkfine', .8);
}
function phoneAt(x, y, s, ring = 0, col = '#4A4560') {
  slab(x - s * .38, y - s * .78, s * .76, s * 1.5, col, .5);
  slab(x - s * .30, y - s * .68, s * .60, s * 1.16, '#C8D2DC', .4);
  if (ring > .01) {
    glow(x, y - s * .1, s * 2.2, '#FFD37A', .5 * ring);
    for (let i = 1; i <= 2; i++) paint(ellPts(x, y - s * .1, s * (.7 + i * .45), s * (.7 + i * .45), 18, .8), { wash: F.fwGold, washOp: 70 * ring / i, ink: null });
  }
}
// 电视 / 屏幕:房间里那块会发光的东西
function screenAt(x, y, w, h, col = '#9FD3E8', k = 1) {
  slab(x - w / 2 - 6, y - h / 2 - 6, w + 12, h + 12, '#6B5B4A', 1.5);
  slab(x - w / 2, y - h / 2, w, h, col, 1);
  glow(x, y, Math.max(w, h) * .8, col, .35 * k);
  paint(ellPts(x, y, w * .42, h * .38, 16, 2), { wash: mixCol(col, '#FFF', .5), washOp: 120, ink: null });
}
// 烟花:一簇炸开的亮点(手绘的:一束放射的短笔触 + 一个亮核 + 一圈晕)
function fireworkAt(cx, cy, age, col = F.fwGold, r = 90) {
  if (age < 0 || age > 1.6) return;
  const grow = ease(clamp(age / .40));
  const k = grow * (1 - clamp((age - .55) / 1.05));
  if (k <= .02) return;
  const n = 16;
  boilSeed('fw' + Math.round(cx) + Math.round(cy) + Math.round(age * 6));
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU + hash(i * 3.7) * .22;
    const d = r * (.18 + .82 * grow) * (.82 + hash(i * 1.9) * .32);
    const px = cx + Math.cos(a) * d, py = cy + Math.sin(a) * d * .92;
    const rr = (5.5 + hash(i * 5.1) * 4.5) * k;
    // 一小笔放射的颜料
    paint([[cx + Math.cos(a) * d * .55, cy + Math.sin(a) * d * .52],
           [px + Math.cos(a + 1.57) * rr * .8, py + Math.sin(a + 1.57) * rr * .8],
           [px, py],
           [px + Math.cos(a - 1.57) * rr * .8, py + Math.sin(a - 1.57) * rr * .8]],
          { wash: col, washOp: 225 * k, ink: null });
    dotAt(px, py, rr * .75, F.cream2, 235 * k);
    if (hash(i * 7.3) > .6) dotAt(px + Math.cos(a) * 22, py + Math.sin(a) * 22, rr * .45, col, 190 * k);
  }
  dotAt(cx, cy, 11 * k, F.cream2, 250 * k);
  glow(cx, cy, r * 1.05, col, .5 * k);
}
// 四角星:亮一下又灭
function sparkleAt(x, y, r, age, life = 1.0) {
  if (age < 0 || age > life) return;
  const k = Math.sin(clamp(age / life) * Math.PI);
  paint(starPts(x, y, r * k, .26, 4), { wash: F.cream2, washOp: 255 * k, ink: null });
  paint(starPts(x, y, r * k * .45, .3, 4, -.35), { wash: F.gold, washOp: 220 * k, ink: null });
}
// 一圈涟漪
function rippleAt(x, y, r, k, col = F.cream2) {
  if (k <= .02) return;
  paint(ellPts(x, y, r, r * .32, 24, r * .04), { wash: col, washOp: 150 * k, ink: null });
}

// ---------- 场景背景 ----------
// 雨后的街角:第 1 镜和最后 1 镜(同一个地方,呼应)。
function streetCorner(t, o = {}) {
  const fy = o.fy ?? H * .78, night = o.night ?? 0, rain = o.rain ?? 1;
  const warm = o.warm ?? 0;                 // 0 = 冷雨,1 = 已经有颜色了
  boilSeed('stsky');
  band(-40, fy * .40, mixCol(mixCol(F.skyRain, F.night, night * .7), '#E8B9A0', warm * .55), 255);
  band(fy * .28, fy * .52, mixCol(mixCol(F.skyRainLo, F.nightLo, night * .7), '#F0C9A6', warm * .6), 255);
  // 对面一排楼:剪影 + 亮着的窗
  boilSeed('stbld');
  const blds = [[-.06, .40, .20], [.16, .52, .16], [.34, .34, .22], [.60, .46, .18], [.80, .36, .18], [.99, .48, .16]];
  for (const [bx, bh, bw] of blds) {
    const x = bx * W, h = fy * bh;
    slab(x, fy - h, bw * W, h, mixCol(mixCol(F.cold, F.night, .42 + night * .3), '#7E6E86', warm * .35), 2);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) {
      if (hash(r * 7.3 + c * 3.1 + bx * 11) < .30) continue;
      const wx = x + bw * W * (.20 + c * .44), wy = fy - h + h * (.12 + r * .23);
      const wcol = mixCol(F.window, F.skyRain, .30 - warm * .3);
      slab(wx, wy, bw * W * .24, h * .12, wcol, 1, 170 + warm * 60);
      if (warm > .4 && hash(r * 3.1 + c * 5.7 + bx) > .6) glow(wx + bw * W * .12, wy + h * .06, 34, '#FFD79A', .35 * warm);
    }
  }
  // 街角那家亮着灯的店:整条街唯一有颜色��地方(颜色会从这里开始)
  boilSeed('stshop');
  const sx0 = -W * .04, sw = W * .27, sh = fy * .50;
  slab(sx0, fy - sh, sw, sh, mixCol(mixCol('#8A6E62', F.night, .30 + night * .3), '#B08474', warm * .4), 2);
  slab(sx0 + sw * .12, fy - sh * .62, sw * .70, sh * .44, mixCol(F.window, F.skyRain, .18 - warm * .18), 1.5, 235);
  slab(sx0 + sw * .12, fy - sh * .62, sw * .70, sh * .10, mixCol(F.window, F.ink, .18), 1, 120);
  glow(sx0 + sw * .47, fy - sh * .40, 90, '#FFD79A', .5);
  // 雨棚:玫瑰色和奶油色相间的条纹
  for (let i = 0; i < 6; i++) {
    const ax = sx0 + sw * .04 + i * sw * .175, col = i % 2 ? mixCol(F.rose, F.cream2, .35) : mixCol(F.cream2, F.skyRain, .12);
    slab(ax, fy - sh * .70, sw * .175, sh * .12, mixCol(col, F.skyRain, .18 - warm * .18), 1.5);
  }
  slab(sx0 + sw * .04, fy - sh * .70 + sh * .12, sw * 1.05, sh * .035, mixCol(F.ink, F.rose, .25), 1);
  // 人行道 + 路缘 + 路面
  boilSeed('stst');
  band(fy - H * .055, fy + 4, mixCol(mixCol(F.kerb, F.night, night * .5), '#C8B49A', warm * .5), 255);
  band(fy, H + 40, mixCol(mixCol(F.wet, F.nightLo, night * .7), '#8E7F86', warm * .45), 255);
  slab(-20, fy - 5, W + 40, 8, mixCol(F.kerb, F.ink, .25), 3, 220);
  // 水洼:映着暖光
  boilSeed('stpud');
  for (let i = 0; i < 5; i++) {
    const px = W * (.06 + hash(i * 4.4) * .88), py = fy + H * (.09 + hash(i * 2.2) * .13);
    const rx = W * (.09 + hash(i * 6.6) * .10);
    paint(ellPts(px, py, rx, rx * .15, 20, 2), { wash: mixCol(F.skyRainLo, F.ink, .30), washOp: 130, ink: null });
    paint(ellPts(px, py, rx * .78, rx * .11, 18, 1.5), { wash: mixCol(F.window, F.skyRain, .35 - warm * .3), washOp: 80, ink: null });
  }
  // 路灯
  const lx = o.lampX ?? W * .82;
  ln([[lx, fy - H * .58], [lx, fy - H * .42]], 1.5, F.ink, 'inkfine', 0);
  paint(ellPts(lx, fy - H * .42, 10, 8, 10, .8), { wash: F.lamp, ink: null });
  glow(lx, fy - H * .42, 78, '#FFD9A0', .6 * (1 - night * .25));
  pool(lx, fy + H * .05, 78, .75, '#FFD9A0');
  // 雨:细长的浅色块,不是线(线太贵)
  if (rain > 0) {
    boilSeed('stra');
    for (let i = 0; i < 26; i++) {
      const rx = hash(i * 5.3) * (W + 120) - 60;
      const ry = frac(hash(i * 2.9) + t * (.55 + hash(i) * .35)) * (H + 90) - 45;
      const len = 16 + hash(i * 8.1) * 22;
      push(); translate(rx, ry); rotate(.22);
      slab(-1.1, -len / 2, 2.2, len, F.cream2, 0, 95 * rain);
      pop();
    }
  }
}
// 一间小屋:白天 / 夜晚两套光
function littleRoom(t, o = {}) {
  const fy = o.fy ?? H * .76, night = o.night ?? 0;
  boilSeed('rmwall');
  band(-40, fy * .52, night ? F.wallNight : F.wallDay, 255);
  band(fy * .38, fy, night ? F.wallNightLo : F.wallDayLo, 255);
  boilSeed('rmfloor');
  band(fy, H + 40, night ? F.floorNight : F.floorDay, 255);
  slab(-20, fy - 9, W + 40, 11, night ? mixCol(F.floorNight, F.ink, .35) : mixCol(F.floorDay, F.ink, .22), 3);
  ln([[-20, fy - 9], [W + 20, fy - 9]], 1, night ? mixCol(F.floorNight, F.ink, .5) : mixCol(F.floorDay, F.ink, .35), 'inkfine', 0);
  // 窗
  const wx = o.winX ?? W * .82, wy = o.winY ?? H * .22, ww = o.winW ?? W * .20, wh = o.winH ?? H * .36;
  boilSeed('rmwin');
  slab(wx - ww * .08, wy - wh * .07, ww * 1.16, wh * 1.14, night ? '#5A4A3C' : '#8A6A4C', 2);
  slab(wx, wy, ww, wh, night ? F.night : mixCol(F.skyRain, '#FFF', .40), 2);
  if (!night) {
    paint(ellPts(wx + ww * .70, wy + wh * .26, ww * .17, ww * .17, 14, 1), { wash: F.cream2, ink: null });
    paint(ellPts(wx + ww * .62, wy + wh * .22, ww * .14, ww * .14, 12, 1), { wash: mixCol(F.skyRain, '#FFF', .40), ink: null });
    paint(ellPts(wx + ww * .22, wy + wh * .78, ww * .30, ww * .10, 14, 1), { wash: mixCol(F.skyRain, '#FFF', .2), washOp: 160, ink: null });
  } else {
    for (let i = 0; i < 6; i++) {
      const sx = wx + ww * (.10 + hash(i * 3.3) * .80), sy = wy + wh * (.08 + hash(i * 8.1) * .58);
      dotAt(sx, sy, 1.7, F.cream2, 200);
    }
    paint(ellPts(wx + ww * .74, wy + wh * .24, ww * .13, ww * .13, 14, 1), { wash: F.cream2, ink: null });
  }
  ln([[wx + ww * .5, wy], [wx + ww * .5, wy + wh]], 1, F.inkSoft, 'inkfine', 0);
  // 地板缝
  boilSeed('rmfl');
  for (let i = 0; i < 3; i++) {
    const y = fy + (H - fy) * (.32 + i * .26);
    wobLine(-20, W + 20, y, 1.4, i, night ? mixCol(F.floorNight, F.ink, .45) : mixCol(F.floorDay, F.ink, .25), .9, 5);
  }
  // 落地灯
  const lx = o.lampX ?? W * .13;
  if (o.lamp !== false) {
    boilSeed('rmlamp');
    const ly = fy - H * .40;
    ln([[lx, fy - 2], [lx, ly + 6]], 1.6, night ? '#5A4A5E' : '#7A5A44', 'inkfine', 0);
    paint(ellPts(lx, fy, 22, 6, 12, .8), { wash: night ? '#5A4A5E' : '#7A5A44', ink: null });
    paint([[lx - 26, ly + 22], [lx + 26, ly + 22], [lx + 17, ly - 10], [lx - 17, ly - 10]], { wash: night ? '#C49A6E' : '#E8B98A', ink: null });
    if (night) { glow(lx, ly + 8, 90, '#FFD79A', .75); pool(lx, fy + 6, 110, .8, '#FFCE86'); }
  }
  // 墙上的东西:一幅画、一个钟、一盆绿植
  if (o.pic !== false) {
    boilSeed('rmpic');
    const px = o.picX ?? W * .62, py = o.picY ?? H * .24, pw = W * .085, ph = H * .105;
    slab(px - 4, py - 4, pw + 8, ph + 8, '#8E6A4C', 1.5);
    slab(px, py, pw, ph, '#F4E6CB', 1);
    paint(ellPts(px + pw * .70, py + ph * .28, pw * .11, pw * .11, 12, .6), { wash: F.gold, ink: null });
    paint([[px + 2, py + ph * .60], [px + pw * .30, py + ph * .48], [px + pw * .56, py + ph * .62], [px + pw - 2, py + ph * .52],
           [px + pw - 2, py + ph - 2], [px + 2, py + ph - 2]], { wash: F.sky, ink: null });
    ln([[px + 2, py + ph * .60], [px + pw * .30, py + ph * .48], [px + pw * .56, py + ph * .62], [px + pw - 2, py + ph * .52]], 1, '#3F6C86', 'inkfine', .9);
  }
  if (o.clock !== false) clockAt(o.clockX ?? W * .47, o.clockY ?? H * .17, 20, t);
  if (o.plant !== false) {
    boilSeed('rmplant');
    const px = o.plantX ?? W * .93, py = fy - 4;
    slab(px - 16, py - 26, 32, 26, '#B3705A', 1.5);
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i - 2) * .38, len = 40 + hash(i * 3.3) * 26;
      paint([[px, py - 26], [px + Math.cos(a) * len * .5 - 7, py - 26 + Math.sin(a) * len], [px + Math.cos(a) * len * .5 + 7, py - 26 + Math.sin(a) * len * .86]],
            { wash: night ? '#4E6B52' : F.green, ink: null });
    }
  }
  // 地毯
  if (o.rug !== false) rugAt(o.rugX ?? W * .46, fy + H * .10, W * .26, H * .075);
}
// 夜里的屋顶(放烟花的那一镜)
function roofNight(t, o = {}) {
  boilSeed('rnsky');
  band(-40, H * .42, F.night, 255);
  band(H * .28, H * .62, F.nightLo, 255);
  boilSeed('rnstars');
  for (let i = 0; i < 22; i++) {
    const sx = hash(i * 3.1) * W, sy = hash(i * 7.7) * H * .58;
    const tw = .45 + .55 * Math.abs(Math.sin(t * 1.1 + i * 1.7));
    paint(starPts(sx, sy, 1.6 + tw * 1.3, .34, 4), { wash: F.cream2, washOp: 120 + 110 * tw, ink: null });
  }
  // 远处的城
  boilSeed('rncity');
  for (let i = 0; i < 9; i++) {
    const bw = W * (.06 + hash(i * 2.7) * .08), bh = H * (.10 + hash(i * 5.5) * .22);
    const bx = i * W * .115 - W * .04;
    slab(bx, H * .70 - bh, bw, bh + 40, mixCol(F.night, F.ink, .35), 2);
    for (let r = 0; r < 3; r++) if (hash(i * 3.3 + r * 4.1) > .45)
      slab(bx + bw * .3, H * .70 - bh + bh * (.2 + r * .3), bw * .3, bh * .12, F.window, 1, 170);
  }
  // 屋檐
  slab(-20, H * .70, W + 40, 30, mixCol(F.night, F.ink, .5), 3);
  slab(-20, H * .70 + 26, W + 40, H * .32, mixCol(F.night, F.ink, .62), 3);
}
// 海(第 27 镜、终章)
function seaView(t, o = {}) {
  const hy = o.hy ?? H * .52, dusk = o.dusk ?? 0;
  boilSeed('svsky');
  band(-40, hy * .55, mixCol('#F0C9A0', '#5C6E85', dusk * .5), 255);
  band(hy * .40, hy, mixCol('#E8B98C', '#7E8CA0', dusk * .5), 255);
  if (dusk > .3) { paint(ellPts(W * .72, hy * .78, 44, 44, 18, 1), { wash: F.fwGold, ink: null }); glow(W * .72, hy * .78, 110, '#FFC978', .5); }
  boilSeed('svsea');
  band(hy, H + 40, mixCol(F.seaLt, F.seaDk, dusk * .4), 255);
  band(hy + H * .12, H + 40, F.sea, 255);
  band(hy + H * .26, H + 40, F.seaDk, 255);
  // 波:浅色块,不是线
  boilSeed('svwave');
  for (let i = 0; i < 9; i++) {
    const y = hy + 6 + i * (H - hy) / 9;
    const w = W * (.2 + hash(i * 4.4) * .3);
    const x = frac(hash(i * 2.2) + t * (.02 + i * .004)) * (W + 200) - 100;
    paint(ellPts(x, y, w, 2.2 + i * .3, 14, .6), { wash: mixCol(F.seaLt, F.cream2, .35), washOp: 120, ink: null });
  }
  // 地平线上的一条线
  ln([[-10, hy], [W + 10, hy]], 1, mixCol(F.seaDk, F.ink, .3), 'inkfine', 0);
}
// 黄昏的城市(第 26 镜)
function cityDusk(t, o = {}) {
  boilSeed('cdsky');
  band(-40, H * .46, mixCol('#F2C9A2', '#8E6E86', .45), 255);
  band(H * .30, H * .58, mixCol('#E0A98E', '#6E5A78', .5), 255);
  boilSeed('cdcity');
  let x = -30;
  let i = 0;
  while (x < W + 40) {
    const bw = W * (.07 + hash(i * 3.1) * .09), bh = H * (.12 + hash(i * 5.9) * .30);
    const tone = mixCol('#6E5A78', '#3E3450', hash(i * 2.2));
    slab(x, H * .82 - bh, bw, bh + 60, tone, 2);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++)
      if (hash(i * 4.4 + r * 2.2 + c) > .42) slab(x + bw * (.2 + c * .4), H * .82 - bh + bh * (.15 + r * .22), bw * .2, bh * .1, F.window, .6, 150);
    x += bw + W * .012; i++;
  }
  slab(-20, H * .82, W + 40, H * .2, mixCol('#4A3F58', F.ink, .25), 3);
}

// ---------- 更多场景 ----------
// 一张小桌
function tableAt(x, y, w, col = '#B2835A', h = H * .17) {
  const th = Math.max(12, w * .12);
  slab(x - w / 2, y - th * .5, w, th, col, 1.5);
  slab(x - w / 2 - 3, y + th * .4, w + 6, th * .5, mixCol(col, F.ink, .25), 1.5);
  slab(x - w * .42, y + th * .8, w * .07, h, mixCol(col, F.ink, .18), 1.5);
  slab(x + w * .35, y + th * .8, w * .07, h, mixCol(col, F.ink, .18), 1.5);
  ln([[x - w / 2, y - th * .5], [x + w / 2, y - th * .5]], 1, mixCol(col, F.ink, .35), 'inkfine', 0);
}
// 一根光秃的树枝
function branchAt(x, y, len, dir = 1) {
  ln([[x, y], [x + dir * len * .45, y - len * .22], [x + dir * len, y - len * .30]], 2.2, '#6B4A38', 'ink', .6);
  ln([[x + dir * len * .45, y - len * .22], [x + dir * len * .62, y - len * .52]], 1.4, '#6B4A38', 'ink', .6);
  ln([[x + dir * len * .8, y - len * .28], [x + dir * len * .96, y - len * .50]], 1.1, '#6B4A38', 'ink', .6);
}
// 一道山脊/悬崖边
function ridgeAt(y, col = '#4A4258', seed = 0) {
  const P = [[-20, H + 40]];
  for (let i = 0; i <= 8; i++) P.push([-20 + (W + 40) * i / 8, y + Math.sin(i * 1.1 + seed) * 14 + (hash(i * 3.3 + seed) - .5) * 16]);
  P.push([W + 20, H + 40]);
  paint(P, { wash: col, ink: null });
}
// 夏日的小镇屋顶(第 8 章的飞行)
function summerTown(t, o = {}) {
  const base = o.base ?? H * .68, warm = o.warm ?? 1;
  boilSeed('townsky');
  band(-40, base * .55, mixCol('#9FD0E8', '#F3C489', warm * .4), 255);
  band(base * .40, base, mixCol('#C8E4EE', '#F0C79A', warm * .5), 255);
  boilSeed('townhouse');
  let x = -30, i = 0;
  while (x < W + 40) {
    const bw = W * (.10 + hash(i * 3.1) * .08), bh = H * (.10 + hash(i * 5.9) * .16);
    const col = mixCol(['#E8C9A0', '#D9B9A8', '#C9C0D6', '#EBD3B4'][i % 4], F.ink, .12);
    slab(x, base - bh, bw, bh + 30, col, 2);
    paint([[x - 4, base - bh], [x + bw * .5, base - bh - H * .05], [x + bw + 4, base - bh]], { wash: mixCol('#B4624F', F.ink, .15), ink: null });
    for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++)
      if (hash(i * 4.4 + r * 2.2 + c) > .35) slab(x + bw * (.18 + c * .42), base - bh + bh * (.22 + r * .34), bw * .24, bh * .22, '#F6E4B4', .8, 220);
    x += bw + W * .015; i++;
  }
  // 晾衣绳
  boilSeed('townline');
  for (let i = 0; i < 2; i++) {
    const y0 = base - H * (.24 + i * .07), x0 = W * (.05 + i * .45), x1 = x0 + W * .5;
    const P = []; for (let k = 0; k <= 6; k++) P.push([lerp(x0, x1, k / 6), y0 + Math.sin(k / 6 * Math.PI) * 16]);
    ln(P, 1, F.inkSoft, 'inkfine', 1);
    for (let k = 1; k < 5; k++) {
      const u = k / 5, px = lerp(x0, x1, u), py = y0 + Math.sin(u * Math.PI) * 16;
      paint([[px - 9, py], [px + 9, py], [px + 9, py + 26], [px - 9, py + 26]], { wash: [F.rose, F.cream2, '#9FD3C0', F.gold][k % 4], ink: null });
    }
  }
  // 一只风筝
  boilSeed('townkite');
  const kx = W * .78 + Math.sin(t * .5) * 30, ky = H * .16 + Math.cos(t * .7) * 14;
  paint([[kx, ky - 16], [kx + 13, ky], [kx, ky + 16], [kx - 13, ky]], { wash: F.rose, ink: null });
  ln([[kx, ky + 16], [kx - 10, ky + 44], [kx + 6, ky + 66]], .9, F.inkSoft, 'inkfine', 1);
}
// 海边的沙滩
function shoreAt(t, o = {}) {
  const hy = o.hy ?? H * .50, dusk = o.dusk ?? 0;
  boilSeed('shsky');
  band(-40, hy * .60, mixCol('#F6D9AE', '#6C7EA0', dusk * .6), 255);
  band(hy * .45, hy, mixCol('#F0C79A', '#8C93AE', dusk * .6), 255);
  if (dusk > .2) { paint(ellPts(W * .74, hy * .72, 46, 46, 18, 1), { wash: F.fwGold, ink: null }); glow(W * .74, hy * .72, 120, '#FFC978', .5); }
  boilSeed('shsea');
  band(hy, H * .82, mixCol(F.seaLt, F.seaDk, dusk * .4), 255);
  band(H * .74, H + 40, F.sea, 255);
  band(H * .80, H + 40, F.seaDk, 255);
  boilSeed('shwave');
  for (let i = 0; i < 7; i++) {
    const y = hy + 6 + i * (H * .30) / 7;
    const w = W * (.18 + hash(i * 4.4) * .26);
    const x = frac(hash(i * 2.2) + t * (.03 + i * .005)) * (W + 200) - 100;
    paint(ellPts(x, y, w, 2.2 + i * .3, 14, .6), { wash: mixCol(F.seaLt, F.cream2, .4), washOp: 130, ink: null });
  }
  // 湿沙 + 干沙
  band(H * .80, H * .87, mixCol(F.sand, F.seaDk, .25), 255);
  band(H * .85, H + 40, F.sand, 255);
  paint(ellPts(W * .5, H * .855, W * .62, H * .035, 22, 3), { wash: mixCol(F.sand, '#FFF', .35), washOp: 120, ink: null });
}

// ---------- 转场 ----------
function wipeIn(lt, dur = .7, cols) { const p = seg(lt, 0, dur * .5); if (p > 0 && p < 1) brushWipe(.5 + p, cols); }
function wipeOut(lt, D, dur = .7, cols) { const p = seg(lt, D - dur, D - dur * .5); if (p > 0 && p < 1) brushWipe(p, cols); }
function fadeIn(lt, dur = .6, col) { const p = seg(lt, 0, dur); if (p < 1) flash(1 - p, col || F.ink); }
function fadeOut(lt, D, dur = .8, col) { const p = seg(lt, D - dur, D); if (p > 0) flash(ease(p), col || F.ink); }
function irisIn(lt, dur = .7, cx = W * .5, cy = H * .5, col) { const p = seg(lt, 0, dur); if (p < 1) iris(cx, cy, (1 - p) * W * 1.3, col || F.ink); }
function irisOut(lt, D, dur = .8, cx = W * .5, cy = H * .5, col) { const p = seg(lt, D - dur, D); if (p > 0) iris(cx, cy, ease(p) * W * 1.3, col || F.ink); }
