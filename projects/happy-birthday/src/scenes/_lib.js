// _lib.js — the card's shared art vocabulary (loaded before the shots).
//
// One warm room, one candle-lit cake, one small family of Clawds. Same look rules as the kit's other
// films: flat gouache `wash` shapes for everything large, a thin ink line only where an edge has to read,
// and `glow()` for the one thing paint can't do — light. See tools/README-perf.md: in flat mode a wash
// costs ~0.6 ms, an ink line ~17 ms, so a whole acted frame stays around a second.
//
// Beats: the song is a waltz — 3/4 at 120 BPM, so BEAT = 0.5 s and BAR = 3 * BEAT = 1.5 s. The one thing
// this film does differently from 潮汐 (common time).

const BAR = 3 * BEAT;
const LINE = 2 * BAR;                     // one lyric line = two bars, as the tune is sung
const SC = {
  bar: n => n * BAR,
  lines: [
    'Happy Birthday to you', 'Happy Birthday to you', 'Happy Birthday dear Claude', 'Happy Birthday to you',
    '祝你生日快乐', '祝你生日快乐', '祝你生日快乐', '祝你生日快乐',
  ],
  shotAt: [0, 4, 8, 12, 16, 20],        // shot boundaries, in bars: one per lyric pair, plus the card
};
const lineT = i => SC.bar(4 + 2 * i);     // start time of lyric line i (0-based): a two-bar intro, then one per line
const SHOT = i => [SC.bar(SC.shotAt[i]), SC.bar(SC.shotAt[i + 1] || 24)];

// Two hand-painted faces for the words: the brush script carries the Chinese, the marker the English.
// (core.js loads window.EXTRA_FONTS before it flips window.ready, so every glyph below is ready to draw.)
const F_ZH = '"Ma Shan Zheng", "Kaiti SC", "STKaiti", serif';
const F_EN = '"Permanent Marker", "Comic Sans MS", cursive';
window.EXTRA_FONTS = [[`64px ${F_ZH}`, SC.lines.join('') + '生日快乐亲爱的一起许个愿吹蜡烛' + '克劳德'],
                      [`64px ${F_EN}`, SC.lines.join('') + 'Claude']];

// ---------- palette ----------
// One room at night, warm lamp + a cold window, and the cake: cream, sponge, jam, candlelight.
const F = {
  ink: '#3A3340', inkSoft: '#575066', cream: '#FFF5E2',
  wallTop: '#F6E7CA', wall: '#EED9B7', wallLow: '#E3C9A2', wallDeep: '#CFAE86',
  floor: '#C9A87C', floor2: '#BF9C6E', floorDk: '#A27E54',
  wood: '#B2835A', woodDk: '#87603D', woodLt: '#CB9F72',
  night: ['#1B2547', '#243059', '#3A4A7C'], moon: '#FFF3D8', star: '#FFF6DC',
  cake: '#FFF3DC', cakeDk: '#EDD6AE', sponge: '#E7C089', jam: '#C4566A',
  frost: '#F4AFBB', frostDk: '#DD8494', plate: '#DCE6E9', plateDk: '#B9C9D0',
  candle: '#EEC14A', candle2: '#E9A0A8', candle3: '#8FC0A9', wick: '#4A3B37',
  flame: '#FFC766', flameCore: '#FFF3D0', smoke: '#B5A9B0',
  gold: '#E8AA38', rose: '#E27A92', teal: '#3A9C98', violet: '#7B5CA8', sky: '#8EC3E6', sap: '#6E9F58',
  party: ['#E27A92', '#3A9C98', '#E8AA38', '#7B5CA8', '#6E9F58'],
};

// ---------- primitives ----------
function band(y0, y1, col, j = 6, op = 255) {
  const mid = (y0 + y1) / 2, ry = Math.max(2, (y1 - y0) / 2);
  paint(ellPts(W / 2, mid, W * .95, ry, 26, j), { wash: col, washOp: op, ink: null });
}
function slab(x, y, w, h, col, j = 4, op = 255) { paint(rectPts(x, y, w, h, j), { wash: col, washOp: op, ink: null }); }
function ln(pts, sw = 1.3, col = F.ink, br = 'ink', curv = .5) { inkLine(pts, sw, col, br, curv); }
function dotAt(x, y, r, col, op = 255) { paint(ellPts(x, y, r, r * .95, 8, .45), { wash: col, washOp: op, ink: null }); }
function wobLine(x0, x1, y, amp, ph, col, sw = 1.1, segs = 6, t = 0) {
  const p = []; for (let i = 0; i <= segs; i++) p.push([lerp(x0, x1, i / segs), y + Math.sin(i * .8 + ph + t) * amp]);
  ln(p, sw, col, 'inkfine', 1);
}
// A soft pool of lamplight / candlelight on the wall behind the cake. Flat wash, wide and faint.
function warmPool(x, y, r, k = 1, col = '#FFCE86') {
  if (k <= .02) return;
  paint(ellPts(x, y, r, r * .72, 24, r * .06), { wash: col, washOp: 46 * clamp(k), ink: null });
  paint(ellPts(x, y, r * .6, r * .45, 20, r * .05), { wash: col, washOp: 52 * clamp(k), ink: null });
}

// ---------- the room ----------
// Floor line at `fy` (default 74% down), wainscot, a rug, a hanging picture, and the window it all sits in.
function room(t, o = {}) {
  const fy = o.fy ?? H * .74;
  boilSeed('wall');
  band(-30, fy * .52, F.wallTop, 7);
  band(fy * .52 - 6, fy, F.wall, 7);
  band(fy - H * .13, fy, F.wallLow, 6);
  // wall shadow creeping up from the skirting + a cool pool under the window
  paint(ellPts(W * .5, fy, W * .62, H * .075, 22, 8), { wash: F.wallDeep, washOp: 70, ink: null });
  boilSeed('floor');
  band(fy, H + 30, F.floor, 6);
  band(fy, fy + H * .05, F.floor2, 4);
  slab(-30, fy - H * .042, W + 60, H * .042, F.wallDeep, 4);
  ln([[-30, fy - H * .042], [W + 30, fy - H * .042]], 1.4, F.inkSoft, 'inkfine');
  for (let i = 0; i < 4; i++) {                 // floorboards, receding
    const y = fy + (H - fy) * (.26 + i * .21) ** 1.32;
    ln([[-30, y + jit(2.5)], [W + 30, y + jit(2.5)]], .9, F.floorDk, 'inkfine', .15);
  }
  if (o.rug !== false) rugAt(t, o.rugX ?? W * .52, fy + H * .13, W * .30, H * .085);
  if (o.window !== false) windowAt(t, o.winX ?? W * .775, o.winY ?? H * .115, o.winW ?? W * .185, o.winH ?? H * .345);
  if (o.lamp !== false) lampAt(t, o.lampX ?? W * .295, o.lampY ?? H * .125, o.lampR ?? H * .085);
  if (o.shelf !== false) shelfAt(o.shelfX ?? W * .045, o.shelfY ?? H * .40, W * .165);
  if (o.picture !== false) pictureFrame(o.picX ?? W * .60, o.picY ?? H * .30, W * .085, H * .105);
}

// A paper lamp hanging over the room: a cord, a shade, a bulb, and the soft cone it throws on the wall.
function lampAt(t, x, y, r) {
  boilSeed('lamp');
  ln([[x, -30], [x, y - r * .52]], 1.2, F.inkSoft, 'inkfine', 0);
  paint([[x - r * 2.5, y + r * .2], [x + r * 2.5, y + r * .2], [x + r * .95, H * .80], [x - r * .95, H * .80]], { wash: '#FFDFA8', washOp: 26, ink: null });
  const sw = Math.sin(t * .8) * 1.6;
  paint([[x - r * .92 + sw, y], [x - r * .34 + sw * .4, y - r * .62], [x + r * .34 + sw * .4, y - r * .62], [x + r * .92 + sw, y],
         [x + r * .74 + sw, y + r * .16], [x - r * .74 + sw, y + r * .16]], { wash: F.rose, ink: null });
  paint([[x - r * .34 + sw * .4, y - r * .58], [x + r * .34 + sw * .4, y - r * .58], [x + r * .28 + sw * .4, y - r * .40], [x - r * .28 + sw * .4, y - r * .40]], { wash: F.frostDk, washOp: 120, ink: null });
  paint(ellPts(x + sw, y + r * .34, r * .30, r * .24, 12, 1), { wash: F.flameCore, ink: null });
  glow(x + sw, y + r * .34, r * 3.2, '#FFD9A0', .5);
}

// A shelf with the evening's clutter: two books and a jar.
function shelfAt(x, y, w) {
  boilSeed('shelf');
  paint(rectPts(x, y, w, H * .018, 3), { wash: F.wood, ink: null });
  slab(x + w * .12, y + H * .015, w * .05, H * .045, F.woodDk, 2);
  slab(x + w * .72, y + H * .015, w * .05, H * .045, F.woodDk, 2);
  paint([[x + w * .10, y - H * .085], [x + w * .29, y - H * .078], [x + w * .29, y], [x + w * .10, y]], { wash: F.teal, ink: null });
  paint([[x + w * .33, y - H * .062], [x + w * .51, y - H * .068], [x + w * .51, y], [x + w * .33, y]], { wash: F.gold, ink: null });
  paint(ellPts(x + w * .72, y - H * .042, w * .085, H * .042, 14, 1), { wash: F.rose, ink: null });
  paint(rectPts(x + w * .70, y - H * .062, w * .045, H * .025, 1), { wash: F.rose, ink: null });
}

// The night outside, framed in wood, with a moth-hour of stars and the moon in the top corner.
function windowAt(t, x, y, w, h, o = {}) {
  boilSeed('winframe');
  slab(x - w * .055, y - h * .045, w * 1.11, h * 1.09, F.wood, 4);                 // frame
  slab(x - w * .055, y + h * 1.04, w * 1.16, h * .075, F.woodDk, 3);              // sill
  boilSeed('winsky');
  paint(rectPts(x, y, w, h, 3), { wash: F.night[1], washOp: 255, ink: null });
  slab(x, y, w, h * .44, F.night[0], 5);
  slab(x, y + h * .70, w, h * .30, F.night[2], 5);
  boilSeed('winstars');
  for (let i = 0; i < 7; i++) {
    const sx = x + w * (.10 + hash(i * 3.1) * .80), sy = y + h * (.08 + hash(i * 7.7) * .55);
    const tw = .45 + .55 * Math.abs(Math.sin(t * .7 + i * 1.7));
    paint(starPts(sx, sy, 2.6 + tw * 1.4, .34, 4), { wash: F.star, washOp: 150 + 90 * tw, ink: null });
  }
  boilSeed('winmoon');
  paint(ellPts(x + w * .70, y + h * .255, w * .105, w * .105, 20, 1.2), { wash: F.moon, washOp: 255, ink: null });
  paint(ellPts(x + w * .74, y + h * .225, w * .085, w * .085, 18, 1), { wash: F.night[0], washOp: 150, ink: null });
  glow(x + w * .70, y + h * .255, w * .34, '#FFF0C8', .5);
  ln([[x + w * .5, y], [x + w * .5, y + h]], 1.1, F.woodDk, 'inkfine', 0);        // mullions
  ln([[x, y + h * .5], [x + w, y + h * .5]], 1.1, F.woodDk, 'inkfine', 0);
  boilSeed('curtain');
  for (const [cx, dir] of [[x - w * .03, -1], [x + w * 1.03, 1]]) {               // two drawn-back curtains
    paint(through([[cx, y - h * .07], [cx + dir * w * .15, y + h * .3], [cx + dir * w * .07, y + h * .72], [cx + dir * w * .19, y + h * 1.09]], 5).concat(
      through([[cx + dir * w * .19, y + h * 1.09], [cx + dir * w * .30, y + h * .6], [cx + dir * w * .26, y - h * .07]], 5).reverse()),
      { wash: '#C98A72', washOp: 240, ink: null });
    ln([[cx, y - h * .07], [cx + dir * w * .13, y + h * .34], [cx + dir * w * .06, y + h * 1.06]], 1.1, F.woodDk, 'inkfine', .8);
  }
}

// A small framed picture on the wall: a wave and a sun, the way a child paints the sea. (It is the other film.)
function pictureFrame(x, y, w, h) {
  boilSeed('pic');
  slab(x - 3, y - 3, w + 6, h + 6, F.woodDk, 3);
  slab(x, y, w, h, '#F4E6CB', 3);
  paint(ellPts(x + w * .70, y + h * .30, w * .10, w * .10, 16, 1), { wash: F.gold, ink: null });
  paint([[x + 2, y + h * .62], [x + w * .32, y + h * .50], [x + w * .58, y + h * .64], [x + w - 2, y + h * .54],
         [x + w - 2, y + h - 2], [x + 2, y + h - 2]], { wash: F.sky, ink: null });
  ln([[x + 2, y + h * .62], [x + w * .32, y + h * .50], [x + w * .58, y + h * .64], [x + w - 2, y + h * .54]], 1.2, '#3F6C86', 'inkfine', .9);
}

// A woven rug, drawn from above: one oval, three rings of braid, a fringe at both ends.
function rugAt(t, x, y, rx, ry) {
  boilSeed('rug');
  paint(ellPts(x, y, rx, ry, 30, 3), { wash: '#B9705E', washOp: 235, ink: null });
  paint(ellPts(x, y, rx * .74, ry * .74, 26, 3), { wash: '#D08D6E', washOp: 220, ink: null });
  paint(ellPts(x, y, rx * .44, ry * .46, 22, 2), { wash: '#C9A87C', washOp: 220, ink: null });
  for (let i = 0; i < 9; i++) {
    const a = i / 9 * TAU + .2;
    ln([[x + Math.cos(a) * rx * .97, y + Math.sin(a) * ry * .97], [x + Math.cos(a) * rx * 1.13, y + Math.sin(a) * ry * 1.16]], 1, F.floorDk, 'inkfine', .3);
  }
}

// ---------- the table and the cake ----------
// A wooden table, front-on: a top with a lit far edge and a dark lip, an apron, and two legs long
// enough to reach past the bottom of the frame when it stands in front. (x, y) is the front edge of the
// tabletop. Returns the height of the surface, so props can be put on it.
function tableAt(x, y, w, o = {}) {
  boilSeed('table');
  const th = Math.max(16, w * .10), h = o.h ?? th * 4.2;
  paint(ellPts(x, y - th * .70, w * .50, th * .34, 18, 3), { wash: F.woodLt, ink: null });   // far edge catching the light
  slab(x - w / 2, y - th * .55, w, th, F.wood, 4);                                           // top
  slab(x - w / 2 - 2, y + th * .30, w + 4, th * .34, F.woodDk, 3);                           // front lip
  slab(x - w * .455, y + th * .70, w * .91, th * .95, F.woodDk, 3);                          // apron (in shadow)
  for (const lx of [x - w * .40, x + w * .40]) slab(lx - w * .045, y + th * 1.60, w * .09, h, F.wood, 3);
  for (const lx of [x - w * .40, x + w * .40]) ln([[lx - w * .045, y + th * 1.6], [lx - w * .045, y + th * 1.6 + h]], 1, F.woodDk, 'inkfine', 0);
  ln([[x - w / 2, y - th * .55], [x + w / 2, y - th * .55]], 1.1, F.woodDk, 'inkfine', 0);
  wobLine(x - w / 2, x + w / 2, y + th * .30, 1.1, 0, F.woodDk, 1, 4);
  return y - th * .55;
}

// The cake: plate, sponge, jam line, a fat frosting with drips, and `n` candles.
// `lit` is how many candles are burning (fractional = the one being lit), `s` the cake's half-width in px.
function cakeAt(t, x, y, s, lit = 0, o = {}) {
  const n = o.candles ?? 3, hgt = s * .70;
  boilSeed('cake');
  paint(ellPts(x, y + s * .50, s * 1.34, s * .22, 24, 2.4), { wash: F.plate, ink: null });          // plate
  paint(ellPts(x, y + s * .44, s * 1.10, s * .16, 22, 2), { wash: F.plateDk, washOp: 150, ink: null });
  slab(x - s, y - s * .30, s * 2, s * .74, F.sponge, 2.5);                                         // sponge
  paint(rectPts(x - s, y - s * .06, s * 2, s * .17, 1.4), { wash: F.jam, washOp: 245, ink: null });   // jam line
  slab(x - s * 1.02, y - s * .02, s * 2.04, s * .13, F.cakeDk, 1.4);                               // crumb edge
  // frosting: a slab with a dripping bottom edge, drawn as one polygon
  const dr = o.drips ?? 7, top = y - hgt * .30, bot = y - s * .02 + s * .06;
  const P = [[x - s * 1.03, top], [x + s * 1.03, top], [x + s * 1.03, bot - s * .02]];
  for (let i = dr; i >= 0; i--) { const u = i / dr, dx = lerp(x + s * 1.03, x - s * 1.03, u); P.push([dx, bot + s * (.06 + .16 * hash(i * 4.3 + (o.seed || 0)))]); }
  paint(P, { wash: F.frost, ink: null });
  paint(rectPts(x - s * 1.03, top, s * 2.06, s * .16, 1.5), { wash: F.frostDk, washOp: 170, ink: null });
  wobLine(x - s * 1.03, x + s * 1.03, top + s * .10, 1.4, 1.2, F.frostDk, 1, 5);
  // candles, in a row across the frosting
  for (let i = 0; i < n; i++) {
    const cx = x + (n === 1 ? 0 : (i / (n - 1) - .5) * s * 1.24), cy = top - s * .04;
    candleAt(t, cx, cy, s * .16, clamp(lit - i, 0, 1), F.party[i % F.party.length], i);
  }
}

// One candle: a striped stick, a wick, and — while `k` is above 0 — a flame with its halo.
function candleAt(t, x, y, s, k, col, i = 0) {
  boilSeed('candle' + i);
  const top = y - s * 3.1;
  paint(rectPts(x - s * .30, top, s * .60, s * 3.1, 1), { wash: col, ink: null });
  for (let j = 0; j < 3; j++) paint(rectPts(x - s * .30, top + s * (.4 + j * .95), s * .60, s * .30, .6), { wash: F.cream, washOp: 200, ink: null });
  ln([[x - s * .30, top], [x - s * .30, top + s * 3.1]], .9, F.inkSoft, 'inkfine', 0);
  ln([[x + s * .30, top], [x + s * .30, top + s * 3.1]], .9, F.inkSoft, 'inkfine', 0);
  ln([[x - s * .30, top], [x + s * .30, top]], .9, F.inkSoft, 'inkfine', 0);
  if (k <= .02) { ln([[x, top], [x + s * .12, top - s * .34]], .9, F.wick, 'inkfine', 0); return; }
  const fl = .55 + .45 * Math.abs(Math.sin(t * 5.5 + i * 2.1)) * k;      // the flame dances, always, but grows as it lights
  const fy = top - s * .45, fh = s * (1.25 + .35 * fl) * (0.35 + .65 * k);
  paint([[x - s * .34, fy + s * .10], [x - s * .16, fy - fh * .55], [x, fy - fh], [x + s * .16, fy - fh * .55], [x + s * .34, fy + s * .10], [x, fy + s * .26]],
        { wash: F.flame, washOp: 255 * clamp(k), ink: null });
  paint(ellPts(x, fy - fh * .28, s * .13, s * .30, 10, .3), { wash: F.flameCore, washOp: 240 * clamp(k), ink: null });
  glow(x, fy - fh * .3, s * 6.2, '#FFC871', .55 * clamp(k));
}

// A curl of smoke: what a candle leaves behind. Three rising ribbons that fade as they climb.
function smokeAt(t, x, y, age, s = 8) {
  if (age < 0 || age > 2.6) return;
  const k = 1 - age / 2.6;
  boilSeed('smoke');
  for (let i = 0; i < 3; i++) {
    const a = age - i * .22; if (a < 0) continue;
    const P = []; for (let j = 0; j <= 6; j++) { const u = j / 6; P.push([x + Math.sin(u * 3.4 + i * 1.3 + a * 2.6) * s * .9 * u + i * s * .5, y - a * s * 3 - u * s * 2.4]); }
    ln(P, 1.6, F.smoke, 'inkfine', 1);
  }
}

// ---------- dressing ----------
// Bunting: one string sagging across the room, triangles hung from it, breathing with the beat.
function bunting(t, o = {}) {
  const y0 = o.y ?? H * .07, n = o.n ?? 10, sag = o.sag ?? H * .075, x0 = o.x0 ?? -20, x1 = o.x1 ?? W + 20;
  const dy = u => Math.sin(u * Math.PI) * sag;
  boilSeed('bunting');
  const line = []; for (let i = 0; i <= 10; i++) line.push([lerp(x0, x1, i / 10), y0 + dy(i / 10)]);
  ln(line, 1.2, F.inkSoft, 'inkfine', .9);
  for (let i = 0; i < n; i++) {
    const u = (i + .5) / n, x = lerp(x0, x1, u), y = y0 + dy(u), sw = Math.sin(t * .9 + i * .8) * 2.5;
    const col = F.party[i % F.party.length];
    paint([[x - 11, y + 1], [x + 11, y + 1], [x + sw * .3, y + 26 + sw * .2]], { wash: col, ink: null });
    ln([[x - 11, y + 1], [x + 11, y + 1], [x + sw * .3, y + 26 + sw * .2], [x - 11, y + 1]], .9, F.inkSoft, 'inkfine', 0);
  }
}

// A balloon on its string, bobbing on the beat. Returns its centre so a hand can hold it.
function balloonAt(t, x, y, s, col, ph = 0) {
  const bx = x + Math.sin(t * 1.1 + ph) * s * .22, by = y + Math.sin(t * 1.5 + ph * 1.7) * s * .18;
  boilSeed('balloon' + Math.round(ph * 10));
  ln([[bx, by + s * 1.06], [bx + Math.sin(t * 1.3 + ph) * s * .3, by + s * 2.1]], 1, F.inkSoft, 'inkfine', 1.2);
  paint(ellPts(bx, by, s, s * 1.15, 22, 1.4), { wash: col, ink: null });
  paint([[bx - s * .18, by + s * 1.02], [bx, by + s * 1.24], [bx + s * .18, by + s * 1.02]], { wash: col, ink: null });   // knot
  paint(ellPts(bx - s * .34, by - s * .38, s * .22, s * .30, 12, .6), { wash: F.cream, washOp: 150, ink: null });
  ln(through([[bx - s * .62, by + s * .1], [bx - s, by - s * .5], [bx - s * .3, by - s * .98], [bx + s * .5, by - s * .85], [bx + s, by - s * .2], [bx + s * .55, by + s * .6], [bx, by + s * 1.06], [bx - s * .55, by + s * .55], [bx - s * .62, by + s * .1]], 4), 1.2, F.inkSoft, 'inkfine', .6);
  return [bx, by];
}

// Confetti: a handful of painted scraps falling and turning, one per seed, in time with the music.
function confettiT(t, n = 26, o = {}) {
  const y0 = o.y0 ?? -40, y1 = o.y1 ?? H + 40, sc = o.s ?? 1;
  boilSeed('confetti');
  for (let i = 0; i < n; i++) {
    const r1 = hash(i * 1.7), r2 = hash(i * 3.9 + 4), sp = 46 + r2 * 40;
    const y = y0 + frac(r1 + t * sp / (y1 - y0)) * (y1 - y0), x = (r2 * W * 1.1 - W * .05) + Math.sin(t * .8 + i) * 12 * sc;
    const rot = t * (2 + r1 * 3) + i, k = .55 + .45 * Math.abs(Math.sin(rot));
    paint(rotPts(x, y, 7 * sc, 4 * sc, rot), { wash: F.party[i % F.party.length], washOp: 235, ink: null });
  }
}
function rotPts(cx, cy, w, h, a) {
  const c = Math.cos(a), s = Math.sin(a);
  return [[-w, -h], [w, -h], [w, h], [-w, h]].map(([x, y]) => [cx + x * c - y * s, cy + x * s + y * c]);
}

// A painted music note: an oval head, a stem, a flag. Notes carry the singing when nobody's mouth can.
function noteAt(t, x, y, s, rot, col, op = 255) {
  if (op < 6) return;
  push(); translate(x, y); rotate(rot);
  paint(ellPts(0, 0, s * .62, s * .46, 12, .6, -.35), { wash: col, washOp: op, ink: null });
  paint(rectPts(s * .46, -s * 3.1, s * .20, s * 3.2, .5), { wash: col, washOp: op, ink: null });
  paint([[s * .66, -s * 3.1], [s * 1.5, -s * 2.35], [s * 1.5, -s * 1.6], [s * .66, -s * 2.3]], { wash: col, washOp: op, ink: null });
  paint(ellPts(-s * .2, -s * .12, s * .22, s * .14, 8, .4, -.35), { wash: F.cream, washOp: op * .7, ink: null });
  pop();
}

// A four-point sparkle, growing and fading. The cheapest way to say "this is a nice moment".
function sparkle(t, x, y, r, age, life = 1.1) {
  if (age < 0 || age > life) return;
  const k = Math.sin(clamp(age / life) * Math.PI);
  paint(starPts(x, y, r * k, .26, 4), { wash: F.cream, washOp: 255 * k, ink: null });
  paint(starPts(x, y, r * k * .5, .3, 4, -.3), { wash: F.gold, washOp: 220 * k, ink: null });
}

// ---------- the words ----------
// A lyric line, sung: a torn cream band painted across the room, the gold brush underline growing from its
// middle, the words themselves dropped in on the 2D compositor (so they stay crisp over the grain).
// Returns the geometry so a shot can hang something off the band (a heart, a sparkle, a candle).
function lyricLine(txt, t, t0, t1, o = {}) {
  const inK = seg(t, t0, t0 + .30), outK = seg(t, t1 - .26, t1);
  const a = clamp(ease(inK) * (1 - ease(outK))); if (a <= .01) return null;
  const zh = /[\u4e00-\u9fff]/.test(txt), size = o.size ?? (zh ? 52 : 42);
  const x = o.x ?? W / 2, y = o.y ?? H * .885;
  const w = Math.min(W * .94, size * (zh ? 1.06 : .60) * [...txt].length + size * 1.2);
  const font = `${size}px ${zh ? F_ZH : F_EN}`, rot = -.012 + .012 * Math.sin((t - t0) * 2.2);
  const pop = inK * 1.6;   // letter() runs backOut() itself, so feed it the raw ramp
  // the gold brush underline, growing from the middle as the words come in
  const uw = w * .80 * ease(inK) * (1 - outK * .85);
  if (uw > 8) {
    boilSeed('ul' + Math.round(t0 * 10));
    paint([[x - uw / 2, y + size * .70], [x - uw * .14, y + size * .82], [x + uw * .20, y + size * .68], [x + uw / 2, y + size * .84]],
          { wash: F.gold, washOp: 235, ink: null });
  }
  // the words: a fat cream halo (four offsets + the stroke) so they sit on whatever they cross, then the ink face
  for (const [dx, dy] of [[-.055, 0], [.055, 0], [0, -.06], [0, .06]])
    letter(txt, x + dx * size, y + dy * size, size, F.cream, { font, pop, alpha: a * .92, rot, ink: false, stroke: F.cream });
  letter(txt, x, y, size, o.col ?? F.ink, { font, pop, alpha: a, rot, ink: false, stroke: F.cream });
  return { x, y, size, w, a, inK };
}

// ---------- transitions (same vocabulary as the kit's other film) ----------
function wipeIn(lt, dur = .7, cols) { const p = seg(lt, 0, dur * .5); if (p > 0 && p < 1) brushWipe(.5 + p, cols); }
function wipeOut(lt, D, dur = .7, cols) { const p = seg(lt, D - dur, D - dur * .5); if (p > 0 && p < 1) brushWipe(p, cols); }
function fadeIn(lt, dur = .6, col) { const p = seg(lt, 0, dur); if (p < 1) flash(1 - p, col || F.ink); }
function fadeOut(lt, D, dur = .8, col) { const p = seg(lt, D - dur, D); if (p > 0) flash(ease(p), col || F.ink); }
function irisIn(lt, dur = .7, cx = W * .5, cy = H * .5, col) { const p = seg(lt, 0, dur); if (p < 1) iris(cx, cy, (1 - p) * W * 1.3, col || F.ink); }
function irisOut(lt, D, dur = .8, cx = W * .5, cy = H * .5, col) { const p = seg(lt, D - dur, D); if (p > 0) iris(cx, cy, ease(p) * W * 1.3, col || F.ink); }
