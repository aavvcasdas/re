// s3.js — 无法回到过去 · bars 4–7 · 10.539 – 18.133 s · the two bars of build before the drop
// He sets the blank scrap down among the others, turns away from the lamp and reaches for the moon
// instead. Every scrap on the rug lifts an inch, hangs in the air, and settles back down — nothing
// can be held. He straightens. On the last two bars they all begin to tremble and climb, the lamp
// swells with them, and the film smashes out on the downbeat of bar 7, where the drums come in.
//
// reads: ① 10.5–11.3 the wipe opens on him setting the scrap down
//        ② 11.3–13.1 he turns from the lamp to the window and reaches for the moon (L5, beat 17)
//        ③ 13.1–15.6 the scraps lift, hang, and settle back: he cannot hold them (they land on bar 6)
//        ④ 15.6–16.7 he straightens up; his face goes from grief to resolve (beat 25)
//        ⑤ 16.7–18.13 everything trembles and climbs; the light builds — pure anticipation
//        out: SMASH on the downbeat of bar 7 (18.133), a flash, into the storm
(() => {
  const [T0, T1] = SHOT(2), D = T1 - T0;
  const U = 30, MX = ROOM.meX, MY = ROOM.meY;
  const TURN = [11.20, 11.95];                      // he turns from the lamp (right) to the moon (left)
  const LIFT = [[13.10, 14.20], [14.90, 15.602]];   // up … hang … down, landing exactly on bar 6
  const HARD = B(25);                               // 16.235: the beat his face changes

  shots([[T0, (t, lt) => {
    const build = seg(t, 16.60, T1), turnK = seg(t, TURN[0], TURN[1]);
    const lift = seg(t, LIFT[0][0], LIFT[0][1]) * (1 - seg(t, LIFT[1][0], LIFT[1][1]));
    const trem = Math.max(build, lift * .35);
    // camera: drifts left toward the window with him, then pushes in and shakes as the room fills
    const [ox, oy] = shakeXY(t, 3.2 * build * build);
    const cp = ease(clamp((lt - .7) / 2.4));
    camBegin(lerp(552, 480, cp) + ox, lerp(298, 282, cp) + oy, lerp(1.10, 1.18, ease(build)) + .006 * Math.sin(t * .9));

    room(t, { lampK: 1 + .4 * build });

    // the mood: grief, a thought, then resolve — the take on beat 25 is the turn of the whole film
    const mood = emotions(t, [[T0, 'sad', { lookX: -.55, lookY: .45 }],
                              [11.172, 'thinking', { lookX: -.35, lookY: .1 }],
                              [12.30, 'sad', { lookX: .92, lookY: -.78 }],
                              [HARD, 'determined', { lookX: .62, lookY: -.55 }]]);
    const rise = ease(seg(t, 15.60, 16.30));
    // the near arm puts the scrap down and lets go; the far arm reaches up to the moon
    const aL = kf(t, [[T0, 1.0], [10.75, .5], [11.05, -.60], [13.2, -.75], [16.0, -.35], [T1, .3 + .55 * build]]);
    const aR = kf(t, [[T0, -.55], [12.0, -.55], [13.0, 1.34], [15.3, 1.14], [16.4, -.15], [T1, .45 + .75 * build]]);
    const reachHand = (u, sw) => { boilSeed('reachhand'); paint(ellPts(0, 0, u * .62, u * .5, 12, 1.5), { wash: PAL.clay, ink: SC.ink, sw: sw * .7 }); };
    const heldK = 1 - seg(t, 10.62, 11.05);
    sitBase(MX, MY, U);
    const dyU = (mood.dy || 0) - 1.0 * rise + .25 * lift - .45 * build;
    clawd(MX, MY + rise * 26, U, { ...mood, ...turn(t, TURN[0], TURN[1], .25, -.25), noLegs: rise < .5, aL, aR, armR: reachHand,
                       dy: dyU, sq: (mood.sq || 0) + .05 + .05 * rise,
                       armL: (u, sw) => { if (heldK > .02) frag(t, u * 1.1, 0, u * .9 * heldK, -.3, 7, { col: SC.frag, edge: true, op: 255 * heldK }); },
                       boilKey: 'me' });
    if (rise < .5) sitLegs(MX, MY + dyU * U * .4, U);
    // one tear, when they settle back down and the line ends
    const tage = t - 15.05;
    if (tage > 0 && tage < 1.6) tearDrop(t, MX + (turnK > .5 ? 1.0 : -1.0) * U, MY - 5.05 * U + dyU * U, tage, .9);

    // the floor: the scrap he put down lies with the others, and the lamp swells with the build
    floorScene(t, { boxK: 1, boxS: 1.15, scraps: 10, lift: lift * .55 + build * .42, tremble: trem * 2.4, lamp: 1 + .5 * build });
    boilSeed('heroscrap');
    if (heldK < .98) frag(t, 486, ROOM.boxY + 4, 16, .5, 7, { col: SC.frag, edge: true, op: 255 * (1 - heldK) });
    // a few already in the air by the end: the room is starting to fill
    if (build > .05) fragSwarm(t, { n: Math.round(6 * build), x0: 560, y0: 280, rx: 340, ry: 150, s: 18,
                                    rise: build * .5, spin: .7, seed: 3 });
    camEnd();

    tearIn(lt, .62, [SC.frag, SC.fragDk]);                        // in: the wipe from s2 finishes opening
    if (build > .02) flash(.10 * build * pulse(t, 9), SC.cream);  // the room strobing with the build
    if (lt > D - .16) flash(seg(lt, D - .16, D) * .85, SC.cream); // out: the smash into bar 7
  }]]);
})();
