// s1.js — 空房间 (bars 0–4, 0.0–6.0 s)
// The room before anybody is in it: a table set for one, a cake with cold candles, the night in the
// window. Clawd comes in from the left, crosses the floor on the beat and stops at the table.
//
// reads: ① a warm room at night, one small cake waiting
//        ② he walks in, feet landing on the beat
//        ③ he stops, sees the cake, and lifts: this is going to be good
(() => {
  const [T0, T1] = SHOT(0), D = T1 - T0, FY = H * .74;
  const TX = W * .665, TY = H * .885, S = W * .056;
  shots([[T0, (t, lt) => {
    camBegin(W * .5, H * .50, lerp(1.045, 1.0, ease(seg(lt, 0, D))));
    room(t, { fy: FY });
    // moonlight through the window lies on the floor; the room stays cool until the candles are lit
    warmPool(W * .775, FY - H * .015, W * .20, .85, '#C3D6E8');
    // Clawd: in from the left, stopping short of the table
    const st = stroll(t, .9, D - .8, -W * .10, TX - W * .335, 22);
    const host = emotions(t, [[0, 'neutral'], [3.3, 'hopeful'], [4.8, 'surprised'], [5.4, 'happy', { emote: 'spark' }]]);
    // table first, so the cake sits on it and he (drawn after) stays in front of the room behind him
    const top = tableAt(TX, TY, W * .30);
    cakeAt(t, TX, top - S * .52, S, 0, { candles: 3, seed: 2 });
    clawd(st.x, FY + H * .150, 24, { ...host, view: st.view, flip: st.flip, walk: st.walk, dy: (host.dy || 0) + st.dy, boilKey: 'host' });
    // dust turning in the moonbeam, and the wall clock's second hand (the only thing moving in the room)
    boilSeed('motes');
    for (let i = 0; i < 7; i++) {
      const ph = frac(t * .09 + hash(i * 5.1)), mx = W * .60 + hash(i * 2.7) * W * .34;
      dotAt(mx + Math.sin(t * .5 + i) * 9, lerp(H * .30, FY, ph), 1.6, F.cream, 150 * Math.sin(ph * Math.PI));
    }
    camEnd();
    fadeIn(lt, .7);
  }]]);
})();
