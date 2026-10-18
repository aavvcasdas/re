#!/usr/bin/env python3
"""beat_grid.py — 把一首歌量成一张「可依赖的时间表」(audiomap.json)。

一次量好，后面所有镜头切点、卡拉 OK 唱词、渲染长度都只从这张表来 —— 不再靠耳朵猜、
不再用第二套工具重复量（这是 ReelMimic / lemo-opuscar 两个上游项目共同的做法：
「一个分析器，然后信它」）。

    python3 tools/beat_grid.py projects/chaoxi2/assets/song.mp3 -o projects/chaoxi2/audiomap.json --print
    python3 tools/beat_grid.py song.mp3 --anchors 0.04,1.98,4.02 --print     # 用已知唱句起点校准 BPM/相位

量出来的东西（确定性：同一个文件永远给同一张表）：
  audio.duration_sec          时长
  tempo.bpm / beat_sec / offset   速度、一拍多长、第一正拍在第几秒（comb 粗测 → 相位细调 → 锚点校准）
  beats[]                     每一拍的时刻（切点就从这里取）
  onsets[] / onset_rate       打击点
  energy[]                    每 0.5 s 的响度 / 低频 / 人声带能量（分段与「爆点」用）
  key_moments[]               能量跳变最大的几处（爆点候选）
  phrases[]                   人声带能量包络的起句点（已吸附到拍网格，附半拍标记）
  silent[]                    近乎无声的区间
  trust                       'beat_cut'（节奏是真的，切点卡拍）/ 'phrase_flow'（慢歌，按乐句走）

依赖：python3 -m pip install librosa numpy soundfile
"""
from __future__ import annotations

import argparse
import json
import math
import sys
from pathlib import Path

try:
    import numpy as np
    import librosa
except ImportError as e:  # pragma: no cover
    sys.exit(f"missing dependency: {e}. Run: python3 -m pip install librosa numpy soundfile")

HOP = 512
SR = 22050


def load(path: str):
    y, sr = librosa.load(path, sr=SR, mono=True)
    return y, sr


def band_energy(S, freqs, lo, hi):
    m = (freqs >= lo) & (freqs < hi)
    if not m.any():
        return np.zeros(S.shape[1])
    return S[m].mean(axis=0)


def smooth(x, frames):
    if frames <= 1:
        return x
    k = np.ones(frames) / frames
    return np.convolve(x, k, mode="same")


def comb_score(env, fps, bpm):
    """Mean onset strength sampled on a beat grid (phase 0). Coarse tempo vote."""
    period = 60.0 / bpm * fps
    k = max(2, int(round(period)))
    idx = np.arange(0, len(env) - k, k)
    if len(idx) < 4:
        return 0.0
    return float(env[idx].mean())


def best_phase(env, fps, bpm, steps=600):
    """Best grid phase for a tempo: the phase whose grid lands on the strongest onsets."""
    period = 60.0 / bpm * fps
    best = (-1.0, 0.0)
    for ph in np.linspace(0.0, period, int(steps), endpoint=False):
        idx = np.arange(ph, len(env), period).astype(int)
        idx = idx[idx < len(env)]
        if len(idx) < 4:
            continue
        s = float(env[idx].mean())
        if s > best[0]:
            best = (s, float(ph))
    return best


def fit_tempo(env, fps, anchors=None, bpm_min=60.0, bpm_max=200.0, step=0.1):
    """Comb over tempo; with anchors, score how well a grid explains the known phrase starts."""
    bpms = np.arange(bpm_min, bpm_max + 1e-9, step)
    if anchors is not None and len(anchors) >= 3:
        a = np.asarray(anchors, dtype=float)
        scored = []
        for bpm in bpms:
            beat = 60.0 / bpm
            # residual of every anchor to the nearest grid point, allowing a shared offset
            frac = np.mod(a, beat)
            # circular mean of the residuals → the shared offset that best explains them
            ang = frac / beat * 2 * math.pi
            mean_ang = math.atan2(np.sin(ang).mean(), np.cos(ang).mean())
            off = (mean_ang / (2 * math.pi)) % 1.0 * beat
            resid = np.abs(np.mod(a - off + beat / 2, beat) - beat / 2)
            scored.append((float(-np.sqrt((resid ** 2).mean())), float(bpm), float(off)))
        scored.sort(reverse=True)
        rms = -scored[0][0]
        bpm = scored[0][1]
        off = scored[0][2]
        return bpm, off, rms, rms < 0.06
    scores = [(comb_score(env, fps, b), float(b)) for b in bpms]
    # fold octaves: prefer the candidate whose double/half is also strong (a real tempo, not a subdivision)
    def near(b, target, tol=1.5):
        return any(abs(bb - target) <= tol for s, bb in scores if s > 0.9 * max(x[0] for x in scores))
    scores.sort(reverse=True)
    bpm = scores[0][1]
    for s, b in scores[:25]:
        if near(b, b * 2) or near(b, b / 2):
            bpm = b
            break
    _, ph = best_phase(env, fps, bpm)
    return bpm, ph / fps, None, None


def segments(mask, times, min_len=0.35):
    out, start = [], None
    for i, m in enumerate(mask):
        if m and start is None:
            start = times[i]
        elif not m and start is not None:
            if times[i] - start >= min_len:
                out.append((start, times[i]))
            start = None
    if start is not None and times[-1] - start >= min_len:
        out.append((start, float(times[-1])))
    return out


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("audio")
    ap.add_argument("-o", "--out", default=None, help="write audiomap.json here")
    ap.add_argument("--anchors", default=None, help="known phrase starts in seconds, comma separated (calibrates bpm/phase)")
    ap.add_argument("--bpm", type=float, default=None, help="trust this tempo instead of measuring it")
    ap.add_argument("--bpm-min", type=float, default=60.0)
    ap.add_argument("--bpm-max", type=float, default=200.0)
    ap.add_argument("--vocal-min", type=float, default=0.42, help="vocal-band threshold (fraction of its 80th pct)")
    ap.add_argument("--print", dest="do_print", action="store_true")
    args = ap.parse_args()

    y, sr = load(args.audio)
    fps = sr / HOP
    dur = len(y) / sr
    S = np.abs(librosa.stft(y, n_fft=2048, hop_length=HOP))
    freqs = librosa.fft_frequencies(sr=sr, n_fft=2048)
    times = np.arange(S.shape[1]) / fps

    voc = smooth(band_energy(S, freqs, 180, 3500), 9)
    low = smooth(band_energy(S, freqs, 30, 150), 9)
    rms = librosa.feature.rms(y=y, hop_length=HOP)[0]
    env = librosa.onset.onset_strength(y=y, sr=sr, hop_length=HOP)

    anchors = None
    if args.anchors:
        anchors = [float(v) for v in str(args.anchors).replace(";", ",").split(",") if v.strip()]
    if args.bpm:
        bpm = args.bpm
        _, ph = best_phase(env, fps, bpm)
        offset, rms_fit, trusted = ph / fps, None, None
    else:
        bpm, offset, rms_fit, trusted = fit_tempo(env, fps, anchors, args.bpm_min, args.bpm_max)
    beat = 60.0 / bpm
    # keep the offset inside one beat before the first audible hit, so beat 0 is the first downbeat
    offset = offset % beat

    n_beats = int(math.floor((dur - offset) / beat)) + 1
    beats = [round(offset + i * beat, 4) for i in range(n_beats) if offset + i * beat < dur]

    onset_frames = librosa.onset.onset_detect(y=y, sr=sr, hop_length=HOP, backtrack=False, delta=0.12)
    onsets = [round(float(t), 3) for t in librosa.frames_to_time(onset_frames, sr=sr)]

    # vocal phrases: the vocal band lifts above its own floor, and stays up for a real phrase
    thr = args.vocal_min * float(np.percentile(voc, 80))
    voiced = voc > thr
    raw = segments(voiced, times, min_len=0.30)

    def snap(t):
        k = round((t - offset) / beat)
        cand = [offset + (k + d) * beat for d in (0, -0.5, 0.5, -1, 1)]
        return min(cand, key=lambda c: abs(c - t))

    phrases = []
    for a, b in raw:
        st = snap(a)
        k = (st - offset) / beat
        phrases.append({
            "start": round(st, 3), "end": round(b, 3),
            "beat": round(k, 2), "half_beat": abs(k - round(k)) > 0.2,
            "off_sec": round(st - a, 3), "dur": round(b - a, 3),
        })
    # merge phrases that the snap pushed onto the same beat
    merged = []
    for p in phrases:
        if merged and abs(p["start"] - merged[-1]["start"]) < 0.2:
            merged[-1]["end"] = p["end"]
            merged[-1]["dur"] = round(merged[-1]["end"] - merged[-1]["start"], 3)
        else:
            merged.append(p)
    phrases = merged

    # energy map every 0.5 s + the biggest jumps (drop / surge candidates)
    step = max(1, int(round(0.5 * fps)))
    energy = []
    for i in range(0, len(rms) - 1, step):
        j = min(i + step, len(rms))
        energy.append({
            "t": round(times[i], 2),
            "rms": round(float(rms[i:j].mean()), 4),
            "low": round(float(low[i:j].mean()), 3),
            "vocal": round(float(voc[i:j].mean()), 3),
        })
    jumps = []
    for i in range(1, len(energy)):
        d = energy[i]["rms"] - energy[i - 1]["rms"]
        jumps.append((d, energy[i]["t"]))
    jumps.sort(reverse=True)
    key_moments = [{"t": t, "jump": round(d, 4)} for d, t in jumps[:8]]

    silent = [{"start": round(a, 2), "end": round(b, 2)} for a, b in
              segments(rms < 0.01 * float(np.percentile(rms, 95)), times, min_len=0.5)]

    # is the grid real? a rhythmic track puts most of its onsets within ~60 ms of a beat
    if onsets:
        d = [min(abs((t - offset) / beat - round((t - offset) / beat)) for _ in [0]) * beat for t in onsets]
        on_grid = sum(1 for x in d if x < 0.06) / len(d)
    else:
        on_grid = 0.0
    trust = "beat_cut" if on_grid >= 0.5 else "phrase_flow"

    amap = {
        "audio": {"path": str(args.audio), "duration_sec": round(dur, 3), "sr": sr,
                  "peak": round(float(np.abs(y).max()), 4)},
        "tempo": {"bpm": round(float(bpm), 3), "beat_sec": round(beat, 5),
                  "offset": round(offset, 4), "beats": len(beats),
                  "anchor_rms_fit": None if rms_fit is None else round(rms_fit, 4),
                  "onset_grid_ratio": round(on_grid, 3), "trust": trust,
                  "source": "anchor-fit" if anchors else ("given" if args.bpm else "comb+phase")},
        "beats": beats,
        "onsets": onsets,
        "onset_rate": round(len(onsets) / dur, 2),
        "phrases": phrases,
        "energy": energy,
        "key_moments": key_moments,
        "silent": silent,
    }
    text = json.dumps(amap, ensure_ascii=False, indent=2)
    if args.out:
        p = Path(args.out)
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(text + "\n", encoding="utf-8")
    if args.do_print or not args.out:
        t = amap["tempo"]
        print(f"duration {amap['audio']['duration_sec']} s   {t['bpm']} BPM ({t['source']})  "
              f"beat {t['beat_sec']} s  offset {t['offset']} s  {t['beats']} beats  trust={t['trust']} "
              f"(onsets on grid {t['onset_grid_ratio']})")
        if t["anchor_rms_fit"] is not None:
            print(f"anchor fit rms {t['anchor_rms_fit']} s")
        print(f"phrases: {len(phrases)}   onsets: {len(onsets)} ({amap['onset_rate']}/s)")
        for p in phrases:
            print(f"  {p['start']:7.3f}s  beat {p['beat']:6.2f}{'  (half)' if p['half_beat'] else ''}  len {p['dur']:.2f}s")
        if args.out:
            print(f"wrote {args.out}")
    return amap


if __name__ == "__main__":
    main()
