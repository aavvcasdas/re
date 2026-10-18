// karaoke.js — 唱词卡拉 OK。挂在 window.overlayHook 上(core.js 的 2D 合成层,画在纸纹之上)。
//
// 这一部的唱词条和上一部完全不同:上一部是「墨色牌子 + 逐字填金」;这一部是夜色里的**月光刻字** ——
// 没有牌子,字直接落在夜上,底下只有一道随唱词生长的月光细线,线头挂一弯小月牙当游标,
// 唱过的字从粉笔白转成月金,字外面有一层很淡的光晕(深底上才看得清)。
//
// 用户给的 11 行显示行;内部 13 个唱段时间(assets/song.lrc,贴着 118 BPM 的网格)。
// 显示行 = 若干 segs 拼起来:segs = [[t0, t1, '子句'], …],填充按子句各自推进,
// 所以「蓝色的海底 远山的风景」这种两口气的长行,填充会跟着换气走。
//
// 56 s 这一版音频在 31.8 s 之后还有 24 s 唱段,但那一段的唱词没有给到,
// 所以 LY 只覆盖已确认的 11 行(0–31.8 s);之后是纯画面的终章。
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
  { segs: [[26.64, 29.20, '疯狂的寻觅 你的身影']], hold: 2.3 },  // 末句唱完挂到终章开头
];
// 预计算:显示文本 + 每个字的填充时段(fill 时钟映射到子句上)
for (const L of LY) {
  L.text = L.segs.map(s => s[2]).join(' ');
  L.start = L.segs[0][0];
  L.end = L.segs[L.segs.length - 1][1];
  L.chars = [];  // [{ch, t0, t1}] — 空格也占位
  for (const [a, b, txt] of L.segs) {
    const cs = [...txt], n = cs.length, dur = (b - a) * .92;
    cs.forEach((ch, i) => L.chars.push({ ch, t0: a + dur * i / n, t1: a + dur * (i + 1) / n }));
  }
}
const KFONT = '"Ma Shan Zheng", "Kaiti SC", "STKaiti", serif';
window.EXTRA_FONTS = [[`30px ${KFONT}`, LY.map(l => l.text).join('')]];
const KY = 498, KF = 30;   // 960×540 画布:字 30px,基线 y=498(比上一部高一点,底下留给月光线)
const K_WHITE = '#EEF3FF', K_GOLD = '#FFCE72', K_LINE = '#CBD9FF';

window.overlayHook = (c, t) => {
  // 当前行永远优先;hold 的上一行缩小抬到上一行的位置,像 KTV 双行
  const cur = LY.find(L => t >= L.start && t < L.end);
  const prev = LY.find(L => t >= L.end && t < L.end + (L.hold ?? .45));
  if (prev) {
    const a = t - prev.end, k = ease(clamp(a / .15));
    kLine(c, prev, t, KY - 52 * k, 1 - .30 * k, 1 - ease(clamp((a - ((prev.hold ?? .45) - .35)) / .35)), true);
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
  const total = c.measureText(txt).width, x = 480 - total / 2;

  // 唱到哪儿了(0..1),月光线和月牙都跟着它走
  const span = L.chars.length ? (L.chars[L.chars.length - 1].t1 - L.chars[0].t0) : 1;
  const prog = held ? 1 : clamp((t - L.chars[0].t0) / span);

  // 1) 月光细线:从左端长到 prog,两头尖(用二次曲线画,不用矩形)
  const ly = y + 24, lw = total * grow, lx0 = 480 - lw / 2, tip = 9;
  if (lw > 4) {
    c.save();
    c.globalAlpha = .85 * alpha;
    c.strokeStyle = K_LINE; c.lineWidth = 1.6; c.lineCap = 'round';
    c.beginPath(); c.moveTo(lx0, ly); c.quadraticCurveTo(480, ly + 3.4, lx0 + lw, ly); c.stroke();
    // 已经唱过的那一段更亮
    c.globalAlpha = alpha; c.lineWidth = 2.2; c.strokeStyle = K_GOLD;
    c.beginPath();
    const steps = 24, upto = Math.max(2, Math.round(steps * prog));
    for (let i = 0; i <= upto; i++) {
      const q = i / steps, px = lx0 + lw * q, py = ly + 3.4 * 2 * q * (1 - q) * 2 / 2;
      i ? c.lineTo(px, ly + Math.sin(q * Math.PI) * 3.4) : c.moveTo(px, ly);
    }
    c.stroke();
    // 线头的小月牙(游标)
    const hx = lx0 + lw * prog, hy = ly + Math.sin(prog * Math.PI) * 3.4;
    c.globalAlpha = alpha; c.fillStyle = K_GOLD;
    c.beginPath(); c.arc(hx, hy, 4.6, 0, Math.PI * 2); c.fill();
    c.globalCompositeOperation = 'destination-out';
    c.beginPath(); c.arc(hx + 2.6, hy - 1.6, 4.1, 0, Math.PI * 2); c.fill();
    c.globalCompositeOperation = 'source-over';
    c.restore();
  }

  // 2) 字:先一层淡光晕(深底上才读得清),再粉笔白,唱过的转月金
  if (grow > .85) {
    c.save();
    c.globalAlpha = .30 * alpha; c.fillStyle = '#9FB6FF';
    for (const [dx, dy] of [[-1.4, 0], [1.4, 0], [0, -1.4], [0, 1.4]]) c.fillText(txt, x + dx, y + dy);
    c.restore();

    c.globalAlpha = alpha;
    c.fillStyle = K_WHITE; c.fillText(txt, x, y);
    let cx = x;
    for (const ch of L.chars) {
      const cw = c.measureText(ch.ch).width;
      if (t >= ch.t1) { c.fillStyle = K_GOLD; c.fillText(ch.ch, cx, y); }
      cx += cw;
    }
    // 中间态:当前字按进度裁一半(用裁剪画,保证笔画完整)
    const cur = L.chars.find(ch => t >= ch.t0 && t < ch.t1);
    if (cur && !held) {
      const i = L.chars.indexOf(cur);
      const xw = x + L.chars.slice(0, i).reduce((s, ch) => s + c.measureText(ch.ch).width, 0);
      const cw = c.measureText(cur.ch).width, f = clamp((t - cur.t0) / (cur.t1 - cur.t0));
      c.save(); c.beginPath(); c.rect(xw - 1, y - 25, cw * f + 2, 50); c.clip();
      c.fillStyle = K_GOLD; c.fillText(cur.ch, xw, y); c.restore();
    }
    if (held) { c.fillStyle = K_GOLD; c.fillText(txt, x, y); }
  }
  c.restore();
}
