// demo.js — 画风自检:一个独立循环(不在正片时间轴上),用来确认夜色底、月光、生物光、
// 粉彩线和两个角色在深底上都读得清。渲染:
//   node render.mjs --loop=night --sheet=0.4,1.4,2.4,3.4 --cols=4 --w=480 --soft-gl --out=out/check/style.jpg
// 正片的镜头在 c1..c5.js 里。
(() => {
  LOOPS.night = t => {
    const hz = 330;
    nightSky(t, hz);
    stars(t, 80, 1, 'top', 300);
    cloudAt(230, 96, 190, 34, t, F.haze, 120, 'cd1');
    moonAt(742, 118, 44, t);
    seaAt(t, hz, 1);
    moonRoad(t, 742, hz, 22, 190);
    shoreAt(452, F.sand, { ph: .4, amp: 6 });
    wetSandAt(448);
    sparks(t, 14, 0, W, 360, 520, F.bio, 1, 5);
    hero(392, 470, 20, { ...feel('happy', t), view: 'q' });
    dear(566, 470, 18, { ...feel('hopeful', t), view: 'q', flip: true });
    lanternAt(150, 300, 12, t, { seed: 1, string: true });
    jellyAt(836, 400, 22, t, { seed: 2 });
    birds(t, 3, 60, 150, 180, .9);
  };
  LOOPS.night.len = 4;
})();
