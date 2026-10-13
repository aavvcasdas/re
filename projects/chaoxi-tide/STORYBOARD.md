# 潮汐 — storyboard

**Song:** 《潮汐 (Natural)》 — IN-K / 安苏羽 / 傅梦彤, 词 安苏羽·舒心, 4/4, 93 BPM, B♭ minor.
**Film:** 9 shots, 165.2 s (64 bars), 24 fps, 960×540, hand-painted in code (p5.js + p5.brush, rendered frame by frame in headless Chromium, encoded with ffmpeg).

**Logline.** Clawd walks a coast where he once walked with someone; the sea keeps
taking the footprints he is following — so he gathers what it will let him keep
(a shell), and the tide gives him back only the sky.

**One world, one arc.** One beach at nine hours of light: **dusk → sunset → night →
before dawn → sunrise**. The whole film is painted from one palette ramp (`F` in
`src/scenes/_lib.js`); the sky/sea colours carry the emotional arc, so the film changes
temperature as the song does.

**The motif.** Footprints and their erasure. They open the film, follow him through it
(shot 2: he finds them, shot 7: his own), and end as the only marks left on the sand.
The shell is the second motif — the one thing the sea gives back instead of taking.

**The protagonist is Clawd.** The figure on the sand is the Claude Code mascot: the blocky box with four stub
legs and slit eyes from `src/clawd.js`, the same kit that paints the engine's `views` and `emotions` model sheets.
He is kept three-quarters from behind for most of the film — the song is addressed to someone who is not there,
so the audience stays behind him, looking where he looks — and turns to face us only where it costs something:
when the shell comes up out of the sand (shot 2), when the water answers him (shot 4), and at the last pool
(shot 9). `src/scenes/_lib.js` wraps him for the shots as `wanderer(x, y, h, o)`.

## The shots

| # | bars | time | shot | the reads |
|---|---|---|---|---|
| 1 | 0–8 | 0.0–20.7 | **潮线** — dusk. A trail of prints leads from the near sand down to the water; he walks the tide line along it; the water slides up and takes the trail behind his. | ① a wide dusk coast, one line of prints leading toward the sea ② he walks the trail, seen from behind, going away ③ the water slides up and erases the prints, one by one |
| 2 | 8–16 | 20.7–41.3 | **寻找昔日的足迹** — he runs the length of the trail, prints growing under his feet as he goes; at the end the trail stops and he kneels to a shell half-buried in the sand. | ① a line of prints crossing the frame ② he runs in after them, shrinking into the distance ③ the prints stop: he stops, kneels, and takes a shell out of the sand |
| 3 | 16–22 | 41.3–56.8 | **夕阳下倒影** — the low sun laid across the shallow water as a ladder of light; he walks through it and it breaks under his feet and closes behind him. | ① the low sun and its ladder of light ② he steps into the reflection ③ the reflection shatters under his and closes again — he is the only one in it |
| 4 | 22–28 | 56.8–72.3 | **分享给大海秘密** — he stands in the shallows holding the shell to his ear; the water answers: rings walk outward from his feet and a line of light draws away toward the horizon. | ① he stands in the water, the shell to his ear ② the water answers in rings, and a line of light draws out to sea ③ he lifts his head |
| 5 | 28–32 | 72.3–82.6 | **蓝色的海底** — under the surface. The shell falls past the camera, turning, into deeper blue, while the light above closes to a coin. | ① we are underwater: blue, light, the surface overhead ② the shell falls past us, turning ③ it shrinks into the deep and the light above closes |
| 6 | 32–40 | 82.6–103.3 | **远山的风景 / 我们的距离遥不可及** — a wide sea, land far off on both sides; the shell drifts away from us between them, and the two shores pull apart. | ① a wide sea, land far off left and right ② the shell drifts away on the water ③ the shores pull apart — the distance opens and stays open |
| 7 | 40–48 | 103.3–123.9 | **退守的爱情 / 还剩下回忆** — night. He draws two figures in the wet sand with a stick; a wave comes up the beach and takes one of them. | ① night beach, he kneels drawing in the sand ② two figures stand in the sand ③ the water slides up and erases one ④ he looks at what is left; the tide keeps coming |
| 8 | 48–56 | 123.9–144.5 | **疯狂的寻觅你的身影** — he crosses the whole frame walking the beach with a lamp, and the sea takes his own prints as he passes. | ① the night coast, one small figure walking with a light ② the prints behind his are his own, and the water takes them ③ he stops, looks out at the water, and goes on |
| 9 | 56–64 | 144.5–165.2 | **残月忧郁 星夜静谧 潮落叹息** — the tide is out; the moon and stars stand in every pool. He kneels at the biggest one; the wind takes the surface; the moon slides out of the water and only the sky stays. | ① the tide is out: pools on the sand, the moon and stars in each ② he kneels to the big pool; his reflection beside the moon's ③ the wind breaks the surface; the moon goes out of the pool, and only the sky stays |

**Ending rhymes with the opening:** shot 1 opens on a line of prints being taken by the
water at dusk; shot 9 ends on the marks that are left at dawn — the same beach, the same
line on the sand, no longer moving.

## How the images are made (rules kept)

- **Handmade:** flat gouache-ish `wash` shapes for everything (backgrounds, the figure,
  props) plus thin real-brush linework (`ink`/`inkfine` strokes) for edges, waves,
  footprints, the figure's stub legs and the two figures he draws in the sand. Paper texture under and film grain
  over, both from the kit — so nothing looks vector-clean.
- **The figure is painted flat on purpose:** `PROJECT.flat` folds each watercolour `fill` (and its hatch) into
  the wash under it, so Clawd costs ~1.4 s a frame instead of ~8.9 s. Same silhouette, same palette, one pass.
- **No text anywhere** in the picture. The film carries no captions; the song's lines are
  acted, not written.
- **Nothing is still:** camera drifts in every shot, wave lines ride the beat (`pulse`),
  the linework boils at 12 fps, the foam edge breathes on each beat, gulls cross.
- **Transitions at every seam:** brush wipes (1→2, 2→3), a fade through the sunset colour
  (3→4), a fade into blue (4→5) and out of it (5→6), an iris (6→7), a fade to night
  (7→8), an iris out (8→9), and an iris to the moon to close.
- **The beat is the song's:** `PROJECT.bpm = 93`, `BAR = 2.581 s`; every shot boundary,
  every foam push and the lamp's flicker land on the grid.

## Performance note

A 960×540 frame costs ~1.6 s of CPU here because the renderer runs on SwiftShader (no
GPU): the cost is the number of brush dabs and the WebGL readback, not the canvas size.
Backgrounds are therefore flat washes (a few ms each) and only edge work uses strokes.
Measurements and the two engine changes that made a full-length film affordable are in
`tools/README-perf.md`.
