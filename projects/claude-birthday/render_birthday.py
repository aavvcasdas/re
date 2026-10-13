#!/usr/bin/env python3
"""Render a hand-painted, lyric-synced Claude Code birthday video.

All visuals are procedural and deterministic: every frame is a function of time.
The default soundtrack is a small synthesized instrumental of the familiar
Happy Birthday melody (no voice imitation or recorded vocals). Supply --audio
for a recording of your own if desired.

Requirements: Pillow and imageio-ffmpeg (see requirements.txt).
"""
from __future__ import annotations

import argparse
import base64
import math
import random
import subprocess
import sys
import tempfile
import time
import wave
import zlib
from functools import lru_cache
from pathlib import Path
from typing import Iterable, Sequence

try:
    from PIL import Image, ImageDraw, ImageFilter, ImageFont
    import imageio_ffmpeg
except ImportError as exc:  # Keep the error helpful when the .py is run directly.
    missing = "Pillow" if "PIL" in str(exc) else "imageio-ffmpeg"
    raise SystemExit(
        f"Missing {missing}. From this folder, run: "
        f"python -m pip install -r requirements.txt\nDetails: {exc}"
    )

ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / "assets"
BASE_W, BASE_H = 1280, 720
FPS_DEFAULT = 24
INTRO = 0.65
PHRASE = 3.0
OUTRO = 1.35
DURATION = INTRO + 8 * PHRASE + OUTRO

PAPER = "#F1E8D7"
INK = "#382D3A"
CLAY = "#D66E50"
CLAY_DARK = "#A94F3A"
CLAY_LIGHT = "#F0A07A"
GOLD = "#E9B55C"
CREAM = "#FFF1D8"
LAVENDER = "#8580A2"
NIGHT = "#36364F"
ROSE = "#D78691"
TEAL = "#6E9894"
OCHRE = "#BE8654"

LYRICS = [
    "Happy Birthday to you",
    "Happy Birthday to you",
    "Happy Birthday dear Claude",
    "Happy Birthday to you",
    "祝你生日快乐",
    "祝你生日快乐",
    "祝你生日快乐",
    "祝你生日快乐",
]

# Word/character entrances follow the melody: English is word-by-word and
# Chinese is character-by-character. The final unit is held to the line end.
EN_ONSETS = [
    [0.00, 0.56, 1.65, 2.16],
    [0.00, 0.56, 1.65, 2.16],
    [0.00, 0.56, 1.40, 1.93],
    [0.00, 0.56, 1.65, 2.16],
]
EN_ENDS = [
    [0.56, 1.65, 2.16, 3.00],
    [0.56, 1.65, 2.16, 3.00],
    [0.56, 1.40, 1.93, 3.00],
    [0.56, 1.65, 2.16, 3.00],
]
ZH_ONSETS = [0.00, 0.34, 0.68, 1.08, 1.63, 2.18]
ZH_ENDS = [0.34, 0.68, 1.08, 1.63, 2.18, 3.00]

# Embedded 6-glyph Ma Shan Zheng subset (only 祝你生日快乐), zlib-compressed
# as base64 so the renderer still works when this single .py file is copied alone.
# Copyright 2018 The Ma Shan Zheng Project Authors; SIL Open Font License 1.1.
# License text is embedded alongside the subset to keep a copied .py compliant.
FONT_LICENSE_TEXT = r"""
Copyright 2018 The Ma Shan Zheng Project Authors (https://github.com/googlefonts/mashanzheng)

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
http://scripts.sil.org/OFL


-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded,
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.
"""

EMBEDDED_ZH_FONT_ZLIB_B64 = "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"


def embedded_zh_font_path() -> Path:
    font_path = Path(tempfile.gettempdir()) / "claude-birthday-mashanzheng-subset.ttf"
    if not font_path.exists():
        font_path.write_bytes(zlib.decompress(base64.b64decode(EMBEDDED_ZH_FONT_ZLIB_B64)))
    return font_path


# Notes are MIDI numbers. The four phrases repeat for the Chinese verse.
MELODY = [
    ([67, 67, 69, 67, 72, 71], [0.35, 0.21, 0.52, 0.52, 0.52, 0.88]),
    ([67, 67, 69, 67, 74, 72], [0.35, 0.21, 0.52, 0.52, 0.52, 0.88]),
    ([67, 67, 79, 76, 72, 71, 69], [0.30, 0.22, 0.52, 0.52, 0.46, 0.42, 0.56]),
    ([77, 77, 76, 72, 74, 72], [0.35, 0.21, 0.52, 0.52, 0.52, 0.88]),
]


def clamp(v: float, lo: float = 0.0, hi: float = 1.0) -> float:
    return max(lo, min(hi, v))


def smooth(v: float) -> float:
    v = clamp(v)
    return v * v * (3.0 - 2.0 * v)


def lerp(a: float, b: float, p: float) -> float:
    return a + (b - a) * p


def rgb(hex_color: str) -> tuple[int, int, int]:
    color = hex_color.lstrip("#")
    return tuple(int(color[i : i + 2], 16) for i in (0, 2, 4))  # type: ignore[return-value]


def mix_color(a: str, b: str, p: float) -> str:
    aa, bb = rgb(a), rgb(b)
    return "#" + "".join(f"{round(lerp(x, y, clamp(p))):02X}" for x, y in zip(aa, bb))


def point_ellipse(cx: float, cy: float, rx: float, ry: float, n: int = 36,
                  wobble: float = 0.0, seed: int = 0) -> list[tuple[float, float]]:
    rng = random.Random(seed)
    pts = []
    for i in range(n):
        a = math.tau * i / n
        r = 1.0 + (rng.uniform(-wobble, wobble) if wobble else 0.0)
        pts.append((cx + math.cos(a) * rx * r, cy + math.sin(a) * ry * r))
    return pts


def star_points(cx: float, cy: float, radius: float, inner: float = 0.46,
                points: int = 5, rotation: float = -math.pi / 2) -> list[tuple[float, float]]:
    result = []
    for i in range(points * 2):
        r = radius if i % 2 == 0 else radius * inner
        a = rotation + i * math.pi / points
        result.append((cx + math.cos(a) * r, cy + math.sin(a) * r))
    return result


@lru_cache(maxsize=128)
def load_font(kind: str, size: int) -> ImageFont.FreeTypeFont:
    if kind == "zh":
        bundled = ASSETS / "MaShanZheng-Birthday.ttf"
        candidates = [bundled if bundled.exists() else embedded_zh_font_path()]
    else:
        candidates = [
            ASSETS / "DejaVuSerif-Bold.ttf",
            Path("C:/Windows/Fonts/georgiab.ttf"),
            Path("C:/Windows/Fonts/timesbd.ttf"),
            Path("/System/Library/Fonts/Supplemental/Georgia Bold.ttf"),
            Path("/System/Library/Fonts/Supplemental/Times New Roman Bold.ttf"),
            Path("/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"),
            Path("/usr/share/fonts/truetype/liberation2/LiberationSerif-Bold.ttf"),
        ]
    for path in candidates:
        if path.exists():
            return ImageFont.truetype(str(path), size=size)
    return ImageFont.load_default(size=size)


@lru_cache(maxsize=8)
def paper_texture(width: int, height: int) -> Image.Image:
    """A restrained, static paper grain shared by every frame."""
    texture = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(texture, "RGBA")
    rng = random.Random(713)
    s = width / BASE_W
    count = max(350, int(width * height / 1150))
    for _ in range(count):
        x, y = rng.randrange(width), rng.randrange(height)
        r = rng.choice((0, 0, 0, 1, 1, 2)) * s
        if rng.random() < 0.78:
            color = (75, 58, 58, rng.randrange(3, 10))
        else:
            color = (255, 246, 226, rng.randrange(5, 13))
        if r < 1:
            draw.point((x, y), fill=color)
        else:
            draw.ellipse((x - r, y - r, x + r, y + r), fill=color)
    # A few long, almost invisible paper fibres.
    for _ in range(max(14, width // 65)):
        x, y = rng.randrange(width), rng.randrange(height)
        dx = rng.randrange(-18, 19) * s
        draw.line((x, y, x + dx, y + rng.choice((-1, 0, 1)) * s),
                  fill=(75, 58, 58, rng.randrange(4, 10)), width=max(1, round(s)))
    return texture


class Painter:
    """Small watercolor/ink drawing surface in the upstream skill's 1280x720 coordinates."""

    def __init__(self, width: int, height: int, t: float):
        self.width, self.height = width, height
        self.s = width / BASE_W
        self.t = t
        self.boil = math.floor(t * 12 + 1e-6)
        self.im = Image.new("RGBA", (width, height), rgb(PAPER) + (255,))

    def px(self, x: float) -> int:
        return int(round(x * self.s))

    def pxy(self, p: tuple[float, float]) -> tuple[float, float]:
        return (p[0] * self.s, p[1] * self.s)

    def polygon(self, points: Sequence[tuple[float, float]], fill: str | None,
                alpha: int = 255, outline: str | None = None, line: float = 0.0,
                soft: float = 0.0, jitter: float = 0.0, key: int = 0) -> None:
        if len(points) < 3:
            return
        pts = list(points)
        if jitter:
            rng = random.Random((self.boil * 1_000_003 + key * 71_711) & 0xFFFFFFFF)
            pts = [(x + rng.uniform(-jitter, jitter), y + rng.uniform(-jitter, jitter)) for x, y in pts]
        scaled = [self.pxy(p) for p in pts]
        margin = max(2, self.px(soft * 4 + line + jitter + 2))
        x0 = max(0, int(math.floor(min(p[0] for p in scaled))) - margin)
        y0 = max(0, int(math.floor(min(p[1] for p in scaled))) - margin)
        x1 = min(self.width, int(math.ceil(max(p[0] for p in scaled))) + margin + 1)
        y1 = min(self.height, int(math.ceil(max(p[1] for p in scaled))) + margin + 1)
        if x1 <= x0 or y1 <= y0:
            return
        local = [(x - x0, y - y0) for x, y in scaled]
        if fill is not None and alpha > 0:
            layer = Image.new("RGBA", (x1 - x0, y1 - y0), (0, 0, 0, 0))
            ImageDraw.Draw(layer).polygon(local, fill=rgb(fill) + (int(clamp(alpha, 0, 255)),))
            if soft > 0:
                layer = layer.filter(ImageFilter.GaussianBlur(max(0.35, self.px(soft))))
            self.im.alpha_composite(layer, (x0, y0))
        if outline is not None and line > 0:
            layer = Image.new("RGBA", (x1 - x0, y1 - y0), (0, 0, 0, 0))
            draw = ImageDraw.Draw(layer)
            width = max(1, self.px(line))
            draw.line(local + [local[0]], fill=rgb(outline) + (245,), width=width, joint="curve")
            # A lighter, offset dry edge keeps the contour from looking vector-perfect.
            if width >= 2:
                draw.line([(x, y + self.px(0.6)) for x, y in local] +
                          [(local[0][0], local[0][1] + self.px(0.6))],
                          fill=rgb(outline) + (72,), width=max(1, width // 2), joint="curve")
            self.im.alpha_composite(layer, (x0, y0))

    def blob(self, cx: float, cy: float, rx: float, ry: float, color: str,
             alpha: int = 255, seed: int = 0, soft: float = 1.0,
             outline: str | None = None, line: float = 0.0, wobble: float = 0.035) -> None:
        pts = point_ellipse(cx, cy, rx, ry, n=36, wobble=wobble, seed=seed)
        self.polygon(pts, color, alpha, outline, line, soft, jitter=0.6, key=seed)

    def stroke(self, points: Sequence[tuple[float, float]], color: str = INK,
               width: float = 2.0, alpha: int = 255, key: int = 0,
               rough: float = 0.0, dry: bool = False) -> None:
        if len(points) < 2:
            return
        rng = random.Random((self.boil * 997 + key * 104_729) & 0xFFFFFFFF)
        p = list(points)
        if rough:
            p = [(x + rng.uniform(-rough, rough), y + rng.uniform(-rough, rough)) for x, y in p]
        scaled = [self.pxy(q) for q in p]
        margin = max(3, self.px(width * 2 + rough + 4))
        x0 = max(0, int(min(q[0] for q in scaled)) - margin)
        y0 = max(0, int(min(q[1] for q in scaled)) - margin)
        x1 = min(self.width, int(max(q[0] for q in scaled)) + margin + 1)
        y1 = min(self.height, int(max(q[1] for q in scaled)) + margin + 1)
        if x1 <= x0 or y1 <= y0:
            return
        local = [(x - x0, y - y0) for x, y in scaled]
        layer = Image.new("RGBA", (x1 - x0, y1 - y0), (0, 0, 0, 0))
        d = ImageDraw.Draw(layer)
        w = max(1, self.px(width))
        if dry:
            d.line(local, fill=rgb(color) + (max(20, int(alpha * 0.34)),),
                   width=max(1, int(w * 1.7)), joint="curve")
            d.line([(x, y - 1) for x, y in local], fill=rgb(color) + (int(alpha * 0.6),),
                   width=max(1, w // 2), joint="curve")
            d.line(local, fill=rgb(color) + (int(alpha),), width=max(1, w // 3), joint="curve")
        else:
            d.line(local, fill=rgb(color) + (int(alpha),), width=w, joint="curve")
            cap = max(1, w // 2)
            for x, y in (local[0], local[-1]):
                d.ellipse((x - cap, y - cap, x + cap, y + cap), fill=rgb(color) + (int(alpha),))
        self.im.alpha_composite(layer, (x0, y0))

    def glow(self, cx: float, cy: float, radius: float, color: str, amount: float = 0.55) -> None:
        r = self.px(radius)
        if r <= 1:
            return
        box = (max(0, self.px(cx) - r), max(0, self.px(cy) - r),
               min(self.width, self.px(cx) + r + 1), min(self.height, self.px(cy) + r + 1))
        x0, y0, x1, y1 = box
        if x1 <= x0 or y1 <= y0:
            return
        layer = Image.new("RGBA", (x1 - x0, y1 - y0), (0, 0, 0, 0))
        d = ImageDraw.Draw(layer)
        d.ellipse((self.px(cx) - r - x0, self.px(cy) - r - y0,
                   self.px(cx) + r - x0, self.px(cy) + r - y0),
                  fill=rgb(color) + (round(62 * clamp(amount)),))
        layer = layer.filter(ImageFilter.GaussianBlur(max(1, self.px(radius * 0.33))))
        self.im.alpha_composite(layer, (x0, y0))

    def add_paper(self) -> None:
        self.im.alpha_composite(paper_texture(self.width, self.height))
        # Tiny 12-fps flecks subtly boil, while the large painted shapes stay registered.
        d = ImageDraw.Draw(self.im, "RGBA")
        rng = random.Random(81_731 + self.boil)
        for _ in range(max(45, self.width // 8)):
            x, y = rng.randrange(self.width), rng.randrange(self.height)
            d.point((x, y), fill=(76, 56, 55, rng.randrange(3, 9)))

    def rgb_frame(self) -> Image.Image:
        self.add_paper()
        return self.im.convert("RGB")


def paint_background(c: Painter, t: float) -> float:
    """The same atelier warms from moonlit lavender to a soft honey glow."""
    warmth = smooth((t - (INTRO + 3.3 * PHRASE)) / 1.7)
    bg = mix_color("#BDB1C9", "#E4C59F", warmth)
    c.im = Image.new("RGBA", (c.width, c.height), rgb(bg) + (255,))
    # Broad, irregular pigment blooms instead of a digital gradient.
    c.blob(280, 108, 490, 235, mix_color("#8D88AA", "#D59B88", warmth), 86, 13, 14, wobble=0.012)
    c.blob(955, 140, 520, 330, mix_color("#777692", "#DEA77A", warmth), 82, 25, 18, wobble=0.018)
    c.blob(560, 350, 720, 165, mix_color("#D2B3BE", "#EBCB9A", warmth), 108, 39, 13, wobble=0.016)
    c.blob(610, 690, 820, 175, mix_color("#8D7B91", "#B98769", warmth), 75, 52, 16, wobble=0.018)
    # Broken, translucent dry-brush sweeps leave visible pigment variation in the wall.
    c.stroke([(-30, 236), (142, 224), (340, 246), (524, 222), (706, 231)],
             mix_color("#766F91", "#B97C72", warmth), 22, 28, 61, 8.0, dry=True)
    c.stroke([(534, 342), (700, 329), (874, 352), (1072, 333), (1306, 350)],
             mix_color("#E0B7B1", "#E5B47F", warmth), 18, 32, 62, 7.0, dry=True)
    c.stroke([(48, 570), (269, 551), (475, 570), (678, 553), (881, 571)],
             mix_color("#E2C4AD", "#E9C59D", warmth), 16, 35, 63, 6.0, dry=True)

    # Round window: a linked motif that carries through all eight lyric lines.
    c.blob(1012, 225, 246, 205, mix_color("#6F6B88", "#89778A", warmth), 242, 102, 3.0,
           outline=INK, line=3.0, wobble=0.012)
    c.blob(1012, 225, 221, 183, mix_color("#36374F", "#58546B", warmth), 255, 103, 1.4,
           outline=mix_color("#4C465A", "#7B6C70", warmth), line=2.0, wobble=0.014)
    # Moon and sky wash.
    moon_y = 142 + 4 * math.sin(t * 0.34)
    c.glow(1062, moon_y, 62, "#F6D9A2", 0.32 + 0.2 * warmth)
    c.blob(1062, moon_y, 28, 27, "#F5DDAE", 244, 111, 1.4, outline=INK, line=1.2, wobble=0.02)
    c.blob(1074, moon_y - 8, 6, 8, "#D3B78F", 75, 112, 0.8, wobble=0.03)
    # Window muntins are hand-inked and slightly irregular.
    c.stroke([(1010, 42), (1007, 214), (1014, 420)], mix_color("#4A455A", "#6A5A61", warmth), 3.0, 210, 121, 1.0)
    c.stroke([(789, 225), (1004, 229), (1234, 219)], mix_color("#4A455A", "#6A5A61", warmth), 2.5, 200, 122, 1.0)
    # Tiny stars outside the window (stable placement, gently pulsing light).
    for i, (sx, sy, r) in enumerate([(860, 145, 8), (940, 93, 6), (1155, 150, 9),
                                     (910, 270, 5), (1144, 298, 6), (1060, 337, 4)]):
        pulse = 0.7 + 0.3 * math.sin(t * 2.4 + i * 2.1)
        draw_star(c, sx, sy, r * pulse, GOLD, alpha=210, key=200 + i)

    # A paper garland hangs across the wall and gives the frame a party silhouette.
    c.stroke([(-45, 102), (130, 137), (332, 122), (531, 151), (697, 128)], INK, 2.0, 145, 301, 2.0)
    flag_colors = [ROSE, GOLD, TEAL, "#A592B2", "#E4A16F"]
    for i, x in enumerate([48, 150, 252, 354, 456, 558]):
        y = 117 + (x / 650) * 17 + 9 * math.sin(x * 0.009)
        c.polygon([(x - 23, y), (x + 23, y + 2), (x + 2, y + 52)], flag_colors[i % len(flag_colors)],
                  220, outline=INK, line=1.1, soft=0.7, jitter=0.7, key=320 + i)
    # Table and floor; the cake and gifts are painted later, on top.
    c.polygon([(0, 506), (180, 490), (432, 506), (670, 486), (920, 503), (1280, 482),
               (1300, 760), (-15, 760)], mix_color("#AA8A86", "#B99372", warmth), 235,
              outline=INK, line=2.0, soft=1.2, jitter=1.4, key=401)
    c.stroke([(-20, 508), (240, 493), (506, 510), (820, 490), (1288, 500)],
             mix_color("#5B4655", "#76514A", warmth), 3.0, 220, 402, 2.0, dry=True)
    # Small brushy floor shadows anchor the feet and table legs.
    c.blob(472, 535, 205, 24, "#615267", 55, 410, 7.0, wobble=0.02)
    return warmth


def draw_star(c: Painter, x: float, y: float, radius: float, color: str = GOLD,
              alpha: int = 255, key: int = 0, glow: bool = False) -> None:
    if glow:
        c.glow(x, y, radius * 3.0, color, 0.55)
    pts = star_points(x, y, radius, 0.42, 5, -math.pi / 2 + 0.08 * math.sin(c.t * 1.6 + key))
    c.polygon(pts, color, alpha, outline=INK, line=max(0.7, radius * 0.065), soft=0.35,
              jitter=0.45, key=key + 500)


def draw_heart(c: Painter, x: float, y: float, size: float, alpha: int, key: int) -> None:
    points = []
    scale = size / 32.0
    for i in range(36):
        a = math.tau * i / 36
        hx = 16 * math.sin(a) ** 3
        hy = 13 * math.cos(a) - 5 * math.cos(2 * a) - 2 * math.cos(3 * a) - math.cos(4 * a)
        points.append((x + hx * scale, y - hy * scale))
    c.polygon(points, ROSE, alpha, outline=INK, line=max(0.8, size * 0.045),
              soft=0.8, jitter=0.65, key=key)


def draw_candle_flame(c: Painter, x: float, y: float, t: float, strength: float = 1.0, key: int = 0) -> None:
    if strength <= 0.02:
        return
    sway = math.sin(t * 13 + key) * 3.0
    h = 27 * strength * (0.93 + 0.07 * math.sin(t * 17 + key))
    c.glow(x + sway * 0.25, y - h * 0.5, 30 * strength, "#F4C36D", 0.64 * strength)
    pts = [(x, y), (x - 9 * strength, y - h * 0.35),
           (x - 7 * strength + sway, y - h * 0.78),
           (x + sway, y - h),
           (x + 8 * strength + sway, y - h * 0.64),
           (x + 10 * strength, y - h * 0.25)]
    c.polygon(pts, "#F0A848", int(240 * strength), outline=INK, line=0.9, soft=0.55,
              jitter=0.45, key=610 + key)
    inner = [(x, y - 2), (x - 3 * strength, y - h * 0.34),
             (x + sway * 0.5, y - h * 0.77), (x + 4 * strength, y - h * 0.28)]
    c.polygon(inner, CREAM, int(205 * strength), soft=0.6, jitter=0.25, key=620 + key)


def draw_cake(c: Painter, t: float, phrase_index: int, p: float) -> None:
    # A two-tier cake stays in the same place while the birthday story escalates around it.
    bob = 2.0 * math.sin(t * 3.7)
    x, y = 906, 435 + bob
    c.glow(x, y - 54, 120, "#F6C76E", 0.14 + 0.24 * (phrase_index >= 2))
    # Plate and a small doily made from broken ink dashes.
    c.blob(x, y + 13, 147, 19, "#D6C2A7", 255, 700, 1.2, outline=INK, line=1.6, wobble=0.016)
    c.stroke([(x - 114, y + 14), (x - 57, y + 20), (x + 3, y + 14), (x + 95, y + 17)],
             CREAM, 2.0, 180, 701, 1.2, dry=True)
    # Bottom tier.
    c.polygon([(x - 108, y - 5), (x - 99, y - 91), (x - 60, y - 103),
               (x + 73, y - 98), (x + 105, y - 83), (x + 111, y - 4)],
              "#D58B82", 255, outline=INK, line=2.0, soft=1.0, jitter=1.1, key=710)
    c.blob(x, y - 91, 101, 23, "#F5DDBA", 255, 711, 0.8, outline=INK, line=1.5, wobble=0.015)
    # Frosting scallops.
    for i, dx in enumerate([-78, -39, 0, 39, 78]):
        c.blob(x + dx, y - 21 - (i % 2) * 4, 18, 13, "#F4D9B4", 255, 720 + i, 0.7,
               outline=INK, line=0.8, wobble=0.02)
    # Top tier.
    c.polygon([(x - 67, y - 84), (x - 60, y - 145), (x - 34, y - 154),
               (x + 38, y - 150), (x + 62, y - 139), (x + 68, y - 82)],
              "#E8B1A0", 255, outline=INK, line=1.8, soft=0.8, jitter=0.9, key=730)
    c.blob(x, y - 146, 64, 16, "#FFF0D8", 255, 731, 0.8, outline=INK, line=1.1, wobble=0.016)
    for i, dx in enumerate([-39, 0, 39]):
        c.blob(x + dx, y - 101, 9, 10, [ROSE, GOLD, TEAL][i], 235, 740 + i, 0.55,
               outline=INK, line=0.8, wobble=0.03)
    # Three short candles, with the middle flame as the visual focus.
    candle_y = y - 157
    for i, dx in enumerate([-32, 0, 32]):
        c.polygon([(x + dx - 5, candle_y), (x + dx - 4, candle_y - 42),
                   (x + dx + 5, candle_y - 43), (x + dx + 6, candle_y)],
                  ["#7EA8A0", "#E8A85E", "#D9828A"][i], 255,
                  outline=INK, line=1.0, soft=0.3, jitter=0.4, key=750 + i)
        c.stroke([(x + dx - 2, candle_y - 37), (x + dx + 1, candle_y - 20)],
                 CREAM, 1.2, 170, 760 + i, 0.5)
    # The lyric four extinguishes the flames; later lines keep a few warm sparks alive.
    coda = phrase_index < 0 and t >= INTRO + 8 * PHRASE
    flames = (0.56 + 0.08 * math.sin(t * 4.1)) if coda else (0.12 if phrase_index < 0 else 1.0)
    if phrase_index == 0:
        flames = 0.12 + 0.88 * smooth((p - 0.06) / 0.48)
    elif phrase_index == 3:
        flames = 1.0 - smooth((p - 0.52) / 0.15)
    elif phrase_index >= 4:
        flames = 0.28 + 0.14 * math.sin(t * 4.1)
    for i, dx in enumerate([-32, 0, 32]):
        if phrase_index == 3 and p > 0.64:
            age = clamp((p - 0.64) / 0.36)
            sx = x + dx + math.sin(t * 4 + i) * 6
            sy = candle_y - 47 - age * 66
            c.stroke([(sx, candle_y - 44), (sx - 4, candle_y - 57), (sx + 3, sy)],
                     "#D8C6B1", 1.5, int(170 * (1 - age * 0.5)), 770 + i, 1.2)
        draw_candle_flame(c, x + dx, candle_y - 42, t, flames * (0.9 if i != 1 else 1.0), 780 + i)
    if phrase_index == 3 and p > 0.64:
        age = clamp((p - 0.64) / 0.36)
        for i in range(7):
            a = i * math.tau / 7 + 0.2
            r = 18 + 57 * age
            draw_star(c, x + math.cos(a) * r, candle_y - 46 + math.sin(a) * r,
                      4.8 * (1 - 0.25 * age), GOLD, int(230 * (1 - age * 0.48)), 795 + i)
    # A small five-point motif is repeated in the hat, candle light and outro.
    draw_star(c, x, y - 73, 11, GOLD, 230, 790, glow=False)


def draw_present(c: Painter, x: float, y: float, size: float, color: str,
                 t: float, key: int, tilt: float = 0.0) -> None:
    bob = 5 * math.sin(t * 3.5 + key)
    y += bob
    w, h = size, size * 0.72
    # Flat front-facing package; the two visible planes remain painted 2D.
    pts = [(x - w / 2, y - h), (x + w / 2, y - h), (x + w / 2 + 7, y),
           (x - w / 2 + 4, y + 2)]
    c.polygon(pts, color, 255, outline=INK, line=1.8, soft=0.65, jitter=0.6, key=key)
    c.polygon([(x - w / 2, y - h), (x - w / 2 + 18, y - h - 12),
               (x + w / 2 + 21, y - h - 12), (x + w / 2, y - h)],
              mix_color(color, CREAM, 0.25), 255, outline=INK, line=1.6, soft=0.5,
              jitter=0.5, key=key + 1)
    c.polygon([(x - 7, y - h - 2), (x + 7, y - h - 2), (x + 8, y), (x - 7, y)],
              GOLD, 255, outline=INK, line=0.9, soft=0.2, jitter=0.3, key=key + 2)
    c.stroke([(x, y - h - 4), (x - 18, y - h - 22), (x - 25, y - h - 17),
              (x - 4, y - h - 3), (x + 4, y - h - 3), (x + 24, y - h - 19),
              (x + 17, y - h - 25), (x, y - h - 4)],
             GOLD, 2.3, 245, key + 3, 0.7)
    draw_star(c, x, y - h * 0.52, size * 0.09, CREAM, 220, key + 4)


def draw_lantern(c: Painter, x: float, y: float, radius: float, color: str,
                 t: float, key: int, appear: float) -> None:
    if appear <= 0:
        return
    swing = 7 * math.sin(t * 1.8 + key)
    x += swing
    c.stroke([(x, y - radius * 1.8), (x + 2 * math.sin(t + key), y - radius)], INK,
             1.5, int(150 * appear), key + 1, 0.5)
    c.glow(x, y, radius * 1.8, color, 0.34 * appear)
    c.blob(x, y, radius * 0.95, radius * 1.17, color, int(235 * appear), key + 2,
           1.0, outline=INK, line=1.8, wobble=0.022)
    c.stroke([(x - radius * 0.58, y - radius * 0.26), (x, y - radius * 0.34),
              (x + radius * 0.58, y - radius * 0.26)], CREAM, 1.2,
             int(180 * appear), key + 3, 0.8)
    c.stroke([(x - radius * 0.55, y + radius * 0.34), (x, y + radius * 0.4),
              (x + radius * 0.56, y + radius * 0.32)], INK, 1.1,
             int(145 * appear), key + 4, 0.6)
    c.stroke([(x - 6, y + radius), (x, y + radius + 15), (x + 4, y + radius + 27)],
             GOLD, 1.7, int(200 * appear), key + 5, 0.6)


def capsule_points(a: tuple[float, float], b: tuple[float, float], width: float) -> list[tuple[float, float]]:
    dx, dy = b[0] - a[0], b[1] - a[1]
    length = max(1.0, math.hypot(dx, dy))
    nx, ny = -dy / length * width / 2, dx / length * width / 2
    return [(a[0] + nx, a[1] + ny), (b[0] + nx, b[1] + ny),
            (b[0] - nx, b[1] - ny), (a[0] - nx, a[1] - ny)]


def draw_clawd(c: Painter, x: float, base_y: float, t: float, phrase_index: int,
               p: float, warmth: float) -> None:
    """Original 2D Clawd-inspired mascot: terracotta block, two slit eyes, nubs and four feet."""
    beat = math.sin((t - INTRO) * math.tau / 0.75)
    bob = 5.0 * math.sin(t * 3.9) + 3.0 * max(0.0, beat)
    squash = 0.045 * math.sin(t * 6.4 + 0.4)
    tilt = 0.025 * math.sin(t * 2.7)
    if phrase_index == 3:
        # Anticipate the candle blow, then lean into it.
        tilt += -0.10 * smooth((p - 0.24) / 0.25) + 0.10 * smooth((p - 0.62) / 0.27)
    if phrase_index == 5:
        bob += 16 * abs(math.sin(p * math.tau * 1.5))
        tilt += 0.27 * math.sin(p * math.tau * 1.5)
    if phrase_index == 6:
        bob += 6 * max(0.0, math.sin(p * math.tau))
        tilt += 0.08 * math.sin(p * math.tau)
    base_y += bob
    sx, sy = 1.16 * (1.0 + squash), 1.16 * (1.0 - squash)
    co, si = math.cos(tilt), math.sin(tilt)

    def xf(px: float, py: float) -> tuple[float, float]:
        lx, ly = px * sx, py * sy
        return (x + lx * co - ly * si, base_y + lx * si + ly * co)

    def local_shape(points: Sequence[tuple[float, float]], fill: str | None,
                    alpha: int = 255, outline: str | None = INK, line: float = 2.0,
                    soft: float = 0.55, jitter: float = 0.6, key: int = 0) -> None:
        c.polygon([xf(a, b) for a, b in points], fill, alpha, outline, line, soft,
                  jitter, key)

    def local_ellipse(cx: float, cy: float, rx: float, ry: float, fill: str,
                      alpha: int = 255, outline: str | None = None, line: float = 0.0,
                      key: int = 0) -> None:
        local_shape(point_ellipse(cx, cy, rx, ry, 20, 0.012, key), fill, alpha,
                    outline, line, 0.45, 0.25, key)

    def local_line(points: Sequence[tuple[float, float]], color: str = INK,
                   width: float = 2.0, alpha: int = 255, key: int = 0) -> None:
        c.stroke([xf(a, b) for a, b in points], color, width, alpha, key, 0.7)

    # Ground shadow, then the legs (the feet touch the ground, including on every hop).
    c.blob(x, base_y + 1, 102, 16, "#534653", 74, 900, 5.0, wobble=0.02)
    walk = math.sin(t * 8.0 + phrase_index * 0.7)
    for i, lx in enumerate([-62, -22, 22, 62]):
        step = (walk if i % 2 == 0 else -walk) * (17 if phrase_index == 5 else (8 if phrase_index == 6 else 2.5))
        leg = [(lx - 11, -75), (lx + 11, -75), (lx + 13 + step, -10),
               (lx + 8 + step, 1), (lx - 10 + step, 0), (lx - 13, -8)]
        local_shape(leg, CLAY_DARK if i in (0, 3) else CLAY,
                    outline=INK, line=2.2, soft=0.6, jitter=0.65, key=910 + i)
        local_line([(lx - 7 + step, -5), (lx + 5 + step, -4)], CLAY_LIGHT, 1.2, 140, 930 + i)

    # Arms are behind the body; each arm moves on its own curve, not in a mirrored robot pose.
    arm_raise_l, arm_raise_r = 0.0, 0.0
    if phrase_index == 0:
        arm_raise_r = 0.62 * smooth(p / 0.32) - 0.12
    elif phrase_index == 1:
        arm_raise_r = 0.55 * smooth(p / 0.55)
        arm_raise_l = -0.12
    elif phrase_index == 2:
        arm_raise_l = 0.55 * smooth(p / 0.4)
        arm_raise_r = 0.88 * smooth(p / 0.5)
    elif phrase_index == 3:
        arm_raise_l = -0.25
        arm_raise_r = -0.45 * smooth((p - 0.2) / 0.25)
    elif phrase_index == 4:
        arm_raise_r = 0.95 * smooth(p / 0.45)
    elif phrase_index == 5:
        arm_raise_l = 0.25 * math.sin(p * math.tau)
        arm_raise_r = 0.90 + 0.25 * math.sin(p * math.tau + 0.6)
    elif phrase_index == 6:
        arm_raise_l = 0.95 + 0.2 * math.sin(p * math.tau)
        arm_raise_r = 0.85 + 0.25 * math.sin(p * math.tau + 1.1)
    elif phrase_index == 7:
        arm_raise_l = 0.35
        arm_raise_r = 0.45

    for side, lift, key in [(-1, arm_raise_l, 950), (1, arm_raise_r, 960)]:
        start = (side * 82, -157)
        reach = 119 + 4 * math.cos(t * 3 + side) + 30 * abs(lift)
        if phrase_index == 7:
            reach -= 30 * smooth(p / 0.62)  # the last phrase gathers both nubs into a gentle hug
        end = (side * reach, -157 - 60 * lift)
        local_shape(capsule_points(start, end, 29), CLAY_DARK if side < 0 else CLAY,
                    outline=INK, line=2.6, soft=0.5, jitter=0.65, key=key)
        local_ellipse(end[0], end[1], 15, 15, CLAY, outline=INK, line=2.1, key=key + 1)
        local_line([(end[0] - 4, end[1] - 5), (end[0] + 2, end[1] - 6)],
                   CLAY_LIGHT, 1.4, 170, key + 2)

    # A single rounded, slightly irregular body silhouette, rather than sticker-like circles.
    body = []
    for i in range(44):
        a = math.tau * i / 44
        # Superellipse exponent makes Clawd's top and bottom edges flatter than a blob.
        cs, sn = math.cos(a), math.sin(a)
        body.append((math.copysign(abs(cs) ** 0.40, cs) * 91,
                     -151 + math.copysign(abs(sn) ** 0.40, sn) * 82))
    local_shape(body, CLAY, outline=INK, line=3.4, soft=1.1, jitter=0.8, key=980)
    # Subtle pigment wash on the lit side and a warm shadow on the far edge.
    local_ellipse(-37, -204, 45, 15, CLAY_LIGHT, alpha=74, key=981)
    local_shape([(-85, -202), (-70, -215), (-72, -105), (-86, -90)],
                CLAY_DARK, 48, outline=None, line=0, soft=2.4, jitter=0.4, key=982)
    # A few broken dry-brush marks suggest pigment and keep the mascot from looking vector-flat.
    local_line([(-67, -218), (-42, -221), (-20, -217)], CLAY_LIGHT, 1.2, 145, 983)
    local_line([(58, -168), (66, -158), (62, -148)], CLAY_DARK, 1.0, 95, 984)
    local_line([(-74, -99), (-60, -95), (-48, -99)], CLAY_DARK, 1.0, 90, 985)

    # Expressions change as acting, with mouth movement tied to the sung pulse.
    expression = "happy"
    if phrase_index < 0:
        expression = "soft" if t >= INTRO + 8 * PHRASE else "curious"
    elif phrase_index in (0, 1):
        expression = "curious" if phrase_index == 0 else "bright"
    elif phrase_index == 2:
        expression = "shy"
    elif phrase_index == 3:
        expression = "blow"
    elif phrase_index == 4:
        expression = "happy"
    elif phrase_index == 5:
        expression = "bright"
    elif phrase_index == 6:
        expression = "excited"
    elif phrase_index == 7:
        expression = "soft"

    blink = (math.sin(t * 1.6 + 0.4) > 0.985) or (phrase_index == 7 and 0.45 < p < 0.55)
    for side in (-1, 1):
        ex = side * 34
        if expression == "shy" and side == 1:
            local_line([(ex - 9, -192), (ex, -184), (ex + 9, -190)], INK, 4.2, 255, 1000 + side)
        elif expression == "excited" or expression == "curious":
            local_ellipse(ex, -187, 10, 15 if expression == "excited" else 13,
                          CREAM, alpha=255, outline=INK, line=2.0, key=1001 + side)
            local_ellipse(ex + 1.0, -187, 4.5, 8, INK, key=1011 + side)
            local_ellipse(ex - 1, -191, 2.2, 2.8, CREAM, key=1021 + side)
        elif blink:
            local_line([(ex - 10, -187), (ex - 4, -191), (ex + 4, -191), (ex + 10, -187)],
                       INK, 3.6, 245, 1031 + side)
        elif expression == "happy" or expression == "bright" or expression == "soft":
            local_line([(ex - 10, -189), (ex - 5, -195), (ex, -196),
                        (ex + 6, -193), (ex + 10, -188)], INK, 3.7, 255, 1041 + side)
        else:
            local_ellipse(ex, -188, 7.5, 15, INK, key=1051 + side)
            local_ellipse(ex - 2, -194, 2, 3, CREAM, key=1061 + side)

    # Gentle blush in the shy moment and warm coda.
    blush = 0.72 if expression == "shy" else (0.38 if phrase_index == 7 else 0.12)
    if blush > 0:
        local_ellipse(-58, -135, 16, 7, ROSE, alpha=int(110 * blush), key=1071)
        local_ellipse(58, -135, 16, 7, ROSE, alpha=int(110 * blush), key=1072)

    # Mouth moves on the melody beats; the blow has a small, held "o" shape.
    note_pulse = 0.5 + 0.5 * math.sin((t - INTRO) * math.tau * 2.0)
    mouth_open = 0.14 + 0.55 * note_pulse
    if expression == "blow":
        mouth_open = 0.2 + 0.65 * smooth((p - 0.28) / 0.2) * (1 - smooth((p - 0.60) / 0.12))
    if expression == "soft":
        mouth_open *= 0.4
    mouth_w = 7 + 8 * mouth_open
    mouth_h = 3 + 12 * mouth_open
    local_ellipse(0, -112, mouth_w, mouth_h, INK, key=1081)
    if mouth_open > 0.38 and expression != "blow":
        local_ellipse(1, -107, mouth_w * 0.55, mouth_h * 0.30, ROSE, alpha=205, key=1082)
    if expression in ("happy", "bright", "soft") and mouth_open < 0.3:
        local_line([(-12, -114), (0, -108), (12, -114)], INK, 2.1, 230, 1083)

    # A tiny paper party hat lands on "dear Claude" and stays for the rest of the song.
    hat_k = 0.0
    if phrase_index < 0 and t >= INTRO + 8 * PHRASE:
        hat_k = 1.0
    elif phrase_index > 2:
        hat_k = 1.0
    elif phrase_index == 2:
        hat_k = smooth(p / 0.2)
    if hat_k > 0:
        hat_x = -5 + 6 * math.sin(t * 1.3)
        hat_y = -229 - 4 * math.sin(t * 2.1)
        hat_pts = [(hat_x - 35, hat_y + 8), (hat_x - 3, hat_y - 57 * hat_k),
                   (hat_x + 34, hat_y + 8)]
        local_shape(hat_pts, ROSE, int(250 * hat_k), outline=INK, line=2.2,
                    soft=0.5, jitter=0.5, key=1090)
        local_line([(hat_x - 21, hat_y - 5), (hat_x + 19, hat_y - 3)], GOLD, 4.0,
                   int(235 * hat_k), 1091)
        local_ellipse(hat_x - 3, hat_y - 57 * hat_k, 8, 8, GOLD,
                      alpha=int(250 * hat_k), outline=INK, line=1.0, key=1092)
        draw_star(c, x + hat_x * sx, base_y + (hat_y - 32) * sy, 5.5, CREAM,
                  int(215 * hat_k), 1093)


def draw_magic_spark(c: Painter, t: float, phrase_index: int, p: float) -> None:
    """The first lyric's spark travels from Clawd's hand to the candle wick."""
    if phrase_index != 0 or p < 0.10 or p > 0.95:
        return
    k = smooth((p - 0.10) / 0.72)
    actor_x = 468 + 20 * math.sin(t * 0.46)
    x0, y0 = actor_x + 137, 366
    x1, y1 = 906, 227
    x = lerp(x0, x1, k)
    y = lerp(y0, y1, k) - 56 * 4 * k * (1 - k)
    tail_alpha = int(210 * (1 - smooth((p - 0.78) / 0.18)))
    c.stroke([(x0, y0), (lerp(x0, x1, k * 0.38), lerp(y0, y1, k * 0.38) - 28), (x, y)],
             GOLD, 3.5, tail_alpha, 1190, 2.0, dry=True)
    for i in range(4):
        q = max(0.0, k - i * 0.11)
        sx = lerp(x0, x1, q)
        sy = lerp(y0, y1, q) - 56 * 4 * q * (1 - q)
        draw_star(c, sx, sy, 4.0 - i * 0.35, CREAM if i % 2 else GOLD,
                  int(tail_alpha * (0.75 - i * 0.12)), 1193 + i)
    draw_star(c, x, y, 12.0 * (1.0 - 0.20 * k), GOLD,
              int(255 * (1 - smooth((p - 0.82) / 0.12))), 1191, glow=True)


def draw_star_landing(c: Painter, t: float, phrase_index: int, p: float) -> None:
    """On the seventh line, a falling star settles as the cake's topper."""
    if phrase_index != 6:
        return
    k = smooth(p / 0.76)
    x = lerp(1080, 906, k)
    y = lerp(151, 273, k) - 62 * 4 * k * (1 - k)
    size = 21 + 4 * math.sin(t * 5.0)
    c.stroke([(x + 72, y - 58), (x + 45, y - 30), (x + 18, y - 15), (x, y)],
             GOLD, 4.2, int(220 * (1 - smooth((p - 0.58) / 0.28))), 1181, 2.5, dry=True)
    for i in range(3):
        q = max(0.0, k - (i + 1) * 0.12)
        tx = lerp(1080, 906, q)
        ty = lerp(151, 273, q) - 62 * 4 * q * (1 - q)
        draw_star(c, tx, ty, 6.5 - i * 0.8, CREAM,
                  int(215 * (1 - smooth((p - 0.62) / 0.24))), 1182 + i)
    draw_star(c, x, y, size, GOLD, 255, 1180, glow=(p > 0.06))


def draw_bunting_and_lanterns(c: Painter, t: float, phrase_index: int) -> None:
    coda = t >= INTRO + 8 * PHRASE
    if phrase_index < 4 and not coda:
        return
    appear = smooth((t - (INTRO + 4 * PHRASE) + 0.16) / 0.5)
    colors = [ROSE, "#E4A56F", GOLD]
    for i, x in enumerate([260, 648, 1110]):
        draw_lantern(c, x, 192 + 7 * math.sin(t * 1.6 + i), 34 if i != 1 else 39,
                     colors[i], t, 1200 + i, appear)


def draw_floating_motifs(c: Painter, t: float, phrase_index: int, p: float) -> None:
    # A handful of drifting paper stars and petals: stable positions, time-pure motion.
    amount = 0.0
    if phrase_index == 1:
        amount = smooth(p / 0.35)
    elif phrase_index >= 2:
        amount = 0.55 if phrase_index < 4 else 0.78
    elif t >= INTRO + 8 * PHRASE:
        amount = 0.46
    if amount <= 0:
        return
    for i in range(9):
        phase = t * 0.62 + i * 1.7
        x = 180 + (i * 137) % 930 + 26 * math.sin(phase)
        y = 275 + 125 * math.sin(phase * 0.75 + i) + 18 * math.cos(phase)
        r = 4.2 + 3 * (0.5 + 0.5 * math.sin(t * 3 + i))
        if i % 3 == 0:
            draw_star(c, x, y, r, GOLD if i % 2 else CREAM,
                      int(185 * amount), 1250 + i)
        else:
            c.blob(x, y, r * 0.7, r * 1.1, ROSE if i % 2 else "#E8C994",
                   int(150 * amount), 1260 + i, 0.5, wobble=0.04)

    # A clearer orbit of paper stars makes the Chinese second line a dance rather than a pose.
    if phrase_index == 5:
        dance = 0.36 + 0.64 * math.sin(math.pi * p)
        cx = 468 + 20 * math.sin(t * 0.46)
        # A broken rose ribbon draws a wide orbit around the dancing mascot.
        orbit = []
        for i in range(25):
            a = math.tau * i / 24 + t * 0.28
            orbit.append((cx + 194 * math.cos(a), 374 + 123 * math.sin(a)))
        c.stroke(orbit, ROSE, 5.5, int(150 * dance), 1269, 3.0, dry=True)
        for i in range(7):
            a = t * 2.15 + i * math.tau / 7
            sx = cx + 194 * math.cos(a)
            sy = 374 + 123 * math.sin(a)
            draw_star(c, sx, sy, 10.0 + 2.0 * math.sin(t * 4 + i),
                      GOLD if i % 2 else CREAM, int(225 * dance), 1270 + i)
    # A few small painted hearts lift on the final Chinese line as Clawd gathers in.
    if phrase_index == 7:
        q = smooth(p / 0.72)
        cx = 468 + 20 * math.sin(t * 0.46)
        for i, side in enumerate((-1, 1)):
            hx = cx + side * (125 + 12 * math.sin(t * 2 + i))
            hy = 292 - q * 24 + 10 * math.sin(t * 2.7 + i)
            draw_heart(c, hx, hy, 26 + i * 3,
                       int(230 * (1 - 0.22 * q)), 1280 + i)


def draw_reading_props(c: Painter, t: float, phrase_index: int, p: float) -> None:
    # Gifts slide in on line two; their motion slows for a readable, held beat.
    if phrase_index == 1:
        k = smooth((p - 0.02) / 0.24)
        draw_present(c, lerp(1260, 1070, k), 464, 106, TEAL, t, 1300)
        draw_present(c, lerp(1310, 1015, k), 478, 76, ROSE, t + 0.3, 1320)
    elif phrase_index >= 2 or t >= INTRO + 8 * PHRASE:
        draw_present(c, 1128 + 7 * math.sin(t * 2.6), 466, 75, TEAL, t, 1300)

    # A floating ribbon links the gift to the cake and then becomes a celebratory loop.
    if phrase_index == 1:
        q = smooth((p - 0.37) / 0.36)
        c.stroke([(1120, 372), (1048 - q * 84, 328 + 12 * math.sin(t * 4)),
                  (945 - q * 55, 358), (875 - q * 28, 315)], ROSE, 5.2,
                 int(205 * q), 1350, 2.4, dry=True)
        c.stroke([(1117, 379), (1039 - q * 80, 342), (956 - q * 45, 366)], CREAM,
                 1.6, int(220 * q), 1351, 1.1)
    elif 2 <= phrase_index <= 6:
        c.stroke([(1064, 380), (1008 + 14 * math.sin(t * 2), 340),
                  (1082, 300 + 14 * math.sin(t * 2 + 1)), (1168, 334)],
                 ROSE, 3.2, 135, 1352, 2.5, dry=True)


def draw_karaoke(c: Painter, t: float, phrase_index: int, local: float) -> None:
    if not 0 <= phrase_index < len(LYRICS):
        return
    fade_in = smooth(local / 0.12)
    fade_out = 1.0 - smooth((local - (PHRASE - 0.12)) / 0.12)
    alpha = int(244 * fade_in * fade_out)
    if alpha <= 0:
        return
    # Ragged indigo paint ribbon: karaoke is the one intentional exception to the no-text rule.
    y0, y1 = 590, 691
    banner = [(144, y0 + 8), (330, y0 + 2), (545, y0 + 6), (746, y0),
              (938, y0 + 8), (1137, y0 + 2), (1157, y1 - 9), (976, y1 - 1),
              (746, y1 - 8), (528, y1 - 1), (327, y1 - 7), (133, y1 - 2)]
    c.polygon(banner, NIGHT, alpha, outline=INK, line=2.1, soft=1.1,
              jitter=0.8, key=1400 + phrase_index)
    c.stroke([(170, y0 + 7), (366, y0 + 1), (594, y0 + 6), (819, y0 + 2), (1110, y0 + 8)],
             GOLD, 1.4, int(155 * fade_in * fade_out), 1401, 1.4, dry=True)

    text = LYRICS[phrase_index]
    is_zh = phrase_index >= 4
    tokens = list(text) if is_zh else text.split(" ")
    onsets = ZH_ONSETS if is_zh else EN_ONSETS[phrase_index]
    ends = ZH_ENDS if is_zh else EN_ENDS[phrase_index]
    font = load_font("zh" if is_zh else "en", max(12, c.px(54 if is_zh else 42)))
    widths = [float(font.getlength(token)) for token in tokens]
    gap = c.px(7 if is_zh else 15)
    total = sum(widths) + gap * max(0, len(tokens) - 1)
    cursor = (c.width - total) / 2
    center_y = c.px(640)
    draw = ImageDraw.Draw(c.im, "RGBA")
    token_lefts = []
    for i, (token, width) in enumerate(zip(tokens, widths)):
        x = cursor
        center_x = x + width / 2
        token_lefts.append(x)
        color = GOLD if local >= ends[i] else CREAM
        # Subtle offset ink makes the typography sit inside the hand-painted banner.
        draw.text((center_x + 1, center_y + c.px(2)), token, font=font,
                  fill=rgb(INK) + (int(alpha * 0.7),), anchor="mm",
                  stroke_width=max(0, c.px(1)), stroke_fill=rgb(INK) + (int(alpha * 0.7),))
        draw.text((center_x, center_y), token, font=font, fill=rgb(color) + (alpha,),
                  anchor="mm", stroke_width=max(0, c.px(0.7)),
                  stroke_fill=rgb(NIGHT) + (int(alpha * 0.75),))
        # A left-to-right paint fill crosses the current word as it is sung.
        if onsets[i] <= local < ends[i]:
            unit_p = smooth((local - onsets[i]) / max(0.04, ends[i] - onsets[i]))
            left = int(x - 2)
            right = int(x + width * unit_p)
            if right > left:
                mask = Image.new("L", (c.width, c.height), 0)
                md = ImageDraw.Draw(mask)
                md.rectangle((left, center_y - c.px(40), right, center_y + c.px(41)), fill=255)
                gold_layer = Image.new("RGBA", (c.width, c.height), (0, 0, 0, 0))
                ImageDraw.Draw(gold_layer).text((center_x, center_y), token, font=font,
                    fill=rgb(GOLD) + (alpha,), anchor="mm",
                    stroke_width=max(0, c.px(0.7)), stroke_fill=rgb(NIGHT) + (int(alpha * 0.75),))
                c.im.alpha_composite(Image.composite(gold_layer, Image.new("RGBA", (c.width, c.height)), mask))
        cursor += width + gap

    # One small gold spark tracks the currently sung word/character.
    current = next((i for i in range(len(tokens)) if onsets[i] <= local < ends[i]), len(tokens) - 1)
    unit_p = clamp((local - onsets[current]) / max(0.04, ends[current] - onsets[current]))
    spark_x = token_lefts[current] + widths[current] * unit_p
    draw_star(c, spark_x / c.s, 584, 5.3, GOLD, int(alpha * 0.92), 1450 + phrase_index)


def draw_transition(c: Painter, t: float, boundary: float, window: float = 0.34) -> None:
    """A watercolor brush wipe at the English-to-Chinese turn."""
    q = (t - (boundary - window)) / (2 * window)
    if not 0 <= q <= 1:
        return
    cover = math.sin(math.pi * q) ** 0.78
    if cover < 0.015:
        return
    colors = ["#E9D8C0", "#D8B899", "#F0DFCA", "#D1B39D", "#E8D1AF"]
    for i, y in enumerate([-4, 130, 268, 405, 544, 680]):
        spread = 1680 * cover
        if q < 0.5:
            x0 = -700 + (q * 2) * 720
        else:
            x0 = 20 + (q - 0.5) * 2 * 720
        x1 = x0 + spread
        offset = 12 * math.sin(i * 1.7 + t * 5)
        pts = [(x0 - 90, y + offset - 42), (x1, y - 35 + offset),
               (x1 + 130, y + 4 + offset), (x1 - 20, y + 46 + offset),
               (x0 - 140, y + 42 + offset)]
        c.polygon(pts, colors[i % len(colors)], int(230 * cover), soft=1.8,
                  jitter=4.0, key=1500 + i)
        c.stroke([(x0 - 100, y + offset), (x0 + spread * 0.45, y - 10 + offset),
                  (x1 + 60, y + 9 + offset)], CREAM, 3.0, int(150 * cover),
                 1510 + i, 3.0, dry=True)


def iris_overlay(frame: Image.Image, radius: float, color: str = NIGHT, opacity: int = 250) -> None:
    w, h = frame.size
    mask = Image.new("L", (w, h), 255)
    d = ImageDraw.Draw(mask)
    cx, cy = w // 2, h // 2
    r = max(0, round(radius))
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=0)
    mask = mask.filter(ImageFilter.GaussianBlur(max(1, w // 200)))
    overlay = Image.new("RGBA", (w, h), rgb(color) + (opacity,))
    overlay.putalpha(mask.point(lambda v: int(v * opacity / 255)))
    frame.alpha_composite(overlay)


def phrase_for_time(t: float) -> tuple[int, float]:
    if t < INTRO:
        return -1, 0.0
    idx = int((t - INTRO) // PHRASE)
    if 0 <= idx < 8:
        return idx, clamp((t - (INTRO + idx * PHRASE)) / PHRASE)
    return -1, 0.0


def render_frame(t: float, width: int, height: int) -> Image.Image:
    c = Painter(width, height, t)
    warmth = paint_background(c, t)
    phrase_index, p = phrase_for_time(t)

    # Chinese lines bring warm lanterns into the original room rather than cutting to a new world.
    draw_bunting_and_lanterns(c, t, phrase_index)
    draw_reading_props(c, t, phrase_index, p)
    draw_cake(c, t, phrase_index, p)
    draw_magic_spark(c, t, phrase_index, p)
    draw_star_landing(c, t, phrase_index, p)
    draw_floating_motifs(c, t, phrase_index, p)

    # Small movement shifts the framing without turning the design into a 3D scene.
    actor_x = 468 + 20 * math.sin(t * 0.46)
    if phrase_index == 2:
        actor_x += 16 * smooth(p / 0.5)
    elif phrase_index == 5:
        actor_x += 36 * math.sin(p * math.tau * 1.5)
    elif phrase_index == 6:
        actor_x += 14 * math.sin(p * math.tau)
    draw_clawd(c, actor_x, 529, t, phrase_index, p, warmth)

    if 0 <= phrase_index < 8:
        local = (t - INTRO) - phrase_index * PHRASE
        draw_karaoke(c, t, phrase_index, local)

    # A brush wipe joins the two language movements; iris-in/out completes the rhyme.
    draw_transition(c, t, INTRO + 4 * PHRASE)
    frame = c.rgb_frame().convert("RGBA")
    if t < 0.68:
        iris_overlay(frame, 1050 * smooth(t / 0.68), NIGHT, 248)
    if t > DURATION - 0.85:
        close = smooth((t - (DURATION - 0.85)) / 0.85)
        iris_overlay(frame, 1050 * (1.0 - close), NIGHT, 252)
    return frame.convert("RGB")


def midi_hz(midi: int) -> float:
    return 440.0 * (2.0 ** ((midi - 69) / 12.0))


def write_instrumental(path: Path, sample_rate: int = 44100) -> None:
    """A gentle bell/piano-like accompaniment; deliberately instrumental, not a vocal."""
    total_samples = round(DURATION * sample_rate)
    mix = [0.0] * total_samples
    for phrase_i in range(8):
        notes, lengths = MELODY[phrase_i % 4]
        scale = PHRASE / sum(lengths)
        cursor = INTRO + phrase_i * PHRASE
        for note_i, (midi, raw_len) in enumerate(zip(notes, lengths)):
            length = raw_len * scale
            start = round(cursor * sample_rate)
            n = min(round((length + 0.11) * sample_rate), total_samples - start)
            freq = midi_hz(midi)
            phase = 0.0
            for j in range(max(0, n)):
                age = j / sample_rate
                if age > length + 0.10:
                    break
                attack = min(1.0, age / 0.012)
                release = min(1.0, max(0.0, (length + 0.09 - age) / 0.09))
                decay = math.exp(-2.05 * age)
                env = attack * release * decay
                sec = 2.0 * math.pi * freq * age
                tone = (math.sin(sec) + 0.34 * math.sin(sec * 2.0) +
                        0.11 * math.sin(sec * 3.0) + 0.035 * math.sin(sec * 4.0))
                # A quiet octave shimmer makes the melody read as a birthday bell.
                shimmer = 0.08 * math.sin(sec * 2.0 + phase)
                mix[start + j] += 0.19 * env * (tone + shimmer)
            cursor += length
    # Subtle sustained root notes, one warm chord tone per phrase.
    chord_roots = [55, 50, 55, 48, 55, 50, 55, 48]
    for i, midi in enumerate(chord_roots):
        start = round((INTRO + i * PHRASE) * sample_rate)
        length = PHRASE
        n = min(round(length * sample_rate), total_samples - start)
        f = midi_hz(midi)
        for j in range(max(0, n)):
            age = j / sample_rate
            edge = min(1.0, age / 0.18, (length - age) / 0.25)
            env = max(0.0, edge) * (0.55 + 0.45 * math.sin(math.pi * age / length))
            mix[start + j] += 0.027 * env * math.sin(2 * math.pi * f * age)
    # Gentle tail fade, avoid a hard audio cut.
    fade_start = total_samples - round(0.65 * sample_rate)
    for i in range(max(0, fade_start), total_samples):
        mix[i] *= max(0.0, (total_samples - i) / max(1, total_samples - fade_start))
    peak = max((abs(v) for v in mix), default=1.0)
    gain = min(0.88 / max(peak, 1e-8), 3.5)
    pcm = bytearray()
    for value in mix:
        sample = int(max(-1.0, min(1.0, value * gain)) * 32767)
        pcm.extend(int(sample).to_bytes(2, byteorder="little", signed=True))
    with wave.open(str(path), "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(sample_rate)
        wav.writeframes(pcm)


def ffmpeg_command(width: int, height: int, fps: int, output: Path, audio: Path | None,
                   crf: int, audio_delay: float = INTRO) -> list[str]:
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    cmd = [ffmpeg, "-hide_banner", "-loglevel", "error", "-y",
           "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{width}x{height}",
           "-r", str(fps), "-i", "-"]
    if audio is not None:
        filters = []
        if audio_delay > 0:
            filters.append(f"adelay={round(audio_delay * 1000)}:all=1")
        filters += [f"apad=whole_dur={DURATION:.3f}", f"atrim=duration={DURATION:.3f}"]
        cmd += ["-i", str(audio), "-af", ",".join(filters), "-c:a", "aac", "-b:a", "160k"]
    else:
        cmd += ["-an"]
    cmd += ["-t", f"{DURATION:.3f}", "-c:v", "libx264", "-preset", "medium",
            "-crf", str(crf), "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(output)]
    return cmd


def render_video(args: argparse.Namespace) -> None:
    width, height, fps = args.width, args.height, args.fps
    if width < 320 or width % 2 or height % 2 or abs(width / height - 16 / 9) > 0.01:
        raise SystemExit("Use an even 16:9 size, at least 320x180 (for example --width 1280 --height 720).")
    if not 8 <= fps <= 60:
        raise SystemExit("--fps must be between 8 and 60.")
    if not 15 <= args.crf <= 28:
        raise SystemExit("--crf must be between 15 and 28 (lower is higher quality).")
    if not 0 <= args.audio_delay <= 10:
        raise SystemExit("--audio-delay must be between 0 and 10 seconds.")

    output = Path(args.output).expanduser().resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    if args.still is not None:
        still_t = clamp(args.still, 0.0, DURATION - 1 / fps)
        frame = render_frame(still_t, width, height)
        frame.save(output, quality=95)
        print(f"Still frame saved: {output} at t={still_t:.2f}s")
        return

    custom_audio = Path(args.audio).expanduser().resolve() if args.audio else None
    if args.silent and custom_audio is not None:
        raise SystemExit("Choose either --silent or --audio, not both.")
    if custom_audio is not None and not custom_audio.is_file():
        raise SystemExit(f"Audio file not found: {custom_audio}")

    tempdir = None
    audio_path: Path | None = None
    if not args.silent:
        if custom_audio is not None:
            audio_path = custom_audio
        else:
            tempdir = tempfile.TemporaryDirectory(prefix="claude-birthday-")
            audio_path = Path(tempdir.name) / "birthday-instrumental.wav"
            print("Building the instrumental Happy Birthday melody (no vocals)…")
            write_instrumental(audio_path)

    delay = args.audio_delay if custom_audio is not None else 0.0
    cmd = ffmpeg_command(width, height, fps, output, audio_path, args.crf, delay)
    try:
        proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.DEVNULL,
                                stderr=subprocess.PIPE, bufsize=width * height * 3 * 2)
    except OSError as exc:
        if tempdir:
            tempdir.cleanup()
        raise SystemExit(f"Could not start the bundled ffmpeg encoder: {exc}") from exc

    total = round(DURATION * fps)
    start_time = time.time()
    try:
        assert proc.stdin is not None
        for frame_no in range(total):
            t = frame_no / fps
            frame = render_frame(t, width, height)
            proc.stdin.write(frame.tobytes())
            if frame_no == total - 1 or frame_no % max(1, fps) == 0:
                elapsed = max(0.001, time.time() - start_time)
                rate = (frame_no + 1) / elapsed
                remaining = (total - frame_no - 1) / max(0.01, rate)
                print(f"\rRendering {frame_no + 1:>4}/{total} frames  "
                      f"{rate:5.1f} fps  ETA {remaining:5.0f}s", end="", flush=True)
        proc.stdin.close()
        stderr = proc.stderr.read() if proc.stderr else b""
        code = proc.wait()
        print()
        if code != 0:
            raise RuntimeError(stderr.decode("utf-8", "replace") or f"ffmpeg exited with {code}")
    except (BrokenPipeError, OSError, RuntimeError) as exc:
        try:
            if proc.stdin and not proc.stdin.closed:
                proc.stdin.close()
        except OSError:
            pass
        if proc.poll() is None:
            proc.terminate()
        stderr = proc.stderr.read() if proc.stderr else b""
        proc.wait()
        if tempdir:
            tempdir.cleanup()
        raise SystemExit(f"Render failed: {exc}\n{stderr.decode('utf-8', 'replace')}") from exc
    finally:
        if tempdir:
            tempdir.cleanup()

    print(f"Wrote {output} ({DURATION:.1f}s, {width}×{height}, {fps} fps)")
    if custom_audio:
        print("Custom audio was padded/trimmed to the 26-second lyric timeline; adjust your source clip if needed.")
    elif not args.silent:
        print("Soundtrack: synthesized instrumental only. Use --audio YOUR_RECORDING.wav for vocals.")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Render the Claude Code birthday lyric video.")
    parser.add_argument("-o", "--output", default=str(ROOT / "out" / "claude-birthday.mp4"),
                        help="output MP4 path (default: out/claude-birthday.mp4 beside this script)")
    parser.add_argument("--width", type=int, default=1280, help="even 16:9 output width; default 1280")
    parser.add_argument("--height", type=int, default=720, help="even 16:9 output height; default 720")
    parser.add_argument("--fps", type=int, default=FPS_DEFAULT, help="frame rate 8–60; default 24")
    parser.add_argument("--crf", type=int, default=18, help="H.264 quality 15–28; lower is higher quality")
    parser.add_argument("--audio", help="optional local song recording; replaces the synthesized accompaniment")
    parser.add_argument("--audio-delay", type=float, default=INTRO,
                        help="delay the supplied recording before the first lyric; default 0.65s")
    parser.add_argument("--silent", action="store_true", help="render without any audio")
    parser.add_argument("--still", type=float, help="save one frame at this timestamp instead of rendering video")
    return parser.parse_args()


if __name__ == "__main__":
    try:
        render_video(parse_args())
    except KeyboardInterrupt:
        print("\nRender cancelled.", file=sys.stderr)
        raise SystemExit(130)
