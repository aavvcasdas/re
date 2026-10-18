// _lib.js — 《潮汐·留灯》 shared visual language.
// Original direction: salt-print / paper-cut tide atlas, not the flat space-box look of the reference clip.
// All marks are hand-built p5.brush paths; functions are deterministic at t and use the shared paper grain.
const BEAT_S = 60 / 70.3;
const GRID0 = 0.430;                 // measured onset grid: ~70.3 BPM, beat 0.8535 s
const beatNo = n => GRID0 + n * BEAT_S;
const CUTS = [0, beatNo(5), beatNo(9), beatNo(14), beatNo(19), beatNo(24), beatNo(28), beatNo(33),
  beatNo(38), beatNo(43), beatNo(47), beatNo(52), beatNo(57), beatNo(62), 55.983];
const BAR = BEAT_S * 4;

const F = {
  paper: '#E9DFC7', paperHi: '#F3E9D4', ink: '#183244', ink2: '#274B5A',
  deep: '#102B3B', deep2: '#1B4051', sea: '#286F7A', sea2: '#438F91', seaLite: '#9AB9A7',
  foam: '#D6D7BC', sand: '#C9B98E', moss: '#687D65', mossLite: '#96A078',
  rust: '#C75B4D', rustDk: '#883D43', coral: '#DF8164', coralLite: '#F0B17D',
  mist: '#A9C1B8', shell: '#D3D2BA', shellDk: '#708B8D', gold: '#D9A64F', goldLite: '#F1CE7E',
  plum: '#5C5368', rain: '#718A96', cloud: '#9CAEB0', red: '#B74F4B'
};

const HERO_U = 30, RAY_U = 29;
const LYRIC_BEATS = [0, 5, 9, 14, 19, 24, 28, 33, 38, 43, 47, 52, 57];

function fillFrame(col, op = 255) {
  paint(rectPts(-40, -40, W + 80, H + 80, 0), { wash: col, washOp: op, ink: null });
}
function cutPoly(pts, col, op = 255, outline = null, sw = 1) {
  paint(pts, { wash: col, washOp: op, ink: outline, sw, curv: .1 });
}
function slab(x, y, w, h, col, j = 2, op = 255) {
  paint(rectPts(x, y, w, h, j), { wash: col, washOp: op, ink: null });
}
function ln(pts, sw = 1, col = F.ink, brush = 'inkfine', curv = .65) {
  inkLine(pts, sw, col, brush, curv);
}
function dotAt(x, y, r, col, op = 255) {
  if (r <= 0) return;
  paint(ellPts(x, y, r, r * .9, 12, .35), { wash: col, washOp: op, ink: null });
}

// A cut-paper sea sheet. The uneven upper edge is the tide; the long bottom is intentionally off-canvas.
function waterSheet(y, thick, t, col, amp = 12, phase = 0, ink = null) {
  const top = [], bottom = [], N = 14;
  for (let i = 0; i <= N; i++) {
    const x = -80 + (W + 160) * i / N;
    const w = Math.sin(i * .72 + t * .46 + phase) * amp + Math.sin(i * 1.43 - t * .25 + phase) * amp * .28;
    top.push([x, y + w]);
    bottom.push([x, y + w + thick]);
  }
  cutPoly(top.concat(bottom.reverse(), [[W + 80, H + 80], [-80, H + 80]]), col, 255, null);
  if (ink) ln(top, .8, ink, 'inkfine', .7);
  return top;
}
function tideTrace(y, t, amp, phase, col = F.seaLite, sw = .85, x0 = -30, x1 = W + 30) {
  const p = [];
  for (let i = 0; i <= 18; i++) {
    const x = lerp(x0, x1, i / 18);
    p.push([x, y + Math.sin(i * .65 + phase + t * .55) * amp + Math.sin(i * 1.21 - t * .27) * amp * .24]);
  }
  ln(p, sw, col, 'inkfine', .72);
  return p;
}
function contourSet(cx, cy, rx, ry, count, col = F.ink2, t = 0, sw = .8, phase = 0) {
  boilSeed(`contour-${Math.round(cx)}-${Math.round(cy)}-${count}`);
  for (let n = 0; n < count; n++) {
    const k = .52 + n * .18, pts = [];
    for (let i = 0; i <= 40; i++) {
      const a = i / 40 * TAU;
      const wob = 1 + .025 * Math.sin(a * 5 + phase + t * .25 + n) + .012 * Math.sin(a * 9 - t * .31);
      pts.push([cx + Math.cos(a) * rx * k * wob, cy + Math.sin(a) * ry * k * wob]);
    }
    ln(pts, sw * (n % 3 === 0 ? 1.2 : .82), col, 'inkfine', .4);
  }
}
function spiralLines(cx, cy, t, turns = 2.4, radius = 260, col = F.seaLite) {
  boilSeed('spiral-current');
  for (let bandN = 0; bandN < 4; bandN++) {
    const pts = [], phase = bandN * 1.1;
    for (let i = 0; i <= 90; i++) {
      const q = i / 90, a = q * turns * TAU + phase + t * .16;
      const r = 18 + q * radius;
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r * .72]);
    }
    ln(pts, bandN === 0 ? 1.25 : .8, bandN % 2 ? F.ink2 : col, 'inkfine', .25);
  }
}
function registrationMark(x, y, r = 7, col = F.gold) {
  ln([[x - r, y], [x + r, y]], .75, col, 'inkfine', 0);
  ln([[x, y - r], [x, y + r]], .75, col, 'inkfine', 0);
  dotAt(x, y, 1.6, col, 230);
}
function flecks(t, n, x0, x1, y0, y1, col, drift = 8, size = 2) {
  boilSeed(`flecks-${Math.round(x0)}-${n}`);
  for (let i = 0; i < n; i++) {
    const x = x0 + hash(i * 4.71 + 2) * (x1 - x0) + Math.sin(t * .38 + i * 2) * drift;
    const y = y0 + hash(i * 8.13 + 9) * (y1 - y0) + Math.sin(t * .28 + i) * drift * .4;
    const r = size * (.55 + hash(i * 5.4) * .8);
    dotAt(x, y, r, col, 120 + 110 * (.5 + .5 * Math.sin(t * 1.7 + i)));
  }
}

// The main character is an original seed-shaped tide sprite (not the source video's box character).
function seedSprite(x, ground, u, t, o = {}) {
  boilSeed(`seed-${o.key || 'main'}`);
  const phase = o.phase || 0, bob = Math.sin(t * 2.15 + phase) * u * .055;
  const face = o.face || 'quiet', dir = o.flip ? -1 : 1, fill = o.col || F.rust;
  const tilt = o.tilt || 0, reach = o.reach || 0, fade = o.fade || 0;
  push(); translate(x, ground + bob); scale(dir, 1); rotate(tilt + .015 * Math.sin(t * 1.6 + phase));
  // Dry, offset shadow and the ribbon-like wake.
  paint(ellPts(0, 3 * u, 2.1 * u, .24 * u, 20, 1), { wash: F.ink, washOp: 52, ink: null });
  const wake = [[-.38 * u, -1.08 * u], [-1.15 * u, -.83 * u], [-1.65 * u, -.45 * u], [-1.92 * u, -.70 * u], [-2.12 * u, -.56 * u]];
  ln(wake, 1.15, o.wake || F.coral, 'inkfine', .76);
  // Feet and arms are drawn before the body; their asymmetry gives the pose a hand-animated read.
  const stride = o.step ? Math.sin(t * 8 + phase) * .34 * u : Math.sin(t * .9 + phase) * .08 * u;
  ln([[-.27 * u, -.35 * u], [-.38 * u + stride, .10 * u], [-.58 * u + stride, .18 * u]], 1.2, F.ink, 'inkfine', .42);
  ln([[.28 * u, -.35 * u], [.38 * u - stride, .10 * u], [.57 * u - stride, .18 * u]], 1.2, F.ink, 'inkfine', .42);
  const armLift = reach * .66 + .12 * Math.sin(t * 2.7 + phase);
  ln([[-.58 * u, -1.55 * u], [-.97 * u, -1.30 * u + armLift * u], [-1.12 * u, -1.07 * u + armLift * u]], 1.35, F.ink, 'inkfine', .55);
  ln([[.58 * u, -1.55 * u], [.92 * u, -1.30 * u - armLift * u], [1.08 * u, -1.05 * u - armLift * u]], 1.35, F.ink, 'inkfine', .55);
  // Pear/seed body, printed in a warm plate with a cool registration shadow.
  const body = [[0, -3.22 * u], [.55 * u, -2.88 * u], [.82 * u, -2.25 * u], [.78 * u, -1.48 * u], [.57 * u, -.61 * u], [.27 * u, -.25 * u], [-.30 * u, -.25 * u], [-.64 * u, -.64 * u], [-.84 * u, -1.48 * u], [-.78 * u, -2.28 * u], [-.52 * u, -2.88 * u]];
  const main = body.map(([a, b]) => [a, b]);
  paint(main.map(([a, b]) => [a + 2.3, b + 1.1]), { wash: F.rustDk, washOp: 215, ink: null, curv: .12 });
  paint(main.map(([a, b]) => [a, b]), { wash: mixCol(fill, F.paper, fade * .58), ink: F.ink, sw: 1.45, curv: .18 });
  // Offset cut-paper plane / etched marks.
  paint([[-.68 * u, -2.26 * u], [-.33 * u, -2.92 * u], [-.05 * u, -3.08 * u], [-.08 * u, -1.32 * u], [-.32 * u, -.58 * u], [-.62 * u, -.77 * u]],
    { wash: mixCol(fill, F.rustDk, .30), washOp: 180, ink: null, curv: .12 });
  for (let i = 0; i < 4; i++) {
    const yy = (-2.28 + i * .36) * u;
    ln([[-.66 * u, yy], [-.46 * u, yy - .08 * u], [-.24 * u, yy - .04 * u]], .48, mixCol(fill, F.ink, .38), 'inkfine', .3);
  }
  // Leaf tuft, a small ember / compass needle.
  paint([[-.06 * u, -3.12 * u], [-.58 * u, -3.58 * u], [-.10 * u, -3.48 * u], [.30 * u, -3.79 * u], [.27 * u, -3.22 * u]],
    { wash: F.gold, ink: F.ink, sw: .9, curv: .12 });
  ln([[-.16 * u, -3.26 * u], [.18 * u, -3.58 * u]], .65, F.rustDk, 'inkfine', .4);
  // Face changes are drawn, never swapped as labels.
  const eyeY = -2.13 * u;
  if (face === 'happy' || face === 'relieved') {
    ln([[-.32 * u, eyeY], [-.21 * u, eyeY - .09 * u], [-.10 * u, eyeY]], 1.45, F.ink, 'inkfine', .55);
    ln([[.10 * u, eyeY], [.21 * u, eyeY - .09 * u], [.32 * u, eyeY]], 1.45, F.ink, 'inkfine', .55);
  } else {
    dotAt(-.22 * u, eyeY, .095 * u, F.ink, 255);
    dotAt(.22 * u, eyeY, .095 * u, F.ink, 255);
    if (face === 'sad' || face === 'overwhelmed') {
      ln([[-.34 * u, eyeY - .18 * u], [-.18 * u, eyeY - .12 * u]], .85, F.ink, 'inkfine', .2);
      ln([[.18 * u, eyeY - .12 * u], [.34 * u, eyeY - .18 * u]], .85, F.ink, 'inkfine', .2);
    }
  }
  if (face === 'surprised') paint(ellPts(0, -1.74 * u, .11 * u, .15 * u, 12), { wash: F.ink, ink: null });
  else if (face === 'sad' || face === 'overwhelmed') ln([[-.11 * u, -1.78 * u], [0, -1.86 * u], [.12 * u, -1.77 * u]], 1.05, F.ink, 'inkfine', .55);
  else ln([[-.11 * u, -1.83 * u], [0, -1.76 * u], [.12 * u, -1.83 * u]], 1.05, F.ink, 'inkfine', .5);
  dotAt(-.47 * u, -1.81 * u, .11 * u, F.coralLite, 140);
  dotAt(.47 * u, -1.81 * u, .11 * u, F.coralLite, 140);
  // Small chest-glow can be dimmed when the sprite gives too much of itself away.
  const chest = (o.heart || .5) * (1 - fade * .65);
  if (chest > .01) {
    dotAt(0, -1.12 * u, .17 * u, F.gold, 210 * chest);
    if (chest > .7) glow(0, -1.12 * u, .9 * u, F.goldLite, .14 * chest);
  }
  if (o.crack) {
    ln([[.32 * u, -2.48 * u], [.12 * u, -2.21 * u], [.31 * u, -2.02 * u], [.06 * u, -1.78 * u]], .85, F.ink, 'inkfine', .2);
  }
  pop();
}

// The companion is an original folded-paper ray / shell, with rib lines and a trailing fin.
function raySprite(x, ground, u, t, o = {}) {
  boilSeed(`ray-${o.key || 'main'}`);
  const phase = o.phase || 2.2, bob = Math.sin(t * 1.8 + phase) * u * .08;
  const wing = Math.sin(t * 2.45 + phase) * .10 * u, fill = o.col || F.mist, face = o.face || 'quiet';
  push(); translate(x, ground + bob); if (o.flip) scale(-1, 1); rotate((o.tilt || 0) + .025 * Math.sin(t * 1.1 + phase));
  // A split tail trails behind the ray.
  ln([[0, -.17 * u], [-.08 * u, .45 * u], [.24 * u, .92 * u], [.06 * u, 1.22 * u]], 1.1, F.ink2, 'inkfine', .6);
  ln([[.06 * u, .72 * u], [-.20 * u, .98 * u]], .7, F.ink2, 'inkfine', .45);
  paint(ellPts(0, 1.6 * u, 2.0 * u, .21 * u, 20, 1), { wash: F.ink, washOp: 40, ink: null });
  // Fan silhouette: wings flex on alternating keys, not as a mirrored rectangle.
  const p = [[-1.85 * u, -1.02 * u], [-1.38 * u, -1.50 * u + wing], [-.78 * u, -1.36 * u], [-.30 * u, -1.00 * u], [0, -.94 * u], [.38 * u, -1.08 * u], [.88 * u, -1.42 * u - wing], [1.48 * u, -1.49 * u], [1.90 * u, -1.03 * u], [1.40 * u, -.55 * u], [.72 * u, -.24 * u], [0, -.12 * u], [-.68 * u, -.26 * u], [-1.38 * u, -.57 * u]];
  paint(p.map(([a, b]) => [a + 1.8, b + 1.2]), { wash: F.shellDk, washOp: 190, ink: null, curv: .1 });
  paint(p, { wash: mixCol(fill, F.paperHi, o.fade ? o.fade * .5 : 0), ink: F.ink, sw: 1.35, curv: .15 });
  // Wing panels and ribbed paper creases.
  paint([[-1.65 * u, -1.02 * u], [-1.10 * u, -1.25 * u], [-.52 * u, -.91 * u], [-.89 * u, -.55 * u], [-1.38 * u, -.60 * u]], { wash: mixCol(fill, F.sea, .32), ink: null, curv: .12 });
  paint([[.54 * u, -.96 * u], [1.16 * u, -1.29 * u], [1.70 * u, -1.02 * u], [1.34 * u, -.61 * u], [.84 * u, -.57 * u]], { wash: mixCol(fill, F.sea, .25), ink: null, curv: .12 });
  for (let i = -2; i <= 2; i++) {
    const ex = i * .58 * u, ey = -1.17 * u - (2 - Math.abs(i)) * .08 * u;
    ln([[0, -.82 * u], [ex * .52, ey], [ex, -.58 * u]], .65, mixCol(F.ink2, fill, .24), 'inkfine', .52);
  }
  if (face === 'happy') {
    ln([[-.25 * u, -.73 * u], [-.13 * u, -.82 * u], [0, -.73 * u]], 1.2, F.ink, 'inkfine', .55);
    ln([[.09 * u, -.73 * u], [.21 * u, -.82 * u], [.34 * u, -.73 * u]], 1.2, F.ink, 'inkfine', .55);
  } else {
    dotAt(-.20 * u, -.77 * u, .08 * u, F.ink, 255); dotAt(.22 * u, -.77 * u, .08 * u, F.ink, 255);
    if (face === 'sad') ln([[-.31 * u, -.94 * u], [-.13 * u, -.87 * u]], .7, F.ink, 'inkfine', .1);
  }
  ln([[-.08 * u, -.50 * u], [0, -.55 * u], [.11 * u, -.50 * u]], .9, F.ink, 'inkfine', .45);
  // Three little scallop marks make the silhouette legible even at a wide.
  for (let i = 0; i < 3; i++) {
    const xx = (-.30 + i * .30) * u;
    ln([[xx, -.22 * u], [xx + .08 * u, -.08 * u], [xx + .16 * u, -.22 * u]], .55, F.sea, 'inkfine', .45);
  }
  if (o.glow) glow(0, -.77 * u, 2.0 * u, F.goldLite, .22 * o.glow);
  pop();
}

function sproutAt(x, y, scale, grow, t) {
  const k = ease(clamp(grow));
  if (k <= 0) return;
  const h = scale * k;
  ln([[x, y], [x + Math.sin(t * .7) * 4, y - h]], 1.3, F.moss, 'inkfine', .6);
  for (let i = 0; i < 4; i++) {
    const s = i < 2 ? -1 : 1, q = i % 2, yy = y - h * (.28 + q * .31);
    const end = [x + s * h * (.44 + .05 * Math.sin(t + i)), yy - h * .22];
    const leaf = [[x, yy], [x + s * h * .20, yy - h * .25], end, [x + s * h * .11, yy + h * .02]];
    paint(leaf, { wash: i % 2 ? F.seaLite : F.mossLite, ink: F.ink2, sw: .6, curv: .1 });
  }
  dotAt(x + Math.sin(t * 1.2) * 3, y - h, 3.5, F.gold, 180 * k);
}
function leafCanopy(x, y, len, t, col = F.moss, lean = 1) {
  const sway = Math.sin(t * .8 + x * .01) * 12;
  const p = [[x, y], [x + lean * len * .22, y - len * .35], [x + lean * len * .66 + sway, y - len * .72],
    [x + lean * len * 1.02 + sway, y - len * .76], [x + lean * len * .76 + sway, y - len * .48],
    [x + lean * len * .34, y - len * .20], [x, y]];
  paint(p, { wash: col, ink: F.ink2, sw: .8, curv: .15 });
  ln([[x, y], [x + lean * len * .42, y - len * .42], [x + lean * len * .99 + sway, y - len * .75]], .75, mixCol(F.ink2, col, .38), 'inkfine', .55);
}
function shellBellAt(x, y, r, t, open = 1, light = 0) {
  const lift = open * r * .32;
  const lower = [[x - r, y], [x - r * .92, y - r * .18], [x - r * .66, y - r * .52], [x - r * .34, y - r * .72],
    [x, y - r * .78 - lift], [x + r * .38, y - r * .66], [x + r * .70, y - r * .48], [x + r, y], [x + r * .48, y + r * .13], [x, y + r * .18], [x - r * .48, y + r * .13]];
  paint(lower.map(([a, b]) => [a + 2, b + 2]), { wash: F.rustDk, washOp: 210, ink: null });
  paint(lower, { wash: F.shell, ink: F.ink, sw: 1.3, curv: .1 });
  const hinge = [x, y - r * .76 - lift];
  for (let i = -3; i <= 3; i++) {
    const xx = x + i * r * .19;
    ln([[x, y + r * .10], [lerp(x, xx, .55), y - r * .48], [xx, y - r * (.60 + .08 * (3 - Math.abs(i))) - lift * .55]], .55, F.shellDk, 'inkfine', .48);
  }
  paint(ellPts(x, y + r * .08, r * .20, r * .10, 14, .3), { wash: F.gold, ink: null });
  if (light > .01) {
    glow(x, hinge[1], r * 1.75, F.goldLite, .33 * light);
    for (let i = 0; i < 4; i++) dotAt(x + Math.sin(t * .9 + i * 1.6) * r * .95, y - r * (.7 + .13 * Math.cos(t + i)), 2.5, F.goldLite, 150 * light);
  }
}
function bloomAt(cx, cy, age, r, col = F.coral) {
  if (age < 0 || age > 3.2) return;
  const open = ease(clamp(age / .86)), fade = 1 - ease(clamp((age - 1.55) / 1.55));
  boilSeed('salt-bloom');
  // Rounded salt-coral lobes, like a soft pressed sea anemone — not radial firework spokes.
  for (let i = 0; i < 7; i++) {
    const a = i / 7 * TAU - Math.PI / 2 + .08 * Math.sin(age * 1.7 + i * 1.6);
    const len = r * (.34 + .56 * open) * (.80 + .20 * hash(i * 5.7));
    const cx2 = cx + Math.cos(a) * len * .53, cy2 = cy + Math.sin(a) * len * .53;
    const petalLen = len * (.48 + .08 * Math.sin(i * 2.1));
    const petalW = r * (.10 + .015 * Math.sin(age * 2.2 + i)) * open;
    paint(ellPts(cx2, cy2, petalW, petalLen * .5, 18, .8, a - Math.PI / 2), {
      wash: i % 2 ? mixCol(col, F.gold, .22) : col, washOp: 218 * fade, ink: null,
    });
    const stemX = cx + Math.cos(a) * len * .72, stemY = cy + Math.sin(a) * len * .72;
    const branchA = a + (i % 2 ? .48 : -.43);
    ln([[cx + Math.cos(a) * r * .16, cy + Math.sin(a) * r * .16], [stemX, stemY],
      [stemX + Math.cos(branchA) * r * .17 * open, stemY + Math.sin(branchA) * r * .17 * open]], .62, F.moss, 'inkfine', .5);
    if (i % 2 === 0) dotAt(cx + Math.cos(a) * len * .9, cy + Math.sin(a) * len * .9, 2.2, F.goldLite, 205 * fade);
  }
  paint(ellPts(cx, cy, r * .16 * open, r * .13 * open, 18, .7), { wash: F.gold, washOp: 235 * fade, ink: null });
}
function rainStrokes(t, n = 38, col = F.rain, speed = 1) {
  boilSeed('rain-sheet');
  for (let i = 0; i < n; i++) {
    const x = hash(i * 5.3) * W + Math.sin(t * .4 + i) * 18;
    const y = ((hash(i * 8.1) * H + t * 160 * speed) % (H + 40)) - 20;
    ln([[x, y], [x - 7, y + 20 + hash(i * 3) * 12]], .7, col, 'inkfine', .1);
  }
}
function waveMark(x, y, s, col = F.seaLite) {
  ln([[x - s, y], [x - .55 * s, y - .16 * s], [x, y], [x + .55 * s, y + .16 * s], [x + s, y]], .9, col, 'inkfine', .6);
}
function transition(lt, dur, index, colors = [F.deep, F.paperHi]) {
  const edge = .28;
  if (index > 0 && lt < edge) brushWipe(.5 + lt / (2 * edge), colors);
  if (index < 13 && lt > dur - edge) brushWipe((lt - (dur - edge)) / (2 * edge), colors);
}
function vignette(col, alpha) {
  if (alpha > .01) paint(rectPts(-20, -20, W + 40, H + 40, 0), { wash: col, washOp: 255 * clamp(alpha), ink: null });
}

// Reusable environments -----------------------------------------------------
function nightChart(t, warmth = 0) {
  fillFrame(mixCol(F.deep, F.plum, warmth * .35));
  // Broad tidal strata replace the source's tiny spherical world.
  const bands = [
    [[-60, 120], [170, 92], [360, 132], [560, 94], [820, 136], [1020, 102], [1020, 200], [-60, 210]],
    [[-60, 250], [120, 220], [340, 274], [580, 228], [790, 280], [1020, 244], [1020, 370], [-60, 370]],
    [[-60, 390], [170, 348], [360, 405], [610, 365], [840, 418], [1020, 385], [1020, 600], [-60, 600]],
  ];
  bands.forEach((p, i) => cutPoly(p, mixCol([F.deep2, F.sea, F.sea2][i], F.coral, warmth * (.12 + i * .04)), 255, null));
  contourSet(520, 350, 510, 270, 5, mixCol(F.ink2, F.gold, warmth * .6), t, .75, 1.4);
  tideTrace(264, t, 16, .2, mixCol(F.seaLite, F.goldLite, warmth), .75);
  flecks(t, 18, 24, W - 24, 24, H - 110, mixCol(F.shell, F.goldLite, warmth), 8, 1.7);
}
function warmCoast(t, dusk = 0) {
  fillFrame(mixCol(F.paper, F.coralLite, .13 + .18 * dusk));
  cutPoly([[-20, 10], [W + 20, 10], [W + 20, 246], [700, 225], [430, 246], [210, 220], [-20, 244]], mixCol(F.paperHi, F.goldLite, .22 - .08 * dusk), 255, null);
  waterSheet(266, 70, t, mixCol(F.seaLite, F.sea, dusk * .35), 8, 1, mixCol(F.ink2, F.sea, .5));
  waterSheet(330, 100, t, mixCol(F.sea, F.deep2, dusk * .24), 12, 3, null);
  waterSheet(421, 155, t, mixCol(F.sea2, F.sea, .45 + dusk * .2), 10, 5, null);
  for (let i = 0; i < 7; i++) tideTrace(290 + i * 31, t + i * .12, 3.2, i * .8, i % 2 ? F.foam : F.goldLite, .55);
  // The light is a brushed horizon reflection rather than a sun/planet.
  const rx = 630 + Math.sin(t * .18) * 40;
  for (let i = 0; i < 5; i++) {
    const w = 45 + i * 16;
    paint(ellPts(rx + Math.sin(t + i) * 7, 274 + i * 20, w, 2.5 + i * .2, 16, .5), { wash: F.goldLite, washOp: 95 - i * 9, ink: null });
  }
}
function tidalPool(t, dark = 0) {
  fillFrame(mixCol(F.paper, F.deep2, dark));
  cutPoly([[-20, 270], [80, 245], [210, 272], [335, 240], [490, 268], [655, 244], [820, 272], [W + 20, 245], [W + 20, H + 30], [-20, H + 30]],
    mixCol(F.sand, F.sea, dark * .35), 255, null);
  waterSheet(300, 245, t, mixCol(F.seaLite, F.sea, dark * .4), 9, .4, null);
  waterSheet(390, 185, t, mixCol(F.sea2, F.deep, dark * .25), 8, 1.8, null);
  for (let i = 0; i < 6; i++) tideTrace(325 + i * 27, t, 3 + i * .25, i * .8, mixCol(F.foam, F.goldLite, (1 - dark) * .18), .5);
}
