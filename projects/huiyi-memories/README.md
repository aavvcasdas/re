# 把回忆拼好给你 — a painted music video

A hand-painted p5.js / p5.brush animation for 《把回忆拼好给你》 (cici_ 版; 词 Douji-T / 中文词 Yvette,
曲 Douji-T / Shingo.S), built on the `painted-animation` skill in this repository. 78.88 s —
exactly 31 bars of the beat at 94.82 bpm — cut on bar lines, with every lyric line of the LRC
beat-snapped and sung on screen as a torn paper slip.

**The finished film is in the repo: [film.mp4](film.mp4)** (78.9 s, 960×540 @ 24 fps, with the beat).

**The one image the film is built on:** a room with a cold moon-window on the left and one warm
lamp on the right, and between them a box of torn paper. Every memory in the song is a fragment of
paper; the film is him gathering them, and the title is the plot — *把回忆拼好给你*: he assembles
them into a picture, gives the picture away as a paper plane into your morning, and keeps one small
piece in the empty frame on the wall. The last shot is the first shot, changed.

## The thirteen shots

| # | bars | s | what happens |
|---|---|---|---|
| 1 | 0–2 | 0.42–5.48 | night room; he picks up one scrap; it is blank; a tear |
| 2 | 2–4 | 5.48–10.54 | close-up: the memory inside it lights up, dies, and a tear makes it run |
| 3 | 4–7 | 10.54–18.13 | he reaches for the moon; the scraps lift and will not stay; the build |
| 4 | 7–9 | 18.13–23.20 | SMASH: the room is a storm of paper; he catches the one worth catching |
| 5 | 9–13 | 23.20–33.32 | the montage: twelve pieces snap home on the beat into a picture of the sea |
| 6 | 13–15 | 33.32–38.38 | inside the picture: summer, 你 pointing at the whole sea; a cloud takes the sun |
| 7 | 15–17 | 38.38–43.44 | the grey years; he sweeps the cloud apart; one column of light on 你 |
| 8 | 17–19 | 43.44–48.51 | night beach; the un-said sentence leaves 你's hand as a spark and climbs |
| 9 | 19–21 | 48.51–53.57 | fireworks on the bar lines; all of it dies back to one falling ember |
| 10 | 21–23 | 53.57–58.63 | the ember is the lamp; he sets the finished picture down; a seam of light opens |
| 11 | 23–26 | 58.63–66.22 | 时差: one frame, two times — his night / your day; the stitches pop; he pushes one scrap across |
| 12 | 26–29 | 66.22–73.82 | wordless: he folds the picture into a plane and throws it out of the window into dawn |
| 13 | 29–31 | 73.82–78.88 | the plane, a speck; one small picture into the empty frame; the first room, in morning light |

Full read-by-read notes, transitions and the checking commands: [STORYBOARD.md](STORYBOARD.md).

## Timing

Everything is on the song's grid (`src/config.js`): bpm 94.82, beat 0.6328 s, first beat at 0.415 s,
bars of four. `src/scenes/_lib.js` exposes `B(beat)` and `BARt(bar)` so cuts and actions land on the
music; `src/karaoke.js` holds the 20 LRC lines, each start snapped to its nearest beat, drawn as a
torn cream slip with per-character ink as it is sung. The drawing itself is "on twos" (12 drawings
a second) with boiling linework, per the skill.

## Run it

```bash
npm install
# scrub any moment in Chrome:
open studio.html
# contact sheet / strip / crop checks:
node render.mjs --sheet=1.0,4.6,18.3,33.5 --cols=4 --w=400 --soft-gl --out=out/check/sheet.jpg
# the film (frames are resumable; 12 unique drawings a second, duplicated to 24 fps on encode):
node render.mjs --frames --fps=12 --workers=2 --soft-gl
ffmpeg -framerate 12 -i out/frames/f%05d.jpg -i assets/song.m4a -map 0:v -map 1:a \
       -c:v libx264 -pix_fmt yuv420p -crf 18 -r 24 -c:a aac -b:a 192k -shortest out/video.mp4
```

Without a GPU, add `--soft-gl` (software WebGL). The engine renders flat 960×540 with flat washes
(no watercolour fills), which keeps it at ~0.1 s of drawing per frame even in software.

## What is here

| path | what it is |
|---|---|
| [STORYBOARD.md](STORYBOARD.md) | the film, shot by shot, with reads, transitions and check commands |
| [src/config.js](src/config.js) | length (78.881 s = 31 bars), bpm, beat offset |
| [src/core.js](src/core.js) | painting, timing, motion, camera, light, paper, grain |
| [src/clawd.js](src/clawd.js) | Clawd: views, emotions, eyes, arms and hooks |
| [src/karaoke.js](src/karaoke.js) | the LRC lines, beat-snapped, as a torn singing slip |
| [src/scenes/_lib.js](src/scenes/_lib.js) | the world: the room, the sea, weather, fireworks, fragments, transitions |
| [src/scenes/s1.js…s13.js](src/scenes/) | the thirteen shots |
| [render.mjs](render.mjs) | headless renderer: sheets, strips, crops, frames, MP4 |
| [assets/](assets) | the beat (song.m4a), the lyrics, the bundled fonts |
