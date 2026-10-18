# Reference breakdown — `潮汐.mp4`

## Source facts

- Container: MP4, 1920×1080, 24 fps, 56.00 s.
- Audio: stereo AAC / HE-AACv2, 44.1 kHz; extracted as [`assets/song.mp3`](assets/song.mp3) and also saved as [`潮汐_提取.mp3`](../../潮汐_提取.mp3).
- The old project song was 31.84 s and did not match the new upload. The new build uses the extracted 55.98 s track.
- Onset analysis: about **70.3 BPM**, 0.8535 s per beat, first strong beat at 0.430 s. The 13 visible lyric entries start on beat indices 0, 5, 9, 14, 19, 24, 28, 33, 38, 43, 47, 52 and 57. The cues live in [`assets/song.lrc`](assets/song.lrc).

## What the reference is doing

- A lyric-led, approximately 56-second relationship arc: isolation → meeting → companionship → memory / loss → self-reflection.
- Most caption phrases hold for about 3.4–4.3 seconds. The cutting breathes with the lyric, rather than firing on every beat.
- The visual grammar is deliberately simple: flat, outlined rectangular mascots; a tiny spherical world; lots of indigo negative space; occasional pale horizon, mint ground and coral / pink accents. Framing alternates between distant tableaux and face / prop close-ups, with restrained pushes and hard cuts.
- The lower-center dark plaque and warm karaoke fill stay visually consistent across scenes. A small group of motifs (the globe, two characters, a flower, a keepsake, fireworks) makes the piece legible at a glance.

## What this adaptation keeps — and what it changes

**Kept:** the tiny-in-a-large-world feeling, lyric-first pacing, the emotional turn from warmth into loss, and the final move toward self-care. The phrase boundaries stay on the measured beat grid.

**Changed:** no moon / planet, no rectangular mascots, no paired-on-a-sphere compositions, no umbrella tableau, no jar gag, no fireworks shot, and no dark subtitle plaque. The new film is an original **salt-print / paper-cut tide atlas**: a pear-shaped seed sprite and a folded ray travel across layered coastal charts. Its recurring gold contour line becomes a path, a message and finally a light kept for oneself. Captions are letter-pressed onto a pale, torn-edge strip; framing adds top-down chart views, a long low horizon, macro salt-coral and a slow spiral current.

The reference contributes editing and storytelling lessons only. Its frames, characters, props, exact compositions and title treatment are not reused.

## How the three code references informed the work

- [ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase): pure time-based frames, acted motion, visible reads, and a render–inspect–revise loop.
- [Lemo-Opuscar](https://github.com/lemomo-ai/lemo-opuscar): establish the medium and emotional arc before drawing; make the camera, rhythm and motifs serve the story.
- [ReelMimic](https://github.com/edenfunf/reelmimic): break the reference into timing / framing / palette / transitions first, then borrow the method rather than the source's assets.

No upstream film, characters, code or style prompt is copied into the new storyboard; the existing p5.js / p5.brush renderer in this repository is retained.
