// karaoke.js — 字幕. The lyric line sits on a torn slip of the same cream paper the whole film is
// painted on, and the characters ink themselves in one by one as the line is sung.
// Drawn through window.overlayHook in core.js: on the 2D compositor, above the paper grain, so the
// words stay crisp at any camera zoom. The band covers y ≈ 0.80–0.93 of the frame while a line shows —
// keep the acting of a shot above it.
//
// LY = [[start, end, "line", opts?]], in CLIP time. This clip starts at 0 s of the song, so clip
// time = song time. Every start is snapped to a beat of the measured grid (94.82 BPM, beat 0 at
// 0.415 s, so beat n = 0.415 + n × 0.632777): the source LRC only has whole seconds, and snapping
// puts each line change exactly on the pulse the picture is cut to. The beat each line sits on is
// in the comment. opts.sing = seconds the line takes to sing (drives the fill); opts.size scales it.
const LY = [
  // ---- intro, bars 0–6: the room before the beat drops
  [0.415, 4.212, '独自收集两个人之间的回忆', { sing: 3.1 }],          // beat 0   (bar 0)
  [4.212, 8.008, '即使每当到这时候我都会哭泣', { sing: 3.1 }],        // beat 6   (bar 1+2)
  [8.008, 9.274, '为何一切', { sing: 1.0 }],                          // beat 12  (bar 3)
  [9.274, 11.172, '变得如此', { sing: 1.1 }],                         // beat 14
  [11.172, 15.602, '无法回到过去', { sing: 2.1 }],                    // beat 17 → held to bar 6
  // ---- verse, bars 8–12: the fragments rise
  [21.297, 23.828, '我们都是渺小真实存在', { sing: 2.2 }],            // beat 33  (bar 8+1)
  [23.828, 26.992, '祈愿小世界里不只有挫败', { sing: 2.6 }],          // beat 37
  [26.992, 30.156, '直到遇见你我以为就光明起来', { sing: 2.6 }],      // beat 42
  [30.156, 33.951, '眼睛里看到的都是广袤无垠的大海', { sing: 3.0 }],  // beat 47
  // ---- chorus A, bars 13–17: the sea
  [33.951, 37.115, '有你在的日子不可能被取代', { sing: 2.6 }],        // beat 53  (bar 13+1)
  [37.115, 40.279, '在最灰暗的日子你陪着我发呆', { sing: 2.6 }],      // beat 58
  [40.279, 42.810, '你让我学会如何拨开阴霾', { sing: 2.2 }],          // beat 63
  [42.810, 45.974, '将快乐全都收集将不开心全都淘汰', { sing: 2.6 }],  // beat 67
  // ---- chorus B, bars 18–25: the fireworks
  [45.976, 49.138, '你对我说的情话', { sing: 2.2 }],                  // beat 72  (bar 18)
  [49.138, 52.302, '像转瞬即逝的烟花', { sing: 2.4 }],                // beat 77
  [52.302, 54.833, '只停在绽放一刹那', { sing: 2.2 }],                // beat 82
  [54.833, 57.997, '我却已无法自拔', { sing: 2.4 }],                  // beat 86
  [57.997, 61.792, '我们的爱总有时差', { sing: 2.6 }],                // beat 91
  [61.792, 64.956, '也为你骗自己放下', { sing: 2.6 }],                // beat 97
  [64.956, 71.287, '爱炙热的你 却忘了爱自己', { sing: 3.6 }],         // beat 102 → held to bar 28
  // ---- outro, bars 28–31: wordless. The plane goes.
];
const KFONT = '"Ma Shan Zheng", "Kaiti SC", "STKaiti", serif';
window.EXTRA_FONTS = [[`64px ${KFONT}`, LY.map(l => l[2]).join('')]];

// The slip: cream paper, torn top and bottom edges that boil with the linework, a soft drop shadow
// so it lifts off the painting, and two stitched ends. `grow` opens it from the centre.
function kSlip(c, w, y, h, grow, seed) {
  const x0 = W / 2 - w / 2, rag = (n, a) => (hash(seed * 7.3 + n) * 2 - 1) * a;
  const N = 14, P = [];
  for (let i = 0; i <= N; i++) { const u = i / N; P.push([x0 + w * u, y - h / 2 + rag(i, 3.4) * grow]); }
  for (let i = N; i >= 0; i--) { const u = i / N; P.push([x0 + w * u, y + h / 2 + rag(i + 40, 4.2) * grow]); }
  c.save();
  c.beginPath(); c.moveTo(P[0][0], P[0][1]);
  for (let i = 1; i < P.length; i++) c.lineTo(P[i][0], P[i][1]);
  c.closePath();
  c.shadowColor = 'rgba(43,34,51,.28)'; c.shadowBlur = 14 * grow; c.shadowOffsetY = 5 * grow;
  c.fillStyle = PAL.cream; c.fill();
  c.shadowColor = 'transparent';
  c.strokeStyle = 'rgba(43,34,51,.5)'; c.lineWidth = 1.6; c.stroke();
  // the torn ends: a notch of the page behind showing through, so it reads as a ripped-off slip
  c.fillStyle = 'rgba(43,34,51,.16)';
  c.beginPath(); c.moveTo(x0 + 1, y - h / 2 + 4); c.lineTo(x0 + 9, y); c.lineTo(x0 + 1, y + h / 2 - 4); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(x0 + w - 1, y - h / 2 + 4); c.lineTo(x0 + w - 9, y); c.lineTo(x0 + w - 1, y + h / 2 - 4); c.closePath(); c.fill();
  c.restore();
}

window.overlayHook = (c, t) => {
  const i = LY.findIndex(l => t >= l[0] && t < l[1]);
  if (i < 0) return;
  const [a, b, txt, opt = {}] = LY[i];
  const IN = 0.22, OUT = 0.18;
  const grow = easeOut((t - a) / IN) * (1 - ease((t - (b - OUT)) / OUT));
  if (grow < 0.02) return;
  const size = (opt.size ?? 34) * (0.86 + 0.14 * grow);
  const y = H * 0.865, n = [...txt].length;
  c.save();
  c.globalAlpha = clamp(grow * 1.4);
  c.font = `${size}px ${KFONT}`; c.textBaseline = 'middle'; c.textAlign = 'left';
  const total = c.measureText(txt).width;
  const w = Math.min(W * 0.96, (total + size * 2.1) * grow), h = size * 1.85;
  // the slip rides the beat: a half-beat breath, so the words are never dead on the page
  const yy = y - 2.2 * pulse(t, 5) * grow;
  kSlip(c, w, yy, h, grow, Math.floor(a * 10) + BOILN);
  if (grow > 0.7) {
    const singDur = opt.sing ?? Math.min((b - a) * 0.85, n * 0.3);
    const f = clamp((t - a) / singDur);
    const x = W / 2 - total / 2;
    // unsung: soft ink. sung: the terracotta of the character who is remembering.
    c.lineJoin = 'round'; c.lineWidth = size * 0.10; c.strokeStyle = 'rgba(255,245,226,.9)';
    c.strokeText(txt, x, yy);
    c.fillStyle = '#6B6272'; c.fillText(txt, x, yy);
    c.save(); c.beginPath(); c.rect(x - 2, yy - h, total * f + 2, h * 2); c.clip();
    c.fillStyle = '#C0503A'; c.fillText(txt, x, yy);
    // the nib that is writing the line right now: a small clay dot on the character being inked
    const cw = total / n, cx = x + cw * (f * n);
    if (f > 0.01 && f < 0.995) {
      c.globalAlpha = 0.85 * clamp(grow);
      c.fillStyle = '#E8AA38';
      c.beginPath(); c.arc(cx, yy + size * 0.46, size * 0.075 + 1.6 * pulse(t, 6), 0, 7); c.fill();
    }
    c.restore();
  }
  c.restore();
};
