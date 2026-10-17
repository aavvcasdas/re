// karaoke.js: brush-font karaoke with a character-by-character fill, drawn on the 2D compositor through
// window.overlayHook in core.js (crisp, above the paper grain). At 960×540 the bar sits at y ≈ 512.
//
// LY = [[start, end, "line", opts?]]. Times come from assets/song.lrc (song time = clip time; the film
// uses the whole track). opts.sing = seconds the line takes to sing (the fill speed); opts.hold keeps a
// line up after it ends, lifted above the next one (KTV style).
const LY = [
  [0.06, 3.15, '那天你在雨后街角答应接受我的爱', { sing: 2.9 }],
  [3.15, 5.67, '那一刻我的世界有了色彩', { sing: 2.3 }],
  [5.67, 8.16, '这一生无法忘记关于澄蓝色的你', { sing: 2.3 }],
  [8.16, 10.68, '像一份礼物悄然呈现在我的境遇', { sing: 2.35 }],
  [10.68, 13.23, '我们从清晨起玩一整天游戏', { sing: 2.35 }],
  [13.23, 15.87, '到夜晚一起看我最爱的剧', { sing: 2.4 }],
  [15.87, 17.97, '能够拥有这些已足够幸运', { sing: 1.95 }],
  [17.97, 20.79, '我已经不再期待其他什么东西', { sing: 2.5 }],
  [20.79, 23.31, '我们也经常争执互相不接电话', { sing: 2.35 }],
  [23.31, 25.86, '在同一房间终于呼叫冷漠抵达', { sing: 2.35 }],
  [25.86, 28.41, '也曾想过以后生活没有人牵挂', { sing: 2.35 }],
  [28.41, 30.99, '把爱扔掉只剩一块残酷伤疤', { sing: 2.35 }],
  [30.99, 33.78, '而那些你送我的梦 教我折的花', { sing: 2.55 }],
  [33.78, 35.01, '逃亡的盛夏', { sing: 1.05 }],
  [35.01, 37.56, '在夜空隐没之际 为我点燃烟花', { sing: 2.35 }],
  [37.56, 40.17, '寂寞时让我把快乐拼起来吧', { sing: 2.4 }],
  [40.17, 42.69, '我们之间的回忆', { sing: 2.3 }],
  [42.69, 45.21, '全部都小心地收集', { sing: 2.3 }],
  [45.21, 47.73, '我总是偷偷地哭泣', { sing: 2.3 }],
  [47.73, 50.31, '像倦鸟失了归期', { sing: 2.35 }],
  [50.31, 52.80, '但愿我相信的爱情', { sing: 2.28 }],
  [52.80, 55.29, '结局紧握在我手心', { sing: 2.28 }],
  [55.29, 60.69, '时光匆匆却没有遗失过去', { sing: 3.4, hold: 1.6 }],
  [60.69, 65.76, '我们可以就像是孩子一样成长', { sing: 3.6 }],
  [65.76, 70.86, '永远无所畏惧义无反顾向着未知的前方', { sing: 3.8 }],
  [70.86, 75.87, '原来我们每天努力长成看似大人的模样', { sing: 3.7 }],
  [75.87, 80.83, '为了可以一起跨越山和海洋', { sing: 3.4, hold: 1.8 }],
  [101.10, 106.17, '那时的我每天都祈祷实现这个梦想', { sing: 3.8, hold: 7.5 }],
];
const KFONT = '"Ma Shan Zheng", "Kaiti SC", "STKaiti", serif';
window.EXTRA_FONTS = [[`30px ${KFONT}`, LY.map(l => l[2]).join('')]];
// 尺寸都是按 960×540 的画布定的:字 30px,条子 512 高
const KY = 512, KF = 30;

window.overlayHook = (c, t) => {
  const i = LY.findIndex(l => t >= l[0] && t < l[1]);
  // a line with opts.hold stays up after its time, lifted and shrunk above the next one (two-row KTV style)
  const P = LY.find(l => l[3] && l[3].hold && t >= l[1] && t < l[1] + l[3].hold);
  if (P) { const a = t - P[1], k = ease(a / .15); kLine(c, P, t, KY - 54 * k, 1 - .28 * k, 1 - ease((a - (P[3].hold - .3)) / .3), true); }
  if (i >= 0) kLine(c, LY[i], t, KY, 1, 1, false);
};
function kLine(c, L, t, y, sc, alpha, held) {
  const [a, b, txt, opt = {}] = L;
  const grow = held ? 1 : easeOut((t - a) / .18) * (opt.hold ? 1 : 1 - ease((t - (b - .1)) / .1));
  if (grow < .02 || alpha <= .01) return;
  c.save(); c.globalAlpha = alpha; c.translate(480, y); c.scale(sc, sc); c.translate(-480, -y);
  c.font = `${KF}px ${KFONT}`; c.textBaseline = 'middle'; c.textAlign = 'left';
  const total = c.measureText(txt).width;
  // the bar: a ragged ink lozenge that grows from the centre and boils with the linework
  const w = (total + 60) * grow, x0 = 480 - w / 2, y0 = y - 24, r = n => hash(BOILN * 13 + n) * 4 - 2;
  c.globalAlpha = .86 * alpha; c.fillStyle = PAL.ink; c.beginPath();
  c.moveTo(x0 + r(1), y0 + r(2)); c.lineTo(x0 + w / 2, y0 - 3 + r(3)); c.lineTo(x0 + w + r(4), y0 + r(5));
  c.lineTo(x0 + w + 8, y0 + 23); c.lineTo(x0 + w + r(6), y0 + 46 + r(7)); c.lineTo(x0 + w / 2, y0 + 48 + r(8));
  c.lineTo(x0 + r(9), y0 + 46 + r(10)); c.lineTo(x0 - 8, y0 + 23); c.closePath(); c.fill();
  c.globalAlpha = alpha;
  if (grow > .85) {
    // characters fill left to right as they're sung (opt.sing = how long the line takes to sing)
    const n = [...txt].length, singDur = opt.sing ?? Math.min((b - a) * .85, n * .15), f = held ? 1 : clamp((t - a) / singDur);
    const x = 480 - total / 2;
    c.fillStyle = PAL.cream; c.fillText(txt, x, y);
    c.save(); c.beginPath(); c.rect(x - 2, y - 25, total * f + 2, 50); c.clip(); c.fillStyle = PAL.ochre; c.fillText(txt, x, y); c.restore();
    if (opt.pun && t > opt.pun.at) pun(c, txt, x, y, opt.pun, t - opt.pun.at);
  }
  c.restore();
}

// Strike through `from` with a red brush stroke, then pop `to` in above it, tilted, in gold with an ink shadow.
function pun(c, txt, x, y, p, age) {
  const i = txt.indexOf(p.from); if (i < 0) return;
  const px = x + c.measureText(txt.slice(0, i)).width, pw = c.measureText(p.from).width;
  const k = easeOut(age / .25);
  c.save(); c.strokeStyle = '#D8394E'; c.lineCap = 'round'; c.lineWidth = 5;
  c.beginPath(); c.moveTo(px - 4, y + 3);
  for (let j = 1; j <= 8; j++) { const q = j / 8 * k; c.lineTo(px - 4 + (pw + 8) * q, y + 3 - 6 * q + Math.sin(j * 1.7) * 1); }
  c.stroke(); c.restore();
  const pop = backOut(clamp((age - .2) / .35)); if (pop <= .01) return;
  c.save(); c.translate(px + pw / 2 + 5, y - 44); c.rotate(-.12 + Math.sin(age * 14) * .04 * Math.exp(-age * 2)); c.scale(pop, pop);
  c.font = `48px ${KFONT}`; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.lineJoin = 'round'; c.lineWidth = 7; c.strokeStyle = PAL.ink; c.strokeText(p.to, 0, 0);
  c.fillStyle = PAL.ink; c.fillText(p.to, 3, 3);
  c.fillStyle = '#F4B63A'; c.fillText(p.to, 0, 0);
  c.restore();
}
