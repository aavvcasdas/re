// s4.js — 大海的秘密 (bars 22–28, 56.8–72.3 s)
// The last light. She stands in the shallows with the shell held to her ear; the sea
// answers — a ring of ripples walks outward from her feet, and the light on the water
// gathers into one line that points out to sea.
//
// reads: ① she is standing in the water, holding the shell to her ear ② the water answers:
//        ripples spread out from her, a line of light draws away toward the horizon ③ she looks up
(() => {
  const [T0, T1] = SHOT(3), D = T1 - T0;
  const hz = H * .44, gx = W * .34, gy = H * .695;
  shots([[T0, (t, lt) => {
    const listen = ease(seg(lt, .5, D * .35));
    const answer = ease(seg(lt, D * .42, D - .4));
    camBegin(gx + W * .02, H * .54, 1.12 + .05 * lt / D);
    seascape(t, { hz, sky: ['#F5CFA2', '#EFBB89', '#E8A06C', '#DE8756'], sea: ['#5C7E9C', '#6B8CA6', '#7A9BB2'], sand: F.wetSand, sandY: .78, sandWob: 5, sandPh: .5, dry: F.drySand });
    headland(hz, { x: W * .04, w: W * .34, h: H * .040, sky: F.dusk[2] });
    moonAt(W * .74, hz - H * .055, H * .042, { halo: .5, col: '#FFF0CE', key: 's4sun' });
    glitter(t, W * .74, hz + 3, gy - H * .02, '#FFE7BC', .8);
    waves(t, hz, 3, { col: F.inkSoft, light: '#F6DFC2', amp: .8 });
    // the waterline foam, and the rings that answer her
    boilSeed('foam4');
    bandEdge(-60, W + 60, u => H * .78 + 6 * Math.sin(u * 3.1 + t * .5) + jit(3), '#F1E7D2', 9, 2, 170);
    ripples(t * (1 + answer * .6), gx, gy + H * .012, { n: 5, spread: W * .10, r0: W * .012, speed: .22, col: '#F6EEDC', key: 's4', flat: .20 });
    // the line of light drawn out to sea on the new ripples
    if (answer > .02) {
      for (let i = 0; i < 12; i++) {
        boilSeed('answer' + i);
        const u = i / 11, k = ease(clamp((answer - i * .045) / .5));
        const y = lerp(gy - H * .01, hz + 4, u), w = W * (.012 + .05 * u);
        paint(ellPts(lerp(gx, W * .62, u * answer), y, w * k, 1.6 + 2.4 * u * k, 10, .8),
              { wash: '#FFF2D8', washOp: 180 * k, ink: null });
      }
    }
    // her: shell to the ear, head tipping up as the sea answers
    girl(gx, gy, H * .255, {
      dress: '#EFE3CE', hair: '#39334A', hairSway: .3 + .25 * Math.sin(lt * .7),
      armL: .10 + .06 * Math.sin(lt * .8), armR: .88 + .10 * answer, lean: .02, breath: 1,
      head: -.30 * (1 - answer) + .18 * answer, holding: 'shell',
    });
    boilSeed('shell4');
    scallop(gx + H * .044, gy - H * .148, H * .012, .3, { col: '#F0A98E', key: '4' });
    boilSeed('gref4');
    paint(ellPts(gx + H * .006, gy + H * .012, H * .030, H * .012, 20, 1.4), { wash: '#B9A180', washOp: 110, ink: null });
    camEnd();
    irisIn(lt, .9, gx, gy - H * .1, '#E8A06C');
  }]]);
})();
