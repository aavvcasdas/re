// _lib.js — the film's shared art vocabulary (loaded before the shots).
//
// Look: flat gouache shapes (cheap `wash`) + thin ink linework (a few real brush
// strokes), on the kit's paper + grain. Every shape is drawn in W/H-relative units
// so the film re-renders at any resolution.
//
// Cost note (measured, software GL): a flat `wash` shape costs ~1 ms, a thin
// inkLine ~20–40 ms, a watercolour `fill` ~3 s and the stock `clawd()` ~9 s.
// So: backgrounds and every secondary form are flat washes; only real edge work
// uses strokes. See tools/README-perf.md.
//
// Beats: the film is cut to the song's bar grid — BAR = 4 * BEAT at 93 BPM.

const BAR = 4 * BEAT;
const LINE = 2 * BAR;            // the song gives each lyric line two bars
const SC = {                     // the shooting schedule, in seconds
  bar: n => n * BAR,
  lines: [                       // 30 lyric lines, one every two bars, after a two-bar intro
    '当海面迎来汹涌的潮汐', '我奔跑寻找昔日的足迹', '夕阳下倒影迷人的美丽', '可我却丢失故事和你',
    '你说过向往大海的神秘', '也憧憬我们遗失的过去', '分享给大海秘密', '蓝色的海底',
    '远山的风景', '我们的距离遥不可及', '退守的爱情', '还剩下回忆', '疯狂的寻觅你的身影',
    '残月忧郁 星夜静谧 潮落叹息', '聆听山语 回荡不清 若即若离',
    '当海面迎来汹涌的潮汐', '我奔跑寻找昔日的足迹', '夕阳下倒影迷人的美丽', '可我却丢失故事和你',
    '你说过向往大海的神秘', '也憧憬我们遗失的过去', '分享给大海秘密', '蓝色的海底',
    '远山的风景', '我们的距离遥不可及', '退守的爱情', '还剩下回忆', '疯狂的寻觅你的身影',
    '残月忧郁 星夜静谧 潮落叹息', '聆听山语 回荡不清 若即若离',
  ],
  shotAt: [0, 8, 16, 22, 28, 32, 40, 48, 56, 64],   // shot boundaries, in bars
};
SC.lines.forEach((txt, i) => { SC[i ? 'x' : 'x'] = 0; });
const lineT = i => SC.bar(2 + 2 * i);          // start time of lyric line i (0-based)
const SHOT = i => [SC.bar(SC.shotAt[i]), SC.bar(SC.shotAt[i + 1] || 64)];

// ---------- palette ----------
// One coast at nine hours of light: dusk → night → dawn → morning → sunrise.
const F = {
  ink: '#3A3340', inkSoft: '#575066',
  dusk: ['#F2DCC0', '#EFCFA9', '#EBBE8C', '#E7A876'],     // sky, pale → warm
  duskSea: ['#5E7E99', '#6E8FA8', '#7FA0B6'],
  wetSand: '#CDB58C', drySand: '#DCC6A2', sandShade: '#BFA57E',
  rose: '#E2907F', coral: '#E8A87C', gold: '#EBC07A',
  night: ['#171C3E', '#1F2550', '#2A3163'],
  nightSea: ['#31456E', '#3E5480', '#50688F'],
  indigo: '#2F3C7A', violet: '#5B5AA0', silver: '#B8C6DC', moon: '#FFF3D8',
  deep: ['#173A52', '#1E4C68', '#2A5F7C', '#357491'],     // underwater
  lightShaft: '#CFE6EA',
  dawn: ['#8E9FC4', '#C2A6B4', '#E3BFA8', '#F0D3AE'],
  dawnSea: ['#4E6A88', '#5F7E9A', '#7291A8'],
  teal: '#3A9C98', sky: '#A8D2E2', morning: ['#C9D8DE', '#DCE4E2', '#EFE3CE'],
  sunrise: ['#F5D9B0', '#F4C193', '#F0A874', '#E79A6A'],
  sunriseSea: ['#6E97AE', '#84A8B8', '#9BBAC4'],
};

// ---------- primitives ----------
// A horizontal band of flat colour, painted as one fat-edge shape. Covers the frame cheaply.
function band(y0, y1, col, j = 6, op = 255) {
  const mid = (y0 + y1) / 2, ry = Math.max(2, (y1 - y0) / 2);
  paint(ellPts(W / 2, mid, W * .95, ry, 26, j), { wash: col, washOp: op, ink: null });
}
// The same, but free-form along a wobbly top edge (dunes, hills, water lines).
// Fills UPWARD from the wavy edge to the top of the frame (ceilings, overhangs, pool rims).
function bandEdgeUp(x0, x1, yAt, col, seg = 7, j = 3, op = 255) {
  const pts = [], n = seg, w = (x1 - x0) / n, top = -80;
  for (let i = 0; i <= n; i++) pts.push([x0 + i * w, yAt(i / n) + jit(j)]);
  for (let i = n; i >= 0; i--) pts.push([x0 + i * w, top]);
  paint(pts, { wash: col, washOp: op, ink: null });
}
function bandEdge(x0, x1, yAt, col, seg = 7, j = 3, op = 255) {
  const pts = [], n = seg, w = (x1 - x0) / n;
  for (let i = 0; i <= n; i++) pts.push([x0 + i * w, yAt(i / n) + jit(j)]);
  const bottom = H + 80;
  for (let i = n; i >= 0; i--) pts.push([x0 + i * w, bottom]);
  paint(pts, { wash: col, washOp: op, ink: null });
}
// NB: not named `stroke` — p5 owns that global and a top-level redeclare throws.
function ln(pts, sw = 1.4, col = F.ink, br = 'ink', curv = .5) { inkLine(pts, sw, col, br, curv); }
// A thin wavy line across the frame: the film's wave idiom.
function waveline(t, y, amp, ph, col, sw = 1.2, segs = 4, a = 0, b = W) {
  const pts = [], n = segs;
  for (let i = 0; i <= n; i++) {
    const x = a + (b - a) * i / n;
    pts.push([x, y + amp * Math.sin(t * 1.15 + ph + i * 1.7) + jit(amp * .25)]);
  }
  ln(pts, sw, col, 'inkfine', .7);
}
function dotAt(x, y, r, col, op = 255) { paint(ellPts(x, y, r, r * .92, 8, .4), { wash: col, washOp: op, ink: null }); }

// ---------- sky / sea / sand ----------
// horizon: where sea meets sky. opt.bands: [colours], opt.sea: [colours], opt.sand: colour or null
function seascape(t, o = {}) {
  const hz = o.hz ?? H * .52, sky = o.sky || F.dusk, sea = o.sea || F.duskSea;
  // sky: five narrow bands with the palette ramp (narrow steps read as a gradient, not stripes)
  const ramp = [sky[0], sky[1]];                     // pale pair at the top
  for (let i = 0; i < 3; i++) ramp.push(sky[2 + (i % 2) === 2 ? 2 : 3]);
  const skyRamp = [sky[0], sky[1], mixCol(sky[1], sky[2], .5), sky[2], sky[3 % sky.length]];
  for (let i = 0; i < skyRamp.length; i++) {
    boilSeed('sky' + i);
    const y1 = lerp(-60, hz + 2, (i + 1) / skyRamp.length), y0 = lerp(-60, hz + 2, i / skyRamp.length);
    band(y0, y1 + 1, skyRamp[i], 5, 255);
  }
  // haze: two pale veils laid across the band seams so they don't read as edges
  boilSeed('haze');
  paint(ellPts(W * .5, hz * .55, W * .8, H * .16, 26, 12), { wash: mixCol(skyRamp[1], '#FFFFFF', .45), washOp: 60, ink: null });
  boilSeed('haze2');
  paint(ellPts(W * .5, hz * .97, W * .85, H * .10, 26, 12), { wash: mixCol(skyRamp[4], '#FFFFFF', .3), washOp: 70, ink: null });
  // sea: four bands between the horizon and the sand line (the wet sand then takes over)
  const sandY = H * (o.sandY ?? .86);
  const seaRamp = [mixCol(sea[0], skyRamp[4], .42), sea[0], sea[1], sea[2 % sea.length]];
  for (let i = 0; i < seaRamp.length; i++) {
    boilSeed('sea' + i);
    const y1 = lerp(hz - 1, sandY + 2, (i + 1) / seaRamp.length), y0 = lerp(hz - 1, sandY + 2, i / seaRamp.length);
    band(y0, y1 + 1, seaRamp[i], 6, 255);
  }
  // wet sheen right at the waterline: a paler band the foam sits on
  boilSeed('sheen');
  band(sandY - H * .012, sandY + H * .03, mixCol(seaRamp[3], '#F2E6CC', .35), 5, 235);
  boilSeed('hz');
  ln([[-40, hz], [W * .3, hz + jit(1.2)], [W * .68, hz - jit(1.2)], [W + 40, hz + jit(.8)]], o.hzSw ?? 1.6, o.hzCol || F.inkSoft, 'ink', .5);
  if (o.sand !== null) {
    boilSeed('sand');
    bandEdge(-60, W + 60, u => sandY + (o.sandWob ?? 10) * Math.sin(u * 2.4 + (o.sandPh || 0)), o.sand || F.wetSand, 8, 4, o.sandOp ?? 255);
    boilSeed('sand2');
    bandEdge(-60, W + 60, u => sandY + H * .035 + 9 * Math.sin(u * 3.1 + 1), o.dry || F.drySand, 7, 5, 240);
    boilSeed('sand3');
    bandEdge(-60, W + 60, u => sandY + H * .085 + 7 * Math.sin(u * 2.1 + 2.5), mixCol(o.dry || F.drySand, o.sand || F.wetSand, .45), 6, 5, 235);
  }
  return hz;
}
// A far headland: a low flat silhouette that sits on the horizon and gives the eye an anchor.
function headland(hz, o = {}) {
  const x0 = o.x ?? W * .03, w = o.w ?? W * .30, h = o.h ?? H * .035;
  boilSeed('head');
  paint(through([[x0, hz + 1], [x0 + w * .18, hz - h * .55], [x0 + w * .40, hz - h * .95], [x0 + w * .58, hz - h * .45],
                 [x0 + w * .78, hz - h * .70], [x0 + w, hz + 1]], 5).concat([[x0 + w, hz + 4], [x0, hz + 4]]),
        { wash: o.col || mixCol(F.ink, o.sky || F.dusk[1], .58), ink: null });
}
// waves on the sea: n lines, thinning toward the horizon
function waves(t, hz, n = 5, o = {}) {
  const col = o.col || F.inkSoft, span = H - hz;
  for (let i = 0; i < n; i++) {
    boilSeed('wv' + i);
    const y = hz + span * (.10 + .17 * i), sw = (.3 + .8 * (i / n)) * (o.sw ?? 1);
    waveline(t, y, (2 + 3.4 * i) * (o.amp ?? 1), i * 1.3, mixCol(col, o.light || '#EFDCC4', .18 + .12 * i), sw, 5);
  }
}
// light on the water: a broken vertical glitter column (washes only — free)
function glitter(t, x, y0, y1, col = '#FFE9BE', k = 1) {
  for (let i = 0; i < 14; i++) {
    const u = i / 13, y = lerp(y0, y1, u), sp = .6 + .5 * Math.sin(t * 1.4 + i * 2.1);
    const w = W * (.012 + .05 * u) * sp * k;
    paint(ellPts(x + jit(W * .012) * (1 + u), y, w, 2 + 2.4 * u, 8, .6), { wash: col, washOp: 90 + 60 * sp, ink: null });
  }
}

// ---------- the wanderer ----------
// The film walks with Clawd (clawd.js): the protagonist, seen almost entirely from behind or in
// three-quarter, because the sea is the other character and he keeps facing it.
// `wanderer(x, y, h, o)` keeps the signature the nine shots were written against — x, y at the feet,
// h = his height on screen in px, o = the old option bag — and maps it onto clawd():
//   walk (a phase; the legs step)   -> clawd walk + a bob and counter-swinging arms
//   squat / breath / lean / head    -> squash, a slow rise, a tilt about the feet, a nod
//   dress / dark                    -> his body colour (dark = the night shots' ink tone)
//   holding:'shell'                 -> the arms come up to cradle it (the shots draw the shell itself)
//   view: back | qback | side | q | front, flip, plus eyes/mouth/lookX/lookY/blush/emote/tint and
//   turn()-style spread ({ ...turn(...) } gives view + flip + smear for a drawn turn).
const GIRL_VIEW = { front: 'front', q: 'q', qback: 'qback', side: 'side', back: 'back' };
function wanderer(x, y, h, o = {}) {
  const u = h / 8, sq = o.squat || 0, br = o.breath || 0, lean = o.lean || 0, hd = o.head || 0;
  const wk = o.walk ?? null, step = wk != null ? Math.abs(Math.sin(wk * TAU)) : 0;
  const col = o.dark || o.dress || PAL.clay;
  const arms = o.holding ? [o.armL ?? .58, o.armR ?? .62] : null;
  const opts = {
    view: GIRL_VIEW[o.view] || 'qback', flip: o.flip, smear: o.smear, smearDir: o.smearDir,
    boilKey: o.key || 'wanderer', walk: wk,
    rot: lean * 1.15 + hd * .42 + (wk != null ? Math.sin(wk * TAU * 2) * .022 : 0),
    dx: lean * 1.4,
    dy: -(step * .5 + br * .10 * (1 + Math.sin(T * 1.25))),
    sq: sq * .55,
    aL: arms ? arms[0] : (o.armL ?? (wk != null ? .30 * Math.sin(wk * TAU) : -.12)),
    aR: arms ? arms[1] : (o.armR ?? (wk != null ? -.30 * Math.sin(wk * TAU) : -.12)),
    col, dk: mixCol(col, PAL.ink, .26), lt: mixCol(col, '#F5B394', .5),
  };
  for (const k of ['eyes', 'mouth', 'tint', 'tintK', 'blush', 'gloom', 'squint', 'lookX', 'lookY', 'emote', 'emoteK', 'emoteAge', 'lid', 'hat'])
    if (o[k] != null) opts[k] = o[k];
  clawd(x, y, u, opts);
}

// ---------- props ----------
// A scallop shell: a fan with a hinge and ridge lines. Flat washes, so it is cheap.
function scallop(x, y, s, rot = 0, o = {}) {
  push(); translate(x, y); rotate(rot);
  boilSeed('sc' + (o.key || ''));
  const fan = [];
  for (let i = 0; i <= 14; i++) {
    const a = Math.PI * (.04 + .92 * i / 14);
    fan.push([Math.cos(a) * s * 1.45, s * .30 - Math.sin(a) * s * 1.05]);
  }
  fan.push([0, s * .62], [-s * 1.45, s * .30]);
  paint(fan, { wash: o.col || '#F0A98E', ink: null });
  boilSeed('scb' + (o.key || ''));
  paint(ellPts(0, s * .40, s * .40, s * .28, 14, .5), { wash: o.hinge || '#F7E3C8', ink: null });
  if (o.ridges !== false) for (let i = 1; i < 6; i++) {
    boilSeed('scr' + i + (o.key || ''));
    const a = Math.PI * (.10 + .80 * i / 6);
    ln([[0, s * .46], [Math.cos(a) * s * 1.30, s * .30 - Math.sin(a) * s * 1.00]], .45, o.ridge || '#D98C74', 'inkfine', .5);
  }
  pop();
}
function moonAt(x, y, r, o = {}) {
  boilSeed('moon' + (o.key || ''));
  glow(x, y, r * (3.6 + (o.halo || 0)), o.haloCol || '#FFE7B0', .16 + (o.halo || 0) * .3);
  if (o.crescent) {                                  // waning moon: a disc with a bite taken out
    paint(ellPts(x, y, r, r, 34, 1), { wash: o.col || F.moon, ink: null });
    boilSeed('moonbite');
    paint(ellPts(x + r * .52, y - r * .18, r * 1.02, r * 1.02, 34, 1), { wash: o.sky || F.night[0], ink: null });
  } else paint(ellPts(x, y, r, r, 34, 1), { wash: o.col || F.moon, ink: null });
}
function paperBoat(x, y, s, rot = 0, o = {}) {
  push(); translate(x, y); rotate(rot);
  boilSeed('boat' + (o.key || ''));
  paint([[ -s, 0], [-s * .72, s * .40], [s * .72, s * .40], [s, 0], [-s, 0]], { wash: o.col || '#F6EEDC', ink: null });
  boilSeed('boatsail');
  paint([[0, -s * 1.15], [s * .62, -s * .06], [-s * .62, -s * .06]], { wash: o.sail || '#FBF4E6', ink: null });
  boilSeed('boatink');
  ln([[-s, 0], [-s * .72, s * .40], [s * .72, s * .40], [s, 0]], Math.max(.6, s * .05), mixCol(F.ink, o.col || '#F6EEDC', .3), 'inkfine', .4);
  ln([[0, -s * 1.15], [s * .62, -s * .06], [-s * .62, -s * .06], [0, -s * 1.15]], Math.max(.5, s * .04), mixCol(F.ink, o.col || '#F6EEDC', .25), 'inkfine', .4);
  pop();
}
// footprints along a beach: flat washes (free), so we can afford many.
// pts: [[x,y],...]; k 0..1 = how much of the line the water has erased (from the far end).
function prints(pts, k = 0, o = {}) {
  const n = pts.length - 1;
  for (let i = 0; i <= n; i++) {
    // each print dies at its own moment (o.deaths[i], 0..1) so the water takes them one by one
    const due = o.deaths ? o.deaths[i] : (1 - i / n);
    const born = o.born ? ease(seg(o.born.t, o.born.t0 ?? 0, o.born.t1 ?? 1)) >= o.born.at[i] : true;
    if (!born) continue;
    const alive = k < due;
    if (!alive && !o.showDead) continue;
    const [x, y] = pts[i], [nx, ny] = pts[Math.min(n, i + 1)];
    const a = Math.atan2(ny - y, nx - x) + Math.PI * .5, s = (pts[i][2] ? pts[i][2] / (o.s || 1) : 1) * (o.s || 1);
    const sd = (o.key || '') + i;
    boilSeed('pr' + sd);
    push(); translate(x + jit(s * 1.2), y + jit(s * .8));
    rotate(a + (i % 2 ? .30 : -.26) + jit(.09));
    const c = o.col || '#A3855C', op = alive ? (o.op ?? 200) : 0;
    paint(ellPts(-s * 1.15, s * .5, s * 2.4, s * 1.35, 10, .3), { wash: c, washOp: op, ink: null });
    paint(ellPts(s * 1.6, s * .35, s * 2.1, s * 1.3, 10, .3), { wash: c, washOp: op, ink: null });
    paint(ellPts(0, -s * 2.1, s * 2.2, s * 1.5, 12, .4), { wash: c, washOp: op * .95, ink: null });
    pop();
  }
}
// layered distant ridges: far (pale) → near (dark)
function ridges(hz, o = {}) {
  const cols = o.cols || ['#9FA8C0', '#7C86A0', '#5C6580'], n = cols.length;
  for (let i = 0; i < n; i++) {
    boilSeed('ridge' + i);
    const y = hz - (o.lift ?? 14) * (1 - i / n), amp = (o.amp ?? 10) * (1 - i / n) + 3;
    bandEdge(-60, W + 60, u => y - amp * (.5 + .5 * Math.sin(u * (2.2 + i * .8) + i * 2.4)) - amp * .5 * Math.sin(u * 7 + i), cols[i], 9, 2, 235);
  }
}
function starField(t, n = 26, o = {}) {
  for (let i = 0; i < n; i++) {
    boilSeed('st' + i);
    const x = hash(i * 3 + 1) * W, y = hash(i * 7 + 2) * H * (o.top ?? .46);
    const tw = .5 + .5 * Math.sin(t * (1.4 + hash(i) * 2.4) + i * 2);
    dotAt(x, y, (1.1 + 1.6 * hash(i + 9)) * (o.s || 1), o.col || F.moon, 120 + 110 * tw);
  }
}
// underwater light shafts
function shafts(t, o = {}) {
  for (let i = 0; i < 6; i++) {
    boilSeed('sh' + i);
    const x = W * (.08 + .17 * i), w = W * .045, sway = W * .02 * Math.sin(t * .5 + i);
    paint([[x - w, -40], [x + w, -40], [x + w * 1.5 + sway, H + 40], [x - w * 1.5 + sway, H + 40]], { wash: o.col || F.lightShaft, washOp: 46 + 16 * Math.sin(t * .7 + i), ink: null });
  }
}
// concentric rings on the water
function ripples(t, cx, cy, o = {}) {
  const n = o.n || 4, sp = o.speed || .55;
  for (let i = 0; i < n; i++) {
    const k = frac(t * sp - i * .25);
    if (k < .04) continue;
    boilSeed('rp' + i + (o.key || ''));
    const r = (o.r0 || 12) + k * (o.spread || 120);
    paint(ellPts(cx, cy, r, r * (o.flat ?? .22), 30, .8), { wash: o.col || '#E9E4D2', washOp: (1 - k) * 120, ink: null });
  }
}
function gull(t, x, y, s, o = {}) {
  boilSeed('gull');
  const f = Math.sin(t * (o.flap || 6) + (o.ph || 0));
  ln([[x - s, y - f * s * .34], [x, y + s * .16], [x + s, y - f * s * .34]], Math.max(.7, s * .10), o.col || F.ink, 'inkfine', .7);
}
// a tide pool: a shallow ellipse of water with a sky reflection and a reflected moon
function tidePool(t, x, y, rx, ry, o = {}) {
  boilSeed('pool');
  paint(ellPts(x, y, rx, ry, 30, 6), { wash: o.water || '#3C5480', ink: null });
  boilSeed('poolrim');
  bandEdge(x - rx * 1.06, x + rx * 1.06, u => y + ry * Math.sqrt(Math.max(0, 1 - (u * 2 - 1) ** 2)) + jit(2), o.sand || F.drySand, 9, 2, 235);
  if (o.moon) { boilSeed('poolmoon'); paint(ellPts(x + (o.moonX || 0), y + (o.moonY || 0), o.moonR || ry * .5, (o.moonR || ry * .5) * ry / rx, 20, .8), { wash: F.moon, washOp: 200, ink: null }); }
  for (let i = 0; i < 3; i++) { boilSeed('poolw' + i); waveline(t, y - ry * .2 + i * ry * .35, 2, i * 1.5, '#E4E9F2', .8, 3, x - rx * .8, x + rx * .8); }
  boilSeed('poolink');
  ln(ellPts(x, y, rx, ry, 30, 2).concat([ellPts(x, y, rx, ry, 30, 2)[0]]), 1.1, mixCol(F.ink, o.water || '#3C5480', .3), 'inkfine', .5);
}
// transitions ---------------------------------------------------------------
// Every seam gets one (rule 6). These are all called with the shot's local time.
function wipeOut(lt, D, dur, cols) { const p = seg(lt, D - dur, D - dur * .5); if (p > 0) brushWipe(p, cols); }
function wipeIn(lt, dur = .8, cols) { const p = seg(lt, 0, dur * .5); if (p > 0 && p < 1) brushWipe(.5 + p, cols); }
function irisIn(lt, dur = .8, cx = W * .5, cy = H * .5, col) { const p = seg(lt, 0, dur); if (p < 1) iris(cx, cy, (1 - p) * W * 1.3, col || F.ink); }
function irisOut(lt, D, dur = .9, cx = W * .5, cy = H * .5, col) { const p = seg(lt, D - dur, D); if (p > 0) iris(cx, cy, ease(p) * W * 1.3, col || F.ink); }
function fadeIn(lt, dur = .7, col) { const p = seg(lt, 0, dur); if (p < 1) flash(1 - p, col || F.ink); }
function fadeOut(lt, D, dur = .8, col) { const p = seg(lt, D - dur, D); if (p > 0) flash(ease(p), col || F.ink); }
// a vertical dissolve of the shot's own last frame is not possible here (pure functions),
// so a fade through a colour that belongs to the story is the safe seam.
