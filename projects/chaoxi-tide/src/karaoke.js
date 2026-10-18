// karaoke.js — 唱词卡拉 OK,逐字金色填充。挂在 window.overlayHook 上(core.js 的 2D 合成层)。
//
// 用户给的 11 行显示行;内部 13 个唱段时间(assets/song.lrc,贴着 118 BPM 的网格)。
// 显示行 = 若干 segs 拼起来:segs = [[t0, t1, '子句'], …],金色按子句各自推进,
// 所以「蓝色的海底 远山的风景」这种两口气的长行,填充会跟着换气走。
const LY = [
  { segs: [[0.04, 1.98, '当海面迎来汹涌的潮汐']] },
  { segs: [[1.98, 4.02, '我奔跑寻找昔日的足迹']] },
  { segs: [[4.02, 6.05, '夕阳下倒影迷人的美丽']] },
  { segs: [[6.05, 8.08, '可我却丢失故事和你']] },
  { segs: [[8.08, 10.12, '你说过向往大海的神秘']] },
  { segs: [[10.12, 12.15, '也憧憬我们遗失的过去']] },
  { segs: [[12.15, 14.69, '分享给大海秘密']] },
  { segs: [[14.69, 16.73, '蓝色的海底'], [16.73, 19.02, '远山的风景']] },
  { segs: [[19.02, 22.83, '我们的距离 遥不可及']] },
  { segs: [[22.83, 24.86, '退守的爱情'], [24.86, 26.64, '还剩下回忆']] },
  { segs: [[26.64, 29.20, '疯狂的寻觅 你的身影']], hold: 2.3 },  // 末句唱完挂到片尾
];
// 预计算:显示文本 + 每个字的填充时段(fill 时钟映射到子句上)
for (const L of LY) {
  L.text = L.segs.map(s => s[2]).join(' ');
  L.start = L.segs[0][0];
  L.end = L.segs[L.segs.length - 1][1];
  L.chars = [];  // [{ch, t0, t1}] — 空格也占位,但不计填充宽度以外的东西
  for (const [a, b, txt] of L.segs) {
    const cs = [...txt], n = cs.length, dur = (b - a) * .92;
    cs.forEach((ch, i) => L.chars.push({ ch, t0: a + dur * i / n, t1: a + dur * (i + 1) / n }));
  }
}
const KFONT = '"Ma Shan Zheng", "Kaiti SC", "STKaiti", serif';
window.EXTRA_FONTS = [[`30px ${KFONT}`, LY.map(l => l.text).join('')]];
const KY = 512, KF = 30;   // 960×540 画布:字 30px,条子 y=512

window.overlayHook = (c, t) => {
  // 当前行永远优先;hold 的上一行缩小抬到上一行的位置,像 KTV 双行
  const cur = LY.find(L => t >= L.start && t < L.end);
  const prev = LY.find(L => t >= L.end && t < L.end + (L.hold ?? .45));
  if (prev) {
    const a = t - prev.end, k = ease(clamp(a / .15));
    kLine(c, prev, t, KY - 54 * k, 1 - .28 * k, 1 - ease(clamp((a - ((prev.hold ?? .45) - .35)) / .35)), true);
  }
  if (cur) kLine(c, cur, t, KY, 1, 1, false);
};
function kLine(c, L, t, y, sc, alpha, held) {
  if (alpha <= .01) return;
  const txt = L.text;
  const grow = held ? 1 : easeOut((t - L.start) / .18);
  if (grow < .02) return;
  c.save(); c.globalAlpha = alpha; c.translate(480, y); c.scale(sc, sc); c.translate(-480, -y);
  c.font = `${KF}px ${KFONT}`; c.textBaseline = 'middle'; c.textAlign = 'left';
  const total = c.measureText(txt).width;
  // 条子:边缘毛糙的墨色椭圆,从中心长出来,和线条一起 boil
  const w = (total + 60) * grow, x0 = 480 - w / 2, y0 = y - 24, r = n => hash(BOILN * 13 + n) * 4 - 2;
  c.globalAlpha = .86 * alpha; c.fillStyle = PAL.ink; c.beginPath();
  c.moveTo(x0 + r(1), y0 + r(2)); c.lineTo(x0 + w / 2, y0 - 3 + r(3)); c.lineTo(x0 + w + r(4), y0 + r(5));
  c.lineTo(x0 + w + 8, y0 + 23); c.lineTo(x0 + w + r(6), y0 + 46 + r(7)); c.lineTo(x0 + w / 2, y0 + 48 + r(8));
  c.lineTo(x0 + r(9), y0 + 46 + r(10)); c.lineTo(x0 - 8, y0 + 23); c.closePath(); c.fill();
  c.globalAlpha = alpha;
  if (grow > .85) {
    // 逐字填充:按 L.chars 的时段推进(两口气的行会跟着换气停一下)
    const x = 480 - total / 2;
    c.fillStyle = PAL.cream; c.fillText(txt, x, y);
    let cx = x;
    for (const ch of L.chars) {
      const cw = c.measureText(ch.ch).width;
      if (t >= ch.t1) { c.fillStyle = PAL.ochre; c.fillText(ch.ch, cx, y); }
      cx += cw;
    }
    // 中间态:当前字按进度裁一半(用裁剪画,保证笔画完整)
    const cur = L.chars.find(ch => t >= ch.t0 && t < ch.t1);
    if (cur && !held) {
      const i = L.chars.indexOf(cur);
      const xw = x + L.chars.slice(0, i).reduce((s, ch) => s + c.measureText(ch.ch).width, 0);
      const cw = c.measureText(cur.ch).width, f = clamp((t - cur.t0) / (cur.t1 - cur.t0));
      c.save(); c.beginPath(); c.rect(xw - 1, y - 25, cw * f + 2, 50); c.clip();
      c.fillStyle = PAL.ochre; c.fillText(cur.ch, xw, y); c.restore();
    }
    if (held) { c.fillStyle = PAL.ochre; c.fillText(txt, x, y); }
  }
  c.restore();
}
