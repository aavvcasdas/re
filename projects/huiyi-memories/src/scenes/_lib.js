// _lib.js — 《把回忆拼好给你》: the film's shared art vocabulary (loaded before the shots).
//
// ONE idea: a small terracotta figure alone at a night desk with a box of torn memory-fragments.
// As the song builds, the fragments rise, piece themselves together, and the picture they make
// swallows the room — the summer sea, the fireworks — before it comes back to the desk as one
// finished sheet, which he folds into a paper plane and sends out of the window into the dawn.
// The last fragment goes into the empty frame on his own wall: 爱炙热的你，却忘了爱自己.
//
// Rules this file lives by (see ANIMATION_GUIDE.md and tools/README-perf.md):
//   * backgrounds are flat `wash` bands — one watercolour `fill` costs +3.2 s a frame, so there are none
//   * linework is thin and few (~17 ms a stroke): the horizon, foam, the tear edges, hair, stitches
//   * light is `glow()` and nothing else — pigment-mixing would turn lamp-gold over indigo green
//   * 你 (the friend) is pale blue and only ever exists INSIDE a memory. Never in the room. Never now.
//
// The grid, measured off the audio (94.82 BPM, first downbeat 0.415 s into the clip):
//   BEAT = 0.632777 s   BAR = 4 * BEAT = 2.531109 s   bar k starts at 0.415 + k * BAR
//   bar 7  = 18.133 s  the drums and bass drop (verified: the onset is 18.135)
//   bar 13 = 33.320 s  the chorus; bar 18 = 45.976 the fireworks phrase; bar 31 = 78.881 the end.

const BAR = 4 * BEAT;
const B = n => OFF + n * BEAT;          // time of beat n
const BARt = k => OFF + k * BAR;        // time of the downbeat of bar k
// shot boundaries, in bars: twelve shots, every cut on a bar line
const CUT = [0, 2, 4, 7, 9, 13, 15, 17, 19, 21, 23, 26, 29, 31];
const shotT = i => (i === 0 ? 0 : BARt(CUT[i]));
const SHOT = i => [shotT(i), shotT(i + 1)];
const SHOT_D = i => shotT(i + 1) - shotT(i);

// ---------- palette: one world, one arc (cold night → summer memory → festival night → dawn) ----------
const SC = {
  ink: '#2B2233', inkSoft: '#575066', cream: '#FFF5E2', paper: '#F3EBDC',
  // the room at night
  wallHi: '#3C4474', wall: '#333B66', wallLo: '#2B3259', wallDeep: '#20263F',
  floor: '#282E56', floorLo: '#212748', skirting: '#1A1F3A',
  wood: '#6E5B74', woodDk: '#4B3E5C', woodLt: '#8D7791',
  lamp: '#FFC871', lampPool: '#FFD9A0', lampShade: '#CE7F6C',
  // paper and its torn edges
  frag: '#F4E9D2', fragLt: '#FFFAEE', fragDk: '#D9C6A2', fragBack: '#C9B694',
  // the memory: a summer sea
  skyHi: '#79B2DC', skyLo: '#D3E7F2', seaDk: '#2A6790', sea: '#4B98B6', seaLt: '#96CCD9',
  foam: '#F5FBFA', sand: '#EAD4A5', sandDk: '#D2B37B', sun: '#FFDD93',
  // the festival night
  niteHi: '#161B3C', niteLo: '#2C3060', rose: '#E27A92', gold: '#E8AA38', teal: '#3A9C98', violet: '#7B5CA8',
  // the dawn
  dawnHi: '#4C5A9C', dawnMid: '#DC9287', dawnLo: '#FFD6A2',
  // 你 — pale, cool, only ever inside a fragment
  you: '#A3C5DF', youDk: '#6C8FB2', youLt: '#CFE1F0',
  grey: '#8D92A8', greyDk: '#666B82', rain: '#BCC8DC', cloud: '#A7AEC2', cloudDk: '#7E859B',
};
const PARTY = [SC.rose, SC.gold, SC.teal, SC.violet, '#F2A25C'];

// ---------- primitives ----------
function band(y0, y1, col, j = 5, op = 255) {
  const mid = (y0 + y1) / 2, ry = Math.max(2, (y1 - y0) / 2 + j);
  paint(ellPts(W / 2, mid, W * 1.05, ry, 24, j), { wash: col, washOp: op, ink: null });
}
function slab(x, y, w, h, col, j = 3, op = 255) { paint(rectPts(x, y, w, h, j), { wash: col, washOp: op, ink: null }); }
function ln(pts, sw = 1.1, col = SC.ink, br = 'inkfine', curv = .5) { inkLine(pts, sw, col, br, curv); }
function dotAt(x, y, r, col, op = 255) { paint(ellPts(x, y, r, r * .95, 10, .4), { wash: col, washOp: op, ink: null }); }
// A pale veil laid across the seam of two bands: hides the edge and reads as atmosphere.
function veil(y, h, col, op = 46) { slab(-40, y - h / 2, W + 80, h, col, 3, op); }
// A soft pool of light on a wall or a floor (flat, wide, faint) — glow() is for the source only.
function pool(x, y, rx, ry, col, op = 44) {
  paint(ellPts(x, y, rx, ry, 22, rx * .04), { wash: col, washOp: op, ink: null });
  paint(ellPts(x, y, rx * .58, ry * .6, 18, rx * .03), { wash: col, washOp: op * 1.1, ink: null });
}
function wobLine(x0, x1, y, amp, ph, col, sw = 1, segs = 7, t = 0, br = 'inkfine') {
  const p = []; for (let i = 0; i <= segs; i++) p.push([lerp(x0, x1, i / segs), y + Math.sin(i * .85 + ph + t) * amp]);
  ln(p, sw, col, br, 1);
}
// A stitch: the dashed thread that holds two fragments together. Cheap (short strokes) and it is the motif.
function stitch(P, col = SC.inkSoft, sw = 1.1, dash = 7, gap = 6) {
  for (let i = 0; i + 1 < P.length; i++) {
    const [x0, y0] = P[i], [x1, y1] = P[i + 1], L = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.floor(L / (dash + gap)));
    for (let k = 0; k < n; k++) {
      const a = (k * (dash + gap)) / L, b = Math.min(1, a + dash / L);
      ln([[lerp(x0, x1, a), lerp(y0, y1, a)], [lerp(x0, x1, b), lerp(y0, y1, b)]], sw, col, 'inkfine', 0);
    }
  }
}

// ---------- the room (ch.1, ch.5) ----------
// World space, and the composition the whole film is built on: the cold moon-window on the LEFT,
// the warm floor-lamp on the RIGHT, and him between them on the rug — 时差 in one frame. The wall
// meets the floor at y=330; he sits on a cushion at (600, 440) at u=30 (a bit under half the frame
// high, which is what "the lead character is big" asks for); the shoebox is at (420, 452) and the
// empty frame hangs at 392..504 × 82..172. Every shot of the room uses these numbers.
const ROOM = { fy: 330, winX: 92, winY: 55, winW: 240, winH: 200, picX: 392, picY: 82, picW: 112, picH: 90,
               lampX: 776, lampY: 472, meX: 600, meY: 440, boxX: 366, boxY: 430, rugX: 560, rugY: 462 };

// sky: [[top, mid, bottom], starK, sunK] — night, grey memory, or dawn. `o.dawn` 0..1 cross-fades night → dawn.
function roomSky(o = {}) {
  const d = clamp(o.dawn ?? 0);
  const top = mixCol(SC.niteHi, SC.dawnHi, d), mid = mixCol(SC.wall, SC.dawnMid, d * .9), low = mixCol(SC.wallLo, SC.dawnLo, d * .85);
  return { top, mid, low, d };
}
function room(t, o = {}) {
  const fy = o.fy ?? ROOM.fy, S = roomSky(o), d = S.d;
  boilSeed('wall');
  band(-120, fy * .52, S.top, 6);
  band(fy * .50 - 8, fy * .92, S.mid, 6);
  band(fy * .84, fy + 8, S.low, 5);
  // the lamp's warm pool on the wall, and the cold one from the window; both fade as dawn comes in
  const lk = (o.lampK ?? 1) * (1 - d * .55), lx = (o.lampX ?? ROOM.lampX) - 26;
  if (lk > .02) pool(lx, o.poolY ?? 290, 310, 240, SC.lampPool, 42 * clamp(lk));
  pool((o.winX ?? ROOM.winX) + (o.winW ?? ROOM.winW) / 2, (o.winY ?? ROOM.winY) + 110, 280, 250, mixCol('#7E9BD8', SC.dawnLo, d), 30);
  boilSeed('floor');
  band(fy - 4, H + 140, mixCol(SC.floor, '#4A4470', d * .5), 5);
  band(fy + (H - fy) * .55, H + 140, mixCol(SC.floorLo, '#3A3459', d * .5), 4);
  slab(-40, fy - 12, W + 80, 13, mixCol(SC.skirting, '#3B3457', d * .5), 2);
  for (let i = 0; i < 3; i++) {                 // floorboards, receding
    const y = fy + (H + 60 - fy) * (.34 + i * .26) ** 1.25;
    ln([[-40, y], [W + 40, y]], .8, mixCol(SC.floorLo, '#3A3459', d * .5), 'inkfine', .1);
  }
  // the rug he lives on: two flat ellipses, one inside the other, so the room has a floor at all
  boilSeed('rug');
  paint(ellPts(ROOM.rugX, ROOM.rugY + 22, 372, 52, 30, 4), { wash: mixCol('#4E4166', '#6E5168', d * .6), ink: null });
  paint(ellPts(ROOM.rugX, ROOM.rugY + 22, 344, 42, 28, 4), { wash: mixCol('#5F4E7A', '#805E72', d * .6), ink: null });
  paint(ellPts(ROOM.rugX, ROOM.rugY + 22, 250, 30, 24, 3), { wash: mixCol('#554670', '#74566C', d * .6), ink: null });
  if (o.window !== false) windowAt(t, o.winX ?? ROOM.winX, o.winY ?? ROOM.winY, o.winW ?? ROOM.winW, o.winH ?? ROOM.winH, { dawn: d, stars: o.stars });
  if (o.frame !== false) frameAt(o.picX ?? ROOM.picX, o.picY ?? ROOM.picY, o.picW ?? ROOM.picW, o.picH ?? ROOM.picH, o.frameK ?? 0, t);
}

// The window: what the room is looking at. night → dawn is the film's colour arc in one rectangle.
// Layering: the frame board first, then the sky INSIDE it, then the mullions and sill back over the
// sky, so nothing of the sky can show outside the opening.
function windowAt(t, x, y, w, h, o = {}) {
  const d = clamp(o.dawn ?? 0);
  boilSeed('winframe');
  slab(x - w * .05, y - h * .05, w * 1.10, h * 1.10, SC.wood, 3);
  boilSeed('winsky');
  slab(x, y, w, h, mixCol('#252B52', SC.dawnHi, d), 3);
  slab(x, y + h * .42, w, h * .30, mixCol(SC.niteLo, SC.dawnMid, d), 3);
  slab(x, y + h * .70, w, h * .30, mixCol('#20264A', SC.dawnLo, d), 3);
  boilSeed('winstars');
  const sk = (1 - d) * (o.stars ?? 1);
  if (sk > .03) for (let i = 0; i < 10; i++) {
    const sx = x + w * (.08 + hash(i * 3.1) * .84), sy = y + h * (.06 + hash(i * 7.7) * .58);
    const tw = .4 + .6 * Math.abs(Math.sin(t * .8 + i * 1.7));
    paint(starPts(sx, sy, (2.4 + tw * 1.7) * sk, .34, 4), { wash: SC.cream, washOp: (120 + 120 * tw) * sk, ink: null });
  }
  // the moon, and the sun coming up behind it: the same sky, one handing over to the other
  const mx = x + w * .72, my = lerp(y + h * .26, y + h * .18, d);
  boilSeed('moon');
  paint(ellPts(mx, my, w * .10, w * .10, 18, 1), { wash: '#F2EEDF', washOp: 255 * (1 - d * .7), ink: null });
  paint(ellPts(mx + w * .04, my - w * .022, w * .088, w * .088, 16, 1), { wash: mixCol('#252B52', SC.dawnHi, d), washOp: 200, ink: null });
  if (sk > .03) glow(mx, my, w * .34, '#FFF0C8', .45 * sk);
  if (d > .03) {
    const sy = lerp(y + h * .98, y + h * .55, ease(d));
    boilSeed('dawnsun');
    paint(ellPts(x + w * .30, sy, w * .14 * d, w * .14 * d, 20, 1), { wash: SC.sun, washOp: 255 * d, ink: null });
    glow(x + w * .30, sy, w * .6, '#FFC98A', .8 * d);
  }
  boilSeed('mullions');
  ln([[x + w * .5, y], [x + w * .5, y + h]], 1.3, SC.woodDk, 'inkfine', 0);   // mullions
  ln([[x, y + h * .5], [x + w, y + h * .5]], 1.3, SC.woodDk, 'inkfine', 0);
  slab(x - w * .06, y + h, w * 1.12, h * .055, SC.woodDk, 2);                 // sill
  // curtains, drawn back, breathing a little
  boilSeed('curtain');
  for (const [cx, dir] of [[x - w * .02, -1], [x + w * 1.02, 1]]) {
    const sw = Math.sin(t * .7 + dir) * 2.4;
    paint(through([[cx, y - h * .06], [cx + dir * w * .13 + sw, y + h * .3], [cx + dir * w * .06 + sw, y + h * .74], [cx + dir * w * .16 + sw, y + h * 1.06]], 5).concat(
      through([[cx + dir * w * .16 + sw, y + h * 1.06], [cx + dir * w * .28 + sw, y + h * .6], [cx + dir * w * .24, y - h * .06]], 5).reverse()),
      { wash: mixCol('#6E5670', '#B07E76', d * .6), ink: null });
  }
}

// The frame on the wall: empty and faded at the start, holding one small finished picture at the end.
// k = 0 blank, 1 filled.
function frameAt(x, y, w, h, k, t) {
  boilSeed('frame');
  slab(x - 3, y - 1, w + 12, h + 12, '#141830', 2);                                     // its shadow on the wall
  slab(x - 6, y - 6, w + 12, h + 12, SC.woodDk, 2);
  slab(x, y, w, h, '#E6D9BE', 2);
  if (k <= .02) {                        // a photo that has gone pale: two ghosts on a beach
    slab(x + 5, y + 5, w - 10, h - 10, '#D9CCB0', 2);
    paint(ellPts(x + w * .5, y + h * .62, w * .16, h * .16, 14, 1.4), { wash: '#D8CBB2', washOp: 190, ink: null });
    paint(ellPts(x + w * .66, y + h * .66, w * .12, h * .12, 12, 1.2), { wash: '#D3C6AC', washOp: 170, ink: null });
    ln([[x - 6, y - 6], [x + w + 6, y - 6]], 1.1, SC.inkSoft, 'inkfine', 0);
    return;
  }
  const kk = ease(k);
  slab(x + 5, y + 5, w - 10, (h - 10) * kk, mixCol(SC.skyHi, SC.dawnHi, .3), 2);
  if (kk > .35) {
    slab(x + 5, y + 5 + (h - 10) * .58 * kk, w - 10, (h - 10) * .42 * kk, mixCol(SC.seaLt, SC.sand, .4), 2);
    const s = Math.min(w, h) * .12 * kk;
    dotAt(x + w * .44, y + h * .62, s, SC.you, 255 * kk);
    dotAt(x + w * .60, y + h * .64, s * .92, PAL.clay, 255 * kk);
    paint(starPts(x + w * .78, y + h * .26, s * .5 * kk, .3, 4), { wash: SC.gold, washOp: 240 * kk, ink: null });
  }
}

// ---------- the furniture (drawn AFTER the character where it stands in front of him) ----------
function floorLampAt(t, x, y, k = 1) {
  boilSeed('floorlamp');
  const top = y - 236, sw = Math.sin(t * .6) * 1.6;
  paint(ellPts(x, y - 2, 36, 10, 16, 2), { wash: SC.woodDk, ink: null });                // the base
  ln([[x, y - 6], [x + sw * .4, top + 34]], 4.2, SC.woodLt, 'inkfine', .12);            // the pole
  paint([[x - 50 + sw, top], [x + 50 + sw, top], [x + 34 + sw, top + 42], [x - 34 + sw, top + 42]],
        { wash: SC.lampShade, ink: SC.inkSoft, sw: .9 });                               // the shade
  paint(ellPts(x + sw, top + 42, 32, 9, 16, 1.5), { wash: SC.cream, washOp: 240 * clamp(k), ink: null });
  if (k > .02) {
    paint([[x - 36 + sw, top + 38], [x + 36 + sw, top + 38], [x + 215, y + 46], [x - 215, y + 46]],
          { wash: SC.lampPool, washOp: 40 * clamp(k), ink: null });                     // the cone on the floor
    glow(x + sw, top + 48, 200 * (.7 + .3 * clamp(k)), SC.lamp, .62 * clamp(k) * (.85 + .15 * pulse(t, 9)));
  }
}
function stoolAt(x, y, d = 0) {
  boilSeed('stool');
  slab(x - 34, y - 40, 68, 10, mixCol(SC.wood, '#7E6C82', .3), 2);
  ln([[x - 27, y - 31], [x - 34, y]], 1.6, SC.woodDk, 'inkfine', 0);
  ln([[x + 27, y - 31], [x + 34, y]], 1.6, SC.woodDk, 'inkfine', 0);
  ln([[x + 1, y - 31], [x + 5, y - 2]], 1.6, SC.woodDk, 'inkfine', 0);
  slab(x - 12, y - 64, 24, 24, mixCol(SC.teal, '#8FA9B4', .3), 2);                      // the cold mug
  paint(ellPts(x, y - 64, 12, 4, 12, .6), { wash: SC.ink, washOp: 120, ink: null });
}
// He sits on a cushion on the rug: the cushion goes under him, the folded legs in front of his hem.
function sitBase(x, y, u, d = 0) {
  boilSeed('cushion');
  paint(ellPts(x, y - u * .55, u * 3.6, u * 1.0, 20, 2), { wash: mixCol('#7A5670', '#96687C', d * .5), ink: SC.inkSoft, sw: .8 });
  paint(ellPts(x, y - u * .85, u * 3.0, u * .7, 18, 2), { wash: mixCol('#8E6A82', '#A87E90', d * .5), washOp: 230, ink: null });
}
function sitLegs(x, y, u, col) {
  boilSeed('foldlegs');
  paint(rrPts(x - u * 3.3, y - u * 2.15, u * 6.6, u * 1.75, u * .8, 2), { wash: col || PAL.clayDk, ink: SC.ink, sw: 1 });
}
// The floor in front of him: the box, its spilled scraps, the stool, the lamp. `lift`/`tremble` are the
// scraps refusing to stay down (S3) and the build before the drop.
function floorScene(t, o = {}) {
  const d = o.dawn ?? 0, lk = (o.lamp ?? 1) * (1 - d * .55);
  boxAt(t, ROOM.boxX, ROOM.boxY, o.boxS ?? 1.15, o.boxK ?? 1);
  if (o.scraps !== 0) floorScraps(t, { n: o.scraps ?? 10, x: ROOM.boxX - 26, y: ROOM.boxY + 10, spread: 290,
                                       lift: o.lift ?? 0, tremble: o.tremble ?? 0 });
  stoolAt(726, 468, d);
  if (o.lamp !== 0) floorLampAt(t, ROOM.lampX, ROOM.lampY, lk);
  return lk;
}
function floorScraps(t, o = {}) {
  const n = o.n ?? 10, x = o.x ?? ROOM.boxX - 20, y = o.y ?? ROOM.boxY + 8, spread = o.spread ?? 300;
  const lift = o.lift ?? 0, trem = o.tremble ?? 0;
  boilSeed('floorscraps');
  for (let i = 0; i < n; i++) {
    const a = hash(i * 5.7 + 1), px = x + a * spread + (i % 2 ? 20 : -10);
    const s = 8 + hash(i * 3.1) * 7;
    const tr = trem * Math.sin(t * 26 + i * 2.1) * 2.4;
    const py = y - hash(i * 8.3) * 14 - lift * (90 + hash(i * 2.9) * 140) * (.5 + hash(i * 6.1) * .7) + tr;
    const rot = hash(i * 4.4) * TAU + lift * Math.sin(t * 1.6 + i) * .6 + tr * .04;
    frag(t, px, py, s, rot, i + 60, { col: i % 4 === 0 ? '#DCD0B6' : '#CFC3AA', edge: i % 3 === 0, op: 235 });
  }
}

// The sand, for the beach shots: a warm band with a wet edge and a foam line that keeps the beat.
function beach(t, y, o = {}) {
  const d = o.dawn ?? 0, grey = o.grey ?? 0, nite = o.nite ?? 0;
  boilSeed('sand');
  band(y, H + 120, mixCol(mixCol(SC.sand, SC.grey, grey * .55), mixCol('#6E6288', '#C9A68C', d), nite * .75), 4);
  band(y + (H - y) * .5, H + 120, mixCol(mixCol(SC.sandDk, SC.greyDk, grey * .5), mixCol('#5C5278', '#B08A72', d), nite * .75), 4);
  const wet = y + 6 + Math.sin(bpOf(t) / 8 * TAU) * 4;
  slab(-40, wet - 5, W + 80, 9, mixCol(SC.sandDk, '#4E4468', nite * .7), 2, 150);
  boilSeed('beachfoam');
  wobLine(-40, W + 40, wet, 3.4, t * .5, mixCol(SC.foam, '#C8C4D8', nite * .6), 2.2, 9);
}

// ---------- the fragments (the motif) ----------
// A torn scrap of paper: an irregular polygon with a paler torn edge. Wash-only by default (0.6 ms);
// pass ink for the hero fragment the camera is on.
function fragPts(s, seed, n = 8) {
  const P = [];
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU + hash(seed * 11.3 + i) * .22, r = s * (.80 + hash(seed * 5.7 + i * 3.1) * .26);
    P.push([Math.cos(a) * r, Math.sin(a) * r * .78]);
  }
  return P;
}
const mvPts = (P, x, y, rot = 0, sc = 1) => {
  const c = Math.cos(rot), s = Math.sin(rot);
  return P.map(([px, py]) => [x + (px * c - py * s) * sc, y + (px * s + py * c) * sc]);
};
// o: { col, ink, sw, edge (draw the torn edge), scene (a tiny memory inside), op }
function frag(t, x, y, s, rot, seed, o = {}) {
  boilSeed('frag' + seed);
  const P = fragPts(s, seed), Q = mvPts(P, x, y, rot);
  paint(Q, { wash: o.col || SC.frag, washOp: o.op ?? 255, ink: o.ink || null, sw: o.sw ?? 1 });
  if (o.edge !== false) {                       // the torn edge catches the light
    const E = Q.slice(0, Math.max(2, Math.ceil(Q.length / 2) + 1));
    paint(ribbon(E, s * .10, s * .02), { wash: SC.fragLt, washOp: (o.op ?? 255) * .85, ink: null });
  }
  if (o.scene) fragScene(o.scene, x, y, s, rot, t, seed, o.sceneOp ?? o.op ?? 255);
}
// A memory small enough to fit on a scrap: two figures and whatever they were doing.
function fragScene(kind, x, y, s, rot, t, seed, op = 255) {
  push(); translate(x, y); rotate(rot); const k = s / 30; scale(k, k);
  boilSeed('scene' + seed);
  if (kind === 'umbrella') {
    slab(-22, 6, 44, 12, SC.sand, 1, op);
    paint(through([[-20, -4], [0, -22], [20, -4]], 6).concat([[16, -2], [0, -8], [-16, -2]]), { wash: SC.rose, washOp: op, ink: null });
    ln([[0, -8], [0, 10]], 1.4 / k, SC.woodDk, 'inkfine', 0);
    dotAt(-7, 6, 5.4, PAL.clay, op); dotAt(7, 7, 5, SC.you, op);
  } else if (kind === 'sea') {
    slab(-24, -14, 48, 16, SC.skyLo, 1, op);
    slab(-24, 2, 48, 10, SC.sea, 1, op);
    slab(-24, 12, 48, 8, SC.sand, 1, op);
    paint(ellPts(12, -8, 5, 5, 10, .4), { wash: SC.sun, washOp: op, ink: null });
  } else if (kind === 'firework') {
    slab(-24, -16, 48, 32, SC.niteHi, 1, op);
    for (let i = 0; i < 7; i++) { const a = i / 7 * TAU + t * .2; ln([[0, 0], [Math.cos(a) * 13, Math.sin(a) * 13]], 1.6 / k, SC.gold, 'inkfine', 0); }
    dotAt(0, 0, 3, SC.cream, op);
  } else if (kind === 'cake') {
    slab(-24, 4, 48, 12, SC.wood, 1, op);
    slab(-11, -6, 22, 12, SC.cream, 1, op);
    paint(ellPts(0, -12, 3, 6, 8, .4), { wash: SC.lamp, washOp: op, ink: null });
    dotAt(-9, -14, 3.2, SC.gold, op); dotAt(9, -14, 3.2, SC.gold, op);
  } else if (kind === 'heart') {
    paint(heartPts(0, 0, 15), { wash: SC.rose, washOp: op, ink: null });
  } else if (kind === 'kite') {
    paint(mvPts([[0, -16], [12, 0], [0, 16], [-12, 0]], 0, 0, t * .3), { wash: SC.teal, washOp: op, ink: null });
    ln(through([[0, 12], [8, 20], [2, 28]], 4), 1.2 / k, SC.inkSoft, 'inkfine', 1);
  }
  pop();
}
// A swarm of fragments drifting in the room. Deterministic: every parameter from hash(i), every
// position a closed function of t, so the frames can render in any order.
// o: { n, x0,y0, rx,ry, s, rise (0..1 lifts them all), spin, kind }
function fragSwarm(t, o = {}) {
  const n = o.n ?? 14, cx = o.x0 ?? W / 2, cy = o.y0 ?? H * .5;
  const rx = o.rx ?? W * .46, ry = o.ry ?? H * .38, s = o.s ?? 20, rise = o.rise ?? 0, sp = o.spin ?? 1;
  boilSeed('swarm');
  for (let i = 0; i < n; i++) {
    const a = hash(i * 2.7) * TAU, rr = .35 + hash(i * 5.3) * .75;
    const ph = hash(i * 9.1) * TAU, spd = .18 + hash(i * 3.3) * .3;
    const lift = rise * (0.4 + hash(i * 7.7) * .9);
    const x = cx + Math.cos(a + t * spd * sp + Math.sin(t * .5 + ph) * .22) * rx * rr;
    const y = cy + Math.sin(a * 1.7 + t * spd * sp * .8) * ry * rr * (1 - lift * .5) - lift * H * .34 + Math.sin(t * .9 + ph) * 5;
    const rot = t * spd * 1.4 * sp + ph, ss = s * (.55 + hash(i * 4.4) * .8);
    const kinds = o.kinds || ['sea', 'umbrella', 'firework', 'cake', 'kite', 'heart', null, null];
    frag(t, x, y, ss, rot, i + (o.seed ?? 0) * 100, { scene: o.scenes ? kinds[i % kinds.length] : null, op: o.op ?? 255, col: o.col });
  }
}

// ---------- the memory sea (ch.3) ----------
function sea(t, o = {}) {
  const hz = o.hz ?? H * .46, d = o.dawn ?? 0, grey = o.grey ?? 0, nite = o.nite ?? 0;
  const skyT = mixCol(mixCol(mixCol(SC.skyHi, SC.cloud, grey), SC.dawnHi, d), SC.niteHi, nite);
  const skyL = mixCol(mixCol(mixCol(SC.skyLo, '#B9BEC6', grey), SC.dawnLo, d), SC.niteLo, nite);
  boilSeed('sky');
  band(-120, hz * .55, skyT, 6);
  band(hz * .5, hz, skyL, 6);
  if (nite < .5) veil(hz * .78, hz * .5, SC.cream, 26);
  if (nite > .03) {                                   // stars over the night water
    boilSeed('nstars');
    for (let i = 0; i < 16; i++) {
      const sx2 = hash(i * 3.7) * W, sy2 = hash(i * 8.1) * hz * .8;
      const tw = .4 + .6 * Math.abs(Math.sin(t * .9 + i * 1.3));
      paint(starPts(sx2, sy2, 1.6 + tw * 1.6, .34, 4), { wash: SC.cream, washOp: (90 + 130 * tw) * nite, ink: null });
    }
    const mx = W * .22, my = hz * .3;                  // the moon, and its broken road on the water
    boilSeed('nmoon');
    paint(ellPts(mx, my, 26, 26, 20, 1), { wash: '#F2EEDF', washOp: 255 * nite, ink: null });
    paint(ellPts(mx + 10, my - 6, 22, 22, 18, 1), { wash: skyT, washOp: 230 * nite, ink: null });
    glow(mx, my, 120, '#FFF0C8', .4 * nite);
    for (let i = 0; i < 6; i++) {
      const yy = hz + 8 + i * (H - hz) * .08, ww = 12 + i * 10;
      slab(mx - ww / 2 + Math.sin(t * .8 + i * 2) * 7, yy, ww, 3, '#E8E4D4', 1, 120 * nite * (1 - i * .12));
    }
  }
  // sun (or a sun trying to get through the grey)
  const sx = o.sunX ?? W * .72, sy = o.sunY ?? hz * .34, sk = (1 - grey * .72) * (1 - nite) * (o.sunK ?? 1);
  if (sk > .03) {
    boilSeed('sun');
    paint(ellPts(sx, sy, 30 * sk + 4, 30 * sk + 4, 22, 1), { wash: SC.sun, washOp: 255 * clamp(sk), ink: null });
    glow(sx, sy, 190 * sk, '#FFE0A0', .6 * clamp(sk));
    // the road of light it lays on the water, broken by the swell
    for (let i = 0; i < 7; i++) {
      const yy = hz + 8 + i * (H - hz) * .075, ww = (16 + i * 12) * sk;
      slab(sx - ww / 2 + Math.sin(t * .9 + i) * 5, yy, ww, 3.4, SC.sun, 1, 150 * sk * (1 - i * .1));
    }
  }
  boilSeed('sea');
  band(hz - 2, hz + (H - hz) * .30, mixCol(mixCol(SC.seaDk, SC.greyDk, grey * .85), '#1E2A4A', nite * .8), 3);
  band(hz + (H - hz) * .26, hz + (H - hz) * .62, mixCol(mixCol(SC.sea, SC.grey, grey * .85), '#26355A', nite * .8), 3);
  band(hz + (H - hz) * .58, H + 120, mixCol(mixCol(SC.seaLt, '#AEB4BC', grey * .8), '#2E3E66', nite * .8), 3);
  ln([[-40, hz], [W + 40, hz]], 1.1, mixCol(SC.inkSoft, SC.cloudDk, grey), 'inkfine', .05);      // the horizon
  // four foam lines rolling in, each on its own beat phase: the sea keeps time
  boilSeed('foam');
  for (let i = 0; i < 4; i++) {
    const ph = (bpOf(t) / 8 + i * .25) % 1, y = hz + (H - hz) * (.20 + ph * .74);
    const w = W * (.5 + .5 * Math.sin(i * 2.1 + 1)), x0 = (hash(i * 6.3) * W * .5) + ph * 30;
    const k = Math.sin(ph * Math.PI);
    if (k > .05) {
      const P = []; for (let j = 0; j <= 9; j++) P.push([x0 + w * j / 9, y + Math.sin(j * 1.1 + i * 2 + t) * 3.4 * k]);
      paint(ribbon(P, 7 * k + 2, 3 * k + 1), { wash: SC.foam, washOp: 210 * k, ink: null });
    }
  }
  if (o.sand !== false) {
    boilSeed('sand');
    const sy = o.sandY ?? H * .84;
    paint(through([[-40, sy], [W * .3, sy - 12], [W * .62, sy + 4], [W + 40, sy - 8]], 6).concat([[W + 40, H + 120], [-40, H + 120]]),
          { wash: mixCol(SC.sand, '#B9AE9C', grey * .4), ink: null });
    ln(through([[-40, sy], [W * .3, sy - 12], [W * .62, sy + 4], [W + 40, sy - 8]], 6), 1.2, mixCol(SC.sandDk, SC.inkSoft, grey * .5), 'inkfine', 1);
    // the wet line the last wave left
    paint(ribbon(through([[-40, sy - 16], [W * .34, sy - 26], [W * .7, sy - 12], [W + 40, sy - 20]], 6), 9, 4), { wash: SC.foam, washOp: 90, ink: null });
  }
}
function cloudAt(t, x, y, s, col, op = 255, seed = 0) {
  boilSeed('cloud' + seed);
  const drift = Math.sin(t * .35 + seed) * 6;
  paint(ellPts(x + drift, y, s, s * .48, 16, s * .05), { wash: col, washOp: op, ink: null });
  paint(ellPts(x - s * .55 + drift, y + s * .12, s * .6, s * .34, 14, s * .04), { wash: col, washOp: op * .92, ink: null });
  paint(ellPts(x + s * .6 + drift, y + s * .10, s * .55, s * .3, 14, s * .04), { wash: col, washOp: op * .95, ink: null });
}
function rainAt(t, o = {}) {
  const n = o.n ?? 40, k = o.k ?? 1; if (k <= .02) return;
  boilSeed('rain');
  for (let i = 0; i < n; i++) {
    const sp = 320 + hash(i * 4.7) * 260, x = (hash(i * 8.1) * (W + 160)) - 80 + Math.sin(i) * 20;
    const y = -40 + frac(hash(i * 2.3) + t * sp / (H + 120)) * (H + 120), L = 11 + hash(i * 6.6) * 9;
    ln([[x, y], [x - L * .22, y + L]], .9, SC.rain, 'inkfine', 0);
  }
}

// ---------- fireworks (ch.4) ----------
// age < 0: nothing. 0 → rise: the shell climbs on a wobbling trail. burst → age 0: it opens, holds
// one instant (只停在绽放一刹那), then the sparks droop and go out. One wash ribbon per spoke + one glow.
function firework(t, x, y, age, col, s = 1, seed = 0, o = {}) {
  if (age == null || age < -1.4) return;
  const riseT = o.rise ?? .55;
  if (age < 0) {                                     // the climb
    const k = 1 + age / riseT; if (k <= 0) return;
    const yy = lerp(H + 40, y, easeOut(k)), xx = x + Math.sin(k * 9 + seed) * 8 * (1 - k);
    boilSeed('shell' + seed);
    paint(ribbon(through([[xx, yy + 46], [xx + 4, yy + 22], [xx, yy]], 4), 3.4, 1.2), { wash: SC.gold, washOp: 200 * k, ink: null });
    glow(xx, yy, 26, '#FFD98A', .5 * k);
    return;
  }
  const N = o.spokes ?? 15, life = o.life ?? 1.5;
  const bloom = easeOut(clamp(age / .16)), fade = 1 - ease(clamp((age - life * .45) / (life * .55)));
  if (fade <= .02) return;
  const droop = age * age * 46, rr = s * 78 * bloom;
  boilSeed('burst' + seed);
  for (let i = 0; i < N; i++) {
    const a = i / N * TAU + hash(seed * 3.1 + i) * .22, len = rr * (.72 + hash(seed * 7.7 + i) * .4);
    const ex = x + Math.cos(a) * len, ey = y + Math.sin(a) * len + droop * (.4 + hash(i * 2.9) * .8);
    const c = o.multi ? PARTY[(i + seed) % PARTY.length] : col;
    paint(ribbon(through([[x + Math.cos(a) * rr * .16, y + Math.sin(a) * rr * .16 + droop * .1],
                          [x + Math.cos(a) * len * .62, y + Math.sin(a) * len * .62 + droop * .45], [ex, ey]], 4),
                 s * 5.2 * fade + .8, s * 1.4 * fade + .3), { wash: c, washOp: 245 * fade, ink: null });
    if (hash(i * 5.5 + seed) > .55) dotAt(ex, ey, s * 2.2 * fade, SC.cream, 200 * fade);
  }
  glow(x, y + droop * .2, s * 150 * fade * (.5 + .5 * bloom), col, .55 * fade);
  if (o.crackle) for (let i = 0; i < 5; i++) {
    const a = hash(i * 3.3 + seed) * TAU, d = rr * (1.05 + hash(i * 9.9) * .3);
    paint(starPts(x + Math.cos(a) * d, y + Math.sin(a) * d + droop, 3.4 * fade, .3, 4), { wash: SC.cream, washOp: 210 * fade, ink: null });
  }
}

// ---------- the paper plane (the giving) ----------
function paperPlane(t, x, y, s, rot, o = {}) {
  boilSeed('plane');
  push(); translate(x, y); rotate(rot);
  const c = o.col || SC.fragLt, dk = o.dk || SC.fragDk;
  paint([[-s * 1.5, -s * .18], [s * 1.5, -s * .62], [s * .34, s * .10]], { wash: dk, ink: null });      // the far wing
  paint([[-s * 1.5, -s * .18], [s * 1.5, -s * .62], [s * .10, s * .78]], { wash: c, ink: o.ink || null, sw: o.sw ?? 1 });
  paint([[-s * 1.5, -s * .18], [s * .10, s * .78], [-s * .58, s * .22]], { wash: mixCol(c, dk, .45), ink: null });
  ln([[-s * 1.5, -s * .18], [s * 1.5, -s * .62]], .9, SC.inkSoft, 'inkfine', 0);                        // the fold
  pop();
  if (o.trail) {                                    // the thread of where it has been
    const P = []; for (let i = 0; i <= 7; i++) { const k = i / 7; P.push([x - Math.cos(rot) * s * 4.4 * k * o.trail, y - Math.sin(rot) * s * 4.4 * k * o.trail + k * k * s * 1.4]); }
    paint(ribbon(P, s * .5, s * .06), { wash: SC.cream, washOp: 150, ink: null });
  }
}

// ---------- 你: the friend, pale blue, only ever inside a memory ----------
function you(x, y, u, o = {}) {
  clawd(x, y, u, { ...o, col: SC.you, dk: SC.youDk, lt: SC.youLt, tint: null, tintK: 0, boilKey: o.boilKey ?? 'you' });
}
// The halo of paper that a memory sits on: it says "this is a fragment", not "this is now".
function memoryHalo(x, y, r, k = 1, col = SC.cream) {
  if (k <= .02) return;
  paint(ellPts(x, y, r, r * .82, 24, r * .05), { wash: col, washOp: 60 * clamp(k), ink: null });
  paint(ellPts(x, y, r * .68, r * .56, 20, r * .04), { wash: col, washOp: 55 * clamp(k), ink: null });
}

// ---------- small weather ----------
function tearDrop(t, x, y, age, s = 1) {                    // a tear, from the eye to the floor
  if (age < 0 || age > 1.5) return;
  const k = clamp(age / .9), yy = y + (H - y) * easeIn(k) * .32;
  boilSeed('tear');
  paint(ribbon(through([[x, yy - 9 * s], [x + 1.5 * s, yy], [x, yy + 8 * s], [x - 1.5 * s, yy]], 4), 5 * s, 3 * s),
        { wash: '#BBD4E8', washOp: 235 * (1 - ease(clamp((age - 1.05) / .45))), ink: null });
}
function dust(t, o = {}) {                                   // motes in the lamplight
  const n = o.n ?? 16, k = o.k ?? 1; if (k <= .02) return;
  boilSeed('dust');
  for (let i = 0; i < n; i++) {
    const x = (o.x ?? W * .3) + Math.sin(t * .42 + i * 1.7) * (o.rx ?? 150) + hash(i * 3.3) * (o.rx ?? 150) * .6;
    const y = (o.y ?? H * .45) + Math.cos(t * .31 + i * 2.3) * (o.ry ?? 90) - frac(hash(i * 7.1) + t * .03) * 40;
    dotAt(x, y, 1.4 + hash(i * 5.5) * 2, SC.lampPool, 190 * k * (.4 + .6 * Math.abs(Math.sin(t * 1.1 + i))));
  }
}
function sparkle(t, x, y, r, age, life = 1.1, col = SC.cream) {
  if (age < 0 || age > life) return;
  const k = Math.sin(clamp(age / life) * Math.PI);
  paint(starPts(x, y, r * k, .26, 4), { wash: col, washOp: 255 * k, ink: null });
  paint(starPts(x, y, r * k * .5, .3, 4, -.3), { wash: SC.gold, washOp: 220 * k, ink: null });
}
// A heart, painted, rising and going out. For the moment the memory is worth more than the room.
function heartUp(t, x, y, age, s = 1, col = SC.rose) {
  if (age < 0 || age > 2.2) return;
  const k = 1 - ease(clamp(age / 2.2)), yy = y - age * 46 * s, xx = x + Math.sin(age * 2.4) * 9 * s;
  boilSeed('heart');
  paint(mvPts(heartPts(0, 0, 11 * s * (.6 + .4 * k)), xx, yy, Math.sin(age * 1.6) * .2), { wash: col, washOp: 235 * k, ink: null });
}

// ---------- transitions (every seam gets one; the tear is this film's own) ----------
function fadeIn(lt, dur = .7, col) { const p = seg(lt, 0, dur); if (p < 1) flash(1 - p, col || SC.ink); }
function fadeOut(lt, D, dur = .9, col) { const p = seg(lt, D - dur, D); if (p > 0) flash(ease(p), col || SC.ink); }
function wipeIn(lt, dur = .7, cols) { const p = seg(lt, 0, dur * .5); if (p > 0 && p < 1) brushWipe(.5 + p, cols); }
// The A-side of a wipe seam: the sheet sweeps ON and covers the frame exactly at the cut, so the
// next shot's wipeIn can drag it off. (The template's wipeOut covers early and uncovers before the
// cut, which leaves the seam uncovered.)
function wipeCover(lt, D, dur = .6, cols) { const p = seg(lt, D - dur, D); if (p > 0) brushWipe(p * .5, cols); }
// Explicit iris helpers: close = the mask closes in from the edges and covers at the cut; open = the
// hole grows out of the centre. (The template's irisIn/irisOut run the other way round.)
function irisClose(lt, D, dur = .7, cx = W * .5, cy = H * .5, col) { const p = seg(lt, D - dur, D); if (p > 0) iris(cx, cy, (1 - ease(p)) * W * 1.3, col || SC.ink); }
function irisOpen(lt, dur = .7, cx = W * .5, cy = H * .5, col) { const p = seg(lt, 0, dur); if (p < 1) iris(cx, cy, easeOut(p) * W * 1.3, col || SC.ink); }
function wipeOut(lt, D, dur = .7, cols) { const p = seg(lt, D - dur, D - dur * .5); if (p > 0 && p < 1) brushWipe(p, cols); }
function irisIn(lt, dur = .7, cx = W * .5, cy = H * .5, col) { const p = seg(lt, 0, dur); if (p < 1) iris(cx, cy, (1 - easeOut(p)) * W * 1.4, col || SC.ink); }
function irisOut(lt, D, dur = .8, cx = W * .5, cy = H * .5, col) { const p = seg(lt, D - dur, D); if (p > 0) iris(cx, cy, ease(p) * W * 1.4, col || SC.ink); }
// A sheet of torn paper sweeps across: cover by p = .5 (cut there), drag off by p = 1. The tear edge
// is one jagged line with a pale ripped edge along it — the film's own wipe, made of the motif.
function tearWipe(p, cols) {
  if (p <= 0 || p >= 1) return;
  const [c1, c2] = cols || [SC.frag, SC.fragDk];
  const sweep = p < .5 ? easeOut(p / .5) : 1;
  const off = p < .5 ? 0 : ease((p - .5) / .5) * W * 2.5;
  const xT = lerp(-W * .28, W * 1.28, sweep) + off, xL = xT - W * 2.3;
  boilSeed('tearwipe');
  const N = 20, jag = i => (hash(i * 5.13) * 2 - 1) * 30;   // the tear is one physical piece of paper: no boil
  const P = [];
  for (let i = 0; i <= N; i++) P.push([xT + jag(i), -90 + (H + 180) * i / N]);
  P.push([xL, H + 90]); P.push([xL, -90]);
  paint(P, { wash: c1, ink: null });
  // the ripped edge: a pale sliver down the tear, and a shadow just behind it
  const E = P.slice(0, N + 1);
  paint(ribbon(E, 13, 9), { wash: SC.fragLt, ink: null });
  paint(ribbon(E.map(([x, y]) => [x - 16, y]), 9, 6), { wash: c2, washOp: 130, ink: null });
}
const tearOut = (lt, D, d = .62, cols) => { const p = seg(lt, D - d, D); if (p > 0 && p < 1) tearWipe(p * .5, cols); };
const tearIn = (lt, d = .62, cols) => { const p = seg(lt, 0, d); if (p < 1) tearWipe(.5 + p * .5, cols); };
// A fragment flies over the lens and takes the scene with it: shaped iris on a torn polygon.
function fragIris(t, k, x = W / 2, y = H / 2, s = 1, col = SC.frag) {
  if (k <= .001) return;
  irisShape(mvPts(fragPts(900 * s * k, 3.7, 7), x, y, k * .5), col);
}

// ---------- the box and its scraps (S1, S3, S10, S13) ----------
// A shoebox on the desk, lid askew, `k` = how full it is (1 = brimming, 0 = empty). The box is the
// film's first and last image: full at the start, empty at the end.
function boxAt(t, x, y, s = 1, k = 1, o = {}) {
  boilSeed('box');
  const w = 96 * s, h = 44 * s;
  // the scraps inside, brimming: a few torn shapes above the rim before the front of the box covers them
  if (k > .02) for (let i = 0; i < 7; i++) {
    const a = hash(i * 4.1 + 2), px = x - w * .42 + a * w * .84, py = y - h * (.42 + hash(i * 7.3) * .34) * k;
    frag(t, px, py, 15 * s * (.7 + hash(i * 3.3) * .6), hash(i * 9.1) * TAU + Math.sin(t * .8 + i) * .06, i + 30,
         { col: i % 3 ? SC.frag : SC.fragLt, edge: i % 2 === 0, op: 255 });
  }
  slab(x - w / 2, y - h, w, h, mixCol(SC.woodLt, '#8C7C8E', .14), 2);            // the front
  slab(x - w / 2, y - h, w, h * .16, mixCol(SC.wood, '#7A6A80', .12), 2);         // the rim
  paint(ellPts(x, y - h, w * .5, h * .13, 18, 2), { wash: SC.woodDk, washOp: 200, ink: null });   // the dark inside
  ln([[x - w / 2, y - h], [x + w / 2, y - h]], 1.2, SC.inkSoft, 'inkfine', .05);
  // the lid, leaning against the side of the box: it came off a while ago
  boilSeed('lid');
  const lx = x - w * .62, ly = y - 4, rot = .30 + Math.sin(t * .5) * .006;
  push(); translate(lx, ly); rotate(rot);
  slab(-w * .30, -h * 1.15, w * .60, h * 1.15, mixCol(SC.wood, '#7E6C82', .12), 2);
  ln([[-w * .30, -h * 1.15], [w * .30, -h * 1.15]], 1, SC.inkSoft, 'inkfine', 0);
  pop();
}
