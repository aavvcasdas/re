// s6.js — 远山的风景 / 我们的距离遥不可及 (bars 32–40, 82.6–103.25 s)
// On the water. The shell (with its secret written on it) drifts away from the camera
// between two far headlands; the gap between them opens as it goes.
//
// reads: ① a wide sea with land far off on both sides ② the shell drifts away from us,
//        small on the water ③ the two shores pull apart — the distance opens and stays open
(() => {
  const [T0, T1] = SHOT(5), D = T1 - T0;
  const hz = H * .40;
  shots([[T0, (t, lt) => {
    const drift = ease(seg(lt, .4, D - .5));
    camBegin(W * .5, H * .56, 1 - .06 * drift + .03 * lt / D);   // camera eases back: the gap widens
    seascape(t, { hz, sky: F.morning, sea: ['#4E7C94', '#5E8FA6', '#6FA2B6'], sand: null,
                  hzCol: '#4A5A66', hzSw: 1.2 });
    // two headlands, one on each side, drifting apart with the camera
    const gap = .10 + .16 * drift;
    headland(hz, { x: W * (.02 - gap + .10), w: W * .30, h: H * .050, sky: F.morning[1], col: mixCol('#3C4860', '#7C94A0', .22) });
    headland(hz, { x: W * (.74 + gap - .10), w: W * .36, h: H * .070, sky: F.morning[1], col: mixCol('#36425A', '#748C98', .16) });
    // a nearer ridge, lower, on the left, for depth
    headland(hz + H * .012, { x: W * (.00 - gap * .5), w: W * .22, h: H * .038, sky: F.morning[1], col: mixCol('#303C52', '#6E8894', .12) });
    waves(t, hz, 7, { col: '#3C4E62', light: '#CFE0E0', amp: 1.05 });
    // the shell on the water, drifting away, with its ring
    const sy = lerp(H * .72, hz + H * .06, drift), sx = lerp(W * .40, W * .52, drift) + W * .02 * Math.sin(lt * .6);
    const sr = lerp(W * .045, W * .011, drift);
    scallop(sx, sy, sr * .78, .1 + drift * .5, { col: '#F0A98E', key: '6' });
    ripples(t, sx, sy + sr * .5, { n: 3, spread: W * .05, r0: sr * 1.2, speed: .35, col: '#EAF2EE', key: 's6', flat: .18 });
    // its wake: a thin line of foam behind it, pointing back at where it came from
    boilSeed('wake');
    ln([[sx + sr * 1.6, sy + sr * .8], [lerp(sx, W * .34, .5), sy + H * .035], [W * .26, sy + H * .062]], .8, '#E4EEE8', 'inkfine', .6);
    // gulls over the gap, and one boat far away (the far world carries on)
    gull(t * 1.2, W * .62, hz - H * .10, W * .008, { flap: 4.5 });
    gull(t * 1.35, W * .70, hz - H * .07, W * .006, { flap: 5.2, ph: 1.4 });
    paperBoat(W * .30 + W * .01 * Math.sin(lt * .3), hz + H * .012, W * .007, 0, { belt: 1 });
    camEnd();
    fadeIn(lt, .9, '#C9D8DE');
    irisOut(lt, D, 1.0, W * .52, hz + H * .10, '#CEDCDE');
  }]]);
})();
