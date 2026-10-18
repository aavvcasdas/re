// karaoke.js — one-line lyrics, letter-pressed onto a light paper strip.
// The active characters are overprinted in rust; there is no dark source-style subtitle banner.
// Timings follow the measured ~70.3 BPM grid (0.8535 s/beat), transcribed from the supplied video.
const LY = [
  { start: 0.430, end: 4.697, text: '我们都是渺小真实存在' },
  { start: 4.697, end: 8.111, text: '祈愿小世界里不只有挫败' },
  { start: 8.111, end: 12.379, text: '直到遇见你我以为就光明起来' },
  { start: 12.379, end: 16.646, text: '眼睛里看到的都是广袤无垠的大海' },
  { start: 16.646, end: 20.914, text: '你对我说的情话' },
  { start: 20.914, end: 24.328, text: '在最灰暗的日子你陪着我发呆' },
  { start: 24.328, end: 28.596, text: '有你在的日子里不可能被取代' },
  { start: 28.596, end: 32.863, text: '将快乐全部收集' },
  { start: 32.863, end: 37.131, text: '我却已无法自拔' },
  { start: 37.131, end: 40.545, text: '像转瞬即逝的烟花' },
  { start: 40.545, end: 44.812, text: '只停在绽放一刹那' },
  { start: 44.812, end: 49.079, text: '也为你骗自己放下' },
  { start: 49.079, end: 52.900, text: '爱炙热的你却忘了爱自己' },
];
const KFONT = '"Ma Shan Zheng", "Kaiti SC", "STKaiti", serif';
window.EXTRA_FONTS = [[`30px ${KFONT}`, LY.map(l => l.text).join('')]];
const KY = 503, KF = 29;
window.overlayHook = (c, t) => {
  const L = LY.find(x => t >= x.start && t < x.end);
  if (!L) return;
  const fadeIn = ease(clamp((t - L.start) / .12));
  const fadeOut = 1 - ease(clamp((t - (L.end - .12)) / .12));
  const alpha = fadeIn * fadeOut;
  if (alpha <= .01) return;
  c.save(); c.globalAlpha = alpha;
  c.font = `${KF}px ${KFONT}`; c.textAlign = 'left'; c.textBaseline = 'middle';
  const widths = [...L.text].map(ch => c.measureText(ch).width);
  const total = widths.reduce((a, b) => a + b, 0), scale = Math.min(1, 824 / Math.max(1, total));
  const fontPx = KF * scale; c.font = `${fontPx}px ${KFONT}`;
  const rowWidth = widths.reduce((a, b) => a + b * scale, 0), x = 480 - rowWidth / 2, y = KY;
  const padX = 22, padY = 9, left = x - padX, right = x + rowWidth + padX;
  // Ragged, pale letterpress stock: a different silhouette and value structure from the reference's dark plaque.
  c.beginPath();
  c.moveTo(left + 4, y - 18 - padY); c.lineTo(left + (right - left) * .34, y - 20 - padY);
  c.lineTo(left + (right - left) * .69, y - 17 - padY); c.lineTo(right - 4, y - 19 - padY);
  c.lineTo(right + 2, y - 3); c.lineTo(right - 1, y + 15 + padY); c.lineTo(left + (right - left) * .61, y + 17 + padY);
  c.lineTo(left + (right - left) * .30, y + 15 + padY); c.lineTo(left - 2, y + 18 + padY); c.lineTo(left - 5, y + 2); c.closePath();
  c.fillStyle = 'rgba(243, 233, 212, 0.94)'; c.fill();
  c.lineWidth = 1; c.strokeStyle = 'rgba(39, 75, 90, 0.72)'; c.stroke();
  c.beginPath(); c.moveTo(left + 15, y - 16); c.lineTo(right - 15, y - 16);
  c.strokeStyle = 'rgba(217, 166, 79, 0.55)'; c.lineWidth = 1; c.stroke();
  c.fillStyle = '#183244'; c.fillText(L.text, x, y);
  // A single character-by-character overprint follows the vocal phrase.
  const progress = clamp((t - L.start) / (L.end - L.start));
  const chars = [...L.text], lit = progress * chars.length;
  let cx = x;
  for (let i = 0; i < chars.length; i++) {
    const cw = widths[i] * scale, amount = clamp(lit - i);
    if (amount > 0) {
      c.save(); c.beginPath(); c.rect(cx - 1, y - 19, cw * amount + 2, 38); c.clip();
      c.fillStyle = '#B94F46'; c.fillText(chars[i], cx, y); c.restore();
    }
    cx += cw;
  }
  c.restore();
};
