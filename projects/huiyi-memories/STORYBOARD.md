# 把回忆拼好给你 — storyboard (as built)

78.881 s = 31 bars @ 94.82 bpm (beat 0.6328 s, first beat 0.415 s). Thirteen shots, every cut on a
bar line. Drawing is on twos (12 drawings/s) with boiling linework; the render samples 12 fps and
duplicates to 24 fps on encode. Karaoke: the 20 LRC lines, each start snapped to its nearest beat,
sung per-character on a torn cream slip at y ≈ 0.865·H (keep key action above y ≈ 0.80·H).

**Logline.** Every memory is a torn piece of paper. He gathers them, assembles them into a picture
(the title: 把回忆拼好给你), gives the picture away as a paper plane into your morning, and keeps
one small piece in the empty frame on the wall. The last shot is the first shot, changed.

## The world (one set, used by S1–S5, S10–S13)

Night room, wall meets floor at y = 330. Cold moon-window LEFT (92, 55, 240×200, curtains drawn
back); empty faded frame on the wall (392, 82, 112×90); warm floor-lamp RIGHT (776, 472, shade top
≈ 236); rug under everything (centre 560, 484); **him on a cushion at (600, 440), u = 30, seated**
(folded-legs slab in front of his hem); shoebox of scraps (366, 430) with its lid leaning left;
stool + cold mug (726, 468). 时差 in one frame: cold light left, warm light right, him between.
He **stands** at (600, 470) in S4, S12, S13. S11 restages the left half tighter: him (280, 442),
box (120, 434), lamp (420, 472), seam at x = 480.

Palette arcs: night (S1–S5, S8–S11 left) → summer (S6) → grey (S7) → night (S8–S9) → night (S10)
→ split night/day (S11) → dawn rising (S12) → morning (S13). The window and the wall carry it.

## Shots, reads, transitions

| # | bars / s | reads | in → out |
|---|---|---|---|
| 1 | 0–2 · 0.42–5.48 | night room; he sorts the box; lifts one scrap (2.55); it is blank; shoulders down + tear on beat 6 (4.21, L2) | fade from ink → the held scrap swings into the lens and covers |
| 2 | 2–4 · 5.48–10.54 | close-up in two hands: the memory inside lights (6.90), dies on beat 12 (8.008, L3); a tear lands (9.55) and the picture runs | the lens scrap shrinks onto this one → tear wipe |
| 3 | 4–7 · 10.54–18.13 | sets it down; turns from lamp to moon (11.2, L5 at 11.17); reaches; scraps lift, hang, settle on bar 6; he rises (15.6), face resolves on beat 25; all trembles and climbs | tear wipe opens → SMASH flash on the bar-7 downbeat |
| 4 | 7–9 · 18.13–23.20 | the room is a storm of paper; shock → resolve (beat 31); one big fragment arcs in and is caught (beat 30), held beside his face at (459, 293); L6 at 21.30 | smash flash → the caught fragment grows and swallows the frame |
| 5 | 9–13 · 23.20–33.32 | the montage: 12 cells (512×288 sheet) wait as dashed outlines; one piece snaps home per beat from 23.95, stitching to neighbours; finished sheet glows; L7/L8/L9 over it | the fragment shrinks off the lens → the sheet grows ×7 past the frame |
| 6 | 13–15 · 33.32–38.38 | inside the picture: summer sea; 你 (322) points the horizon on beat 54, gold tick at the fingertip; he (648) watches 你 on beat 57; a cloud takes the sun | brush wipe opens (sky/cream) → grey brush wipe covers at the cut |
| 7 | 15–17 · 38.38–43.44 | grey sea, rain, cloud lid; he (452) sweeps both arms on beat 63 (L12); the lid parts; one light column on 你 (690); bright scraps stick in it per beat, dark scraps fall outside | grey wipe opens → warm iris closes at the column |
| 8 | 17–19 · 43.44–48.51 | night beach; 你 (330) and him (596) close; on bar 18 (45.98, L14) a gold spark leaves 你's raised hand and climbs in a spiral; both faces up; it swells at the top | warm iris opens → flash inside the swell |
| 9 | 19–21 · 48.51–53.57 | fireworks on the bar lines (gold 48.90, rose 49.14 = L15, teal 50.40, BIG gold 51.03 held, violet 52.30 = L16, teal 52.55); two dark watchers at the tide line; all dies to one ember falling | flash → the ember blooms (lamp-warm) at the cut |
| 10 | 21–23 · 53.57–58.63 | the bloom is the lamp; same cushion, same box; one warm finished scrap (the sea picture) in his hands; L17; he sets it down (56.9); on beat 92 (58.00, L18) a seam of light opens up the middle | lamp-bloom flash → the seam is 26 px wide at the cut |
| 11 | 23–26 · 58.63–66.22 | 时差: left his night (him under the window, box, lamp), right your day (noon sea, 你 walking away, smaller every bar); five stitches across the seam pop one per beat from beat 97 (61.79, L19); on beat 102 (64.96, L20) he pushes one scrap across; 你 stops | tear wipe opens → tear wipe covers |
| 12 | 26–29 · 66.22–73.82 | wordless; dawn up the wall; standing, he folds the sheet: half on bar 26+2 (67.49), half on bar 27+2 (70.02) → a plane; one held breath; THROWN on bar 28 (71.29): across the room, out the window, gone | tear wipe opens → morning blink flash |
| 13 | 29–31 · 73.82–78.88 | inside the window: dawn sky, the plane a speck with a ribbon; pull back: morning room; he pins one small picture into the frame (76.2→77.2); wide — the first composition, all of it changed (box empty, lamp out, frame full) | blink flash → fade to warm cream on the last chord |

Seam rule honoured everywhere: every cut is either a match (the same paper/shape continues across
it: S1→2, S4→5, S5→6, S9→10), a sheet/tear wipe (S2→3, S10→11, S11→12), a wipe (S6→7), an iris
(S7→8), a flash on the beat (S3→4, S8→9, S12→13), or the film's own fade (in from ink, out to cream).

## Checking it

```bash
node render.mjs --sheet=1.0,4.6,7.7,12.7,17.9,21.6,25.2,31.6,35.2,41.2,46.5,51.3,56.5,60.0,64.5,68.0,71.6,76.2 \
                --cols=6 --w=320 --soft-gl --out=out/check/sheet.jpg     # one look at all 13 shots
node render.mjs --strip=17.8:18.5 --cols=6 --w=320 --soft-gl --out=out/check/smash.jpg   # a cut, frame by frame
node render.mjs --crop=300,180,360,240 --sheet=4.6 --soft-gl --out=out/check/face.jpg    # the face, close
ffmpeg -i film.mp4 -vf "select='not(mod(n,96))',scale=318:179,tile=5x4" -frames:v 1 out/check/qa.png  # QA the encode
```

## Build

```bash
node render.mjs --frames --fps=12 --workers=2 --soft-gl        # resumable; 947 unique drawings
ffmpeg -framerate 12 -i out/frames/f%05d.jpg -i assets/song.m4a -map 0:v -map 1:a \
       -c:v libx264 -pix_fmt yuv420p -crf 18 -r 24 -c:a aac -b:a 192k -shortest out/video.mp4
```
