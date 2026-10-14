// s11.js — 时差 · bars 23–26 · 58.630 – 66.224 s · the split frame: his night, your day
// The seam opens into the split the whole film has been walking toward: one frame, two times. Left,
// his night — the room, the window, him on the cushion under it with the box. Right, your day — the
// same sea at noon, and 你 walking away along it, smaller every bar. Five stitches still hold the
// two halves together; they pop one per beat from beat 97. On the last line he pushes one fragment
// across the seam into your day, and 你 stops.
//
// reads: ① 58.6–61.8 the split: night left, day right, 你 walking away; five stitches across the seam
//        ② 61.8–64.9 the stitches pop one per beat (L19 on the first pop); each half flinches a little
//        ③ 64.9–66.2 he pushes one scrap across the seam; it lands in your sand; 你 stops (L20)
//        out: a sheet of paper takes the frame → s12
(() => {
  const [T0, T1] = SHOT(10), D = T1 - T0;
  const SX = W / 2;                                        // the seam
  const POP0 = B(97);                                      // 61.792
  const PUSH = B(102);                                     // 64.956
  const HZ = 236, SAND = H * .70;
  const seamW = () => 0;                                   // (width computed per frame)

  shots([[T0, (t, lt) => {
    const sw = lerp(26, 7, ease(seg(lt, 0, .8)));
    const seamL = SX - sw / 2, seamR = SX + sw / 2;
    const pops = Math.floor(seg(t, POP0, POP0 + 5 * BEAT + .001) * 5.0001);
    camBegin(SX + 4 * Math.sin(t * .4), 284, 1.04);

    // ---- LEFT: his night --------------------------------------------------
    room(t, { window: true, frame: false, lampK: .9, winX: 60, winW: 210 });
    dust(t, { x: 260, y: 260, rx: 180, ry: 110, n: 8, k: .7 });
    sitBase(280, 442, 26);
    const mood = emotions(t, [[T0, 'sad', { lookX: .5, lookY: .3 }], [PUSH, 'determined', { lookX: .8, lookY: .2 }]]);
    const aR = kf(t, [[T0, -.5], [PUSH - .5, -.5], [PUSH, .8], [PUSH + .8, .3], [T1, .2]]);
    clawd(280, 442, 26, { ...mood, view: 'q', flip: false, noLegs: true, aL: -.6, aR,
                          armR: (u, s2) => { boilSeed('pushhand'); paint(ellPts(0, 0, u * .6, u * .48, 10, 1.4), { wash: PAL.clay, ink: SC.ink, sw: s2 * .6 }); },
                          dy: (mood.dy || 0), sq: (mood.sq || 0) + .05, boilKey: 'me' });
    sitLegs(280, 442, 26);
    boxAt(t, 120, 434, 1.0, .45);
    floorScraps(t, { n: 5, x: 96, y: 448, spread: 150 });
    floorLampAt(t, 420, 472, .9);

    // ---- RIGHT: your day ---------------------------------------------------
    boilSeed('daysky');
    slab(seamR, -120, W - seamR + 60, HZ * .55 + 120, SC.skyHi, 2);
    slab(seamR, HZ * .5, W - seamR + 60, HZ * .5, SC.skyLo, 2);
    slab(seamR, HZ - 2, W - seamR + 60, (H - HZ) * .32 + 2, SC.seaDk, 2);
    slab(seamR, HZ + (H - HZ) * .28, W - seamR + 60, (H - HZ) * .36, SC.sea, 2);
    slab(seamR, HZ + (H - HZ) * .60, W - seamR + 60, H + 120, SC.seaLt, 2);
    slab(seamR, SAND, W - seamR + 60, H + 120, SC.sand, 2);
    ln([[seamR, HZ], [W + 40, HZ]], 1.1, SC.inkSoft, 'inkfine', .05);
    boilSeed('daysun');
    paint(ellPts(800, 84, 30, 30, 22, 1), { wash: SC.sun, washOp: 255, ink: null });
    glow(800, 84, 170, '#FFE0A0', .5);
    boilSeed('dayfoam');
    for (let i = 0; i < 3; i++) {
      const ph = (bpOf(t) / 8 + i * .33) % 1, y = HZ + (H - HZ) * (.24 + ph * .5);
      wobLine(seamR + 10, W + 30, y, 3, t * .5 + i, SC.foam, 2, 7);
    }
    // 你, walking away along the water, a little smaller every bar — and stopping at the very end
    const walk = ease(seg(t, T0 + .4, PUSH + .7));
    const yx = lerp(640, 800, walk), yu = lerp(23, 19, walk), yy = lerp(474, 452, walk);
    const stop = seg(t, PUSH + .7, PUSH + 1.0);
    you(yx, yy, yu, { view: 'q', flip: false, ...emotions(t, [[T0, 'sad', { lookX: .6 }], [PUSH + .9, 'surprised', { lookX: -.8, lookY: .7 }]]),
                      aL: -.3 + Math.sin(t * 6) * .12 * (1 - stop), aR: -.3 - Math.sin(t * 6) * .12 * (1 - stop),
                      dy: -Math.abs(Math.sin(t * 6)) * .12 * (1 - stop), boilKey: 'you' });

    // the fragment he pushes across, from his night into your sand
    const pk = ease(seg(t, PUSH, PUSH + .9));
    if (pk > 0) {
      const fx = lerp(352, 600, pk), fy = lerp(430, 448, pk) - Math.sin(pk * Math.PI) * 26;
      frag(t, fx, fy, 16, lerp(.4, -.2, pk), 21, { col: SC.frag, edge: true, ink: SC.inkSoft, sw: .9 });
      if (pk >= 1) glow(600, 446, 60, '#FFE4B0', .25);
    }

    // ---- the seam: torn edge, and the stitches popping ---------------------
    boilSeed('seamedge');
    const edge = [];
    for (let i = 0; i <= 14; i++) edge.push([SX + (hash(i * 7.7) - .5) * sw * 1.6, -20 + (H + 40) * i / 14]);
    paint(ribbon(through(edge, 8), sw * .5, sw * .35), { wash: SC.fragLt, washOp: 220, ink: null });
    for (let i = 0; i < 5; i++) {
      const y = 108 + i * 88;
      if (i < pops) {                                      // popped: two threads, dangling
        boilSeed('pop' + i);
        ln([[seamL - 26, y], [seamL - 4, y + 10]], 1.1, SC.fragDk, 'inkfine', 0);
        ln([[seamR + 26, y + 2], [seamR + 5, y + 12]], 1.1, SC.fragDk, 'inkfine', 0);
        sparkle(t, SX, y, 14, t - (POP0 + i * BEAT), .3);
      } else {
        boilSeed('stitchhold' + i);
        stitch([[seamL - 30, y], [seamR + 30, y + 2]], '#5A4A3E', 1.7, 8, 5);
      }
    }
    camEnd();
    tearIn(lt, .6, [SC.frag, SC.fragDk]);                  // in: the sheet from s10's seam drags off
    tearOut(lt, D, .6, [SC.frag, SC.fragDk]);              // out: a sheet takes the frame for s12
  }]]);
})();
