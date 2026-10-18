#!/usr/bin/env python3
"""start.py — render one of this repo's hand-painted films on YOUR machine.

一个脚本搞定一切:检查/补齐 Node、项目依赖、Chrome、ffmpeg,然后逐帧渲染并编码成 mp4。
只需要 Python 3.8+。Node / Chrome / ffmpeg 缺哪个就自动下载到 `.toolchain/`(不装系统里、不要 root)。

用法 / Usage:

    python start.py                       # 渲染 projects/huiyi
    python start.py --project chaoxi-tide # 渲染指定项目(名字或路径)
    python start.py --list                # 列出仓库里的影片
    python start.py --check               # 只体检环境,什么都不渲染
    python start.py --sheet 1,6,12        # 只出 3 张缩略图,先看效果
    python start.py --audio 我的歌.mp3    # 把音频合进成片

    python start.py --project chaoxi-tide --audio ~/Music/tide.mp3 --workers 8

一切都不写进系统目录:下载的文件都在仓库内的 `.toolchain/` 里,删掉即可复原。
"""
import argparse
import json
import os
import platform
import re
import shutil
import subprocess
import sys
import tarfile
import urllib.request
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent
TOOLS = ROOT / ".toolchain"
NODE_MAJOR = "22"          # what we download when the machine has no Node
IS_WIN = platform.system() == "Windows"
IS_MAC = platform.system() == "Darwin"
EXE = ".exe" if IS_WIN else ""

# ---------------------------------------------------------------- pretty output
def say(msg):    print(f"\033[1m▸ {msg}\033[0m" if not IS_WIN else f"▸ {msg}", flush=True)
def ok(msg):     print(f"  ✓ {msg}", flush=True)
def warn(msg):   print(f"  ! {msg}", flush=True)
def die(msg, hint=None):
    print(f"\n✗ {msg}", file=sys.stderr)
    if hint:
        print(f"  {hint}", file=sys.stderr)
    sys.exit(1)

def find(cmd):
    """PATH 上找可执行文件;也看我们在 .toolchain/bin 里放的东西。"""
    return shutil.which(cmd) or next((p for p in [TOOLS / "bin" / (cmd + EXE), TOOLS / (cmd + EXE)] if p.exists()), None)

def run(cmd, **kw):
    printable = " ".join(str(c) for c in cmd)
    print(f"    $ {printable}", flush=True)
    return subprocess.run([str(c) for c in cmd], **kw)

def download(url, dest):
    dest.parent.mkdir(parents=True, exist_ok=True)
    say(f"下载 {url.split('/')[-1]}")
    with urllib.request.urlopen(url, timeout=120) as r, open(dest, "wb") as f:
        shutil.copyfileobj(r, f, 1024 * 256)
    ok(f"{dest}  ({dest.stat().st_size / 1048576:.1f} MB)")

# ---------------------------------------------------------------- Node
def node_bin():
    """机器上的 Node,或者我们自己下的那一份。"""
    local = TOOLS / "node" / ("node" + EXE)
    if local.exists():
        return local
    return find("node")

def node_platform():
    m = platform.machine().lower()
    arm = "arm64" if m in ("arm64", "aarch64") else "x64"
    if IS_WIN:   return f"win-{arm}", ".zip"
    if IS_MAC:   return f"darwin-{arm}", ".tar.gz"
    return f"linux-{arm}", ".tar.gz"

def ensure_node():
    node = node_bin()
    if node:
        v = subprocess.run([str(node), "-v"], capture_output=True, text=True).stdout.strip()
        ok(f"Node {v}  ({node})")
        return node
    plat, ext = node_platform()
    warn("没找到 Node —— 下一份便携版到 .toolchain/node/")
    # 先问 nodejs.org 最新的 vNN 是哪个版本,问不到就用一个已知可用的版本兜底
    version = None
    try:
        with urllib.request.urlopen(f"https://nodejs.org/dist/latest-v{NODE_MAJOR}.x/", timeout=60) as r:
            html = r.read().decode("utf-8", "ignore")
        m = re.search(rf"node-(v{NODE_MAJOR}\.\d+\.\d+)-{re.escape(plat)}\{ext}", html) or \
            re.search(rf"(v{NODE_MAJOR}\.\d+\.\d+)", html)
        version = m.group(1)
    except Exception as e:
        warn(f"查不到版本({e});用兜底版本")
    version = version or f"v{NODE_MAJOR}.11.0"
    name = f"node-{version}-{plat}{ext}"
    arc = TOOLS / name
    download(f"https://nodejs.org/dist/{version}/{name}", arc)
    say("解包")
    if ext == ".zip":
        with zipfile.ZipFile(arc) as z: z.extractall(TOOLS)
        src = TOOLS / f"node-{version}-{plat}"
        if (TOOLS / "node").exists(): shutil.rmtree(TOOLS / "node", ignore_errors=True)
        src.rename(TOOLS / "node")
    else:
        with tarfile.open(arc, "r:gz") as t: t.extractall(TOOLS)
        src = TOOLS / f"node-{version}-{plat}"
        if (TOOLS / "node").exists(): shutil.rmtree(TOOLS / "node", ignore_errors=True)
        src.rename(TOOLS / "node")
    arc.unlink()
    node = node_bin()
    v = subprocess.run([str(node), "-v"], capture_output=True, text=True).stdout.strip()
    ok(f"Node {v}  ({node})")
    return node

# ---------------------------------------------------------------- the project
def list_projects():
    return sorted(p.name for p in (ROOT / "projects").iterdir() if (p / "package.json").exists())

def resolve_project(name):
    if name is None:
        return ROOT / "projects" / "huiyi"
    p = Path(name).expanduser()
    if (p / "package.json").exists(): return p.resolve()
    p = ROOT / "projects" / name
    if (p / "package.json").exists(): return p
    die(f"找不到项目 “{name}”", f"可用的: {', '.join(list_projects())}")

def ensure_deps(project, node):
    npm = find("npm") or Path(str(node)).parent / ("npm.cmd" if IS_WIN else "npm")
    if not Path(npm).exists():
        die("没有 npm", "装一个 Node 再跑,或用 --check 看看缺什么")
    if (project / "node_modules" / "puppeteer-core").exists() and (project / "node_modules" / "p5.brush").exists():
        ok("项目依赖已在 node_modules/")
        return npm
    say(f"安装项目依赖(npm install,在 {project.name}/)")
    r = run([npm, "install", "--silent"], cwd=project)
    if r.returncode: die("npm install 失败")
    ok("依赖装好了")
    return npm

# ---------------------------------------------------------------- Chrome
CHROME_HINTS = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/usr/bin/chromium", "/usr/bin/chromium-browser",
    "/snap/bin/chromium",
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    os.path.expandvars(r"%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe") if IS_WIN else "",
    # what tools/setup.sh leaves behind (Linux servers, this repo's own sandbox)
    str(Path.home() / ".toolchain/chrome-root/chrome"),
]
def chrome_bin():
    env = os.environ.get("CHROME_PATH")
    if env and Path(env).exists(): return Path(env)
    own = TOOLS / "chrome"
    if own.exists():
        hit = [p for p in own.rglob("chrome*") if p.is_file() and (p.name.startswith("chrome") or p.name.startswith("Chromium"))]
        if hit: return sorted(hit, key=lambda p: -p.stat().st_size)[0]
    for h in CHROME_HINTS:
        if h and Path(h).exists(): return Path(h)
    return None

def ensure_chrome(npm):
    c = chrome_bin()
    if c:
        ok(f"用本机浏览器:{c}")
        return c
    say("本机没有 Chrome —— 下载一份 Chrome for Testing(约 150 MB,只放在 .toolchain/)")
    r = run([npm, "exec", "--yes", "--", "@puppeteer/browsers", "install", "chrome@stable", "--path", TOOLS / "chrome"], cwd=ROOT)
    if r.returncode:
        die("Chrome 下载失败", "装一个 Google Chrome 后重跑,或设 CHROME_PATH=<chrome 路径>")
    c = chrome_bin()
    if not c: die("下载完了却没找到 chrome 可执行文件")
    ok(f"{c}")
    return c

# ---------------------------------------------------------------- ffmpeg
def _shim_ffmpeg(bin_):
    """render.mjs 是 spawn('ffmpeg') 起的,所以 PATH 上得有一个就叫 ffmpeg 的东西。"""
    d = TOOLS / "bin"; d.mkdir(parents=True, exist_ok=True)
    shim = d / ("ffmpeg.exe" if IS_WIN else "ffmpeg")
    if shim.exists() or shim.is_symlink(): shim.unlink()
    try: shim.symlink_to(bin_)
    except OSError: shutil.copy2(bin_, shim)
    if not IS_WIN: shim.chmod(0o755)
    return shim

def ensure_ffmpeg(npm):
    """PATH 上的 ffmpeg → npm 的 ffmpeg-static → pip 的 imageio-ffmpeg。三条路都试试。"""
    f = find("ffmpeg")
    if f:
        ok(f"ffmpeg:{f}")
        return f
    say("没有 ffmpeg —— 自动取一份放到 .toolchain/(不装进系统)")
    (TOOLS / "ff").mkdir(parents=True, exist_ok=True)
    pkg = TOOLS / "ff" / "package.json"
    if not pkg.exists():
        pkg.write_text('{"name":"ff-static","private":true}\n')
    r = subprocess.run([str(npm), "install", "--silent", "ffmpeg-static"], cwd=TOOLS / "ff",
                       capture_output=True, text=True)
    entry = TOOLS / "ff" / "node_modules" / "ffmpeg-static" / "index.js"
    if r.returncode == 0 and entry.exists():
        bin_ = subprocess.run([str(node_bin()), "-e", f"process.stdout.write(require({json.dumps(str(entry))})||'')"],
                              capture_output=True, text=True).stdout.strip()
        if bin_ and Path(bin_).exists():
            shim = _shim_ffmpeg(bin_)
            ok(f"ffmpeg(from npm):{bin_}")
            return shim
    warn("npm 那份没成功(网络/证书),改用 Python 的 imageio-ffmpeg")
    target = TOOLS / "py"
    r = subprocess.run([sys.executable, "-m", "pip", "install", "--quiet", "--disable-pip-version-check",
                        "--target", str(target), "imageio-ffmpeg"], capture_output=True, text=True)
    hits = [p for p in target.rglob("ffmpeg*") if p.is_file() and os.access(p, os.X_OK) and p.stat().st_size > 1_000_000]
    if r.returncode == 0 and hits:
        bin_ = sorted(hits, key=lambda p: -p.stat().st_size)[0]
        shim = _shim_ffmpeg(bin_)
        ok(f"ffmpeg(from pip):{bin_}")
        return shim
    die("没能自动取到 ffmpeg",
        "手动装一个(Windows: gyan.dev / macOS: brew install ffmpeg / Linux: apt install ffmpeg)后重跑即可")

# ---------------------------------------------------------------- render
def main():
    ap = argparse.ArgumentParser(add_help=True, description="渲染这个仓库里的手绘影片(自动装依赖)")
    ap.add_argument("--project", "-p", help="projects/ 下的项目名或路径(默认 huiyi)")
    ap.add_argument("--audio", "-a", help="要合进成片的音频文件")
    ap.add_argument("--workers", "-w", type=int, default=max(1, (os.cpu_count() or 2) // 2), help="并行渲染的浏览器数(默认 CPU 核数的一半)")
    ap.add_argument("--fps", type=int, default=24, help="输出帧率(默认 24;歌词 MV 可用 12 帧 on twos)")
    ap.add_argument("--sheet", help="只渲染几个时间点的缩略图,例如 1,6,12")
    ap.add_argument("--range", dest="range_", help="只渲染一段时间,例如 6:12(秒)")
    ap.add_argument("--soft-gl", action="store_true", help="强制软件渲染(没有 GPU 的机器/服务器)")
    ap.add_argument("--list", action="store_true", help="列出影片")
    ap.add_argument("--check", action="store_true", help="只检查环境")
    ap.add_argument("--out", help="输出文件名(默认 out/video.mp4)")
    args = ap.parse_args()

    print("\n\033[1m手绘影片渲染器 / hand-painted film renderer\033[0m\n")
    if args.list:
        for n in list_projects(): print(f"  - {n}")
        return

    project = resolve_project(args.project)
    node = ensure_node()
    npm = ensure_deps(project, node)
    chrome = ensure_chrome(npm)
    ffmpeg = ensure_ffmpeg(npm)
    if args.check:
        print("\n环境 OK。去掉 --check 就开始渲染。\n")
        return

    # Linux 上的 Chrome 常常需要它自带的那几本 .so:Chrome 自己目录里的(swiftshader),
    # 以及 tools/setup.sh 解出来的 al2023/lib(NSS)。有就都加到 LD_LIBRARY_PATH。
    libs = [Path(chrome).parent, Path(chrome).parent.parent / "al2023" / "lib"]
    env = dict(os.environ,
               CHROME_PATH=str(chrome),
               PATH=os.pathsep.join([str(Path(ffmpeg).parent), str(Path(node).parent), str(TOOLS / "bin"), os.environ.get("PATH", "")]))
    if not IS_WIN:
        os.environ.setdefault("LD_LIBRARY_PATH", "")
        env["LD_LIBRARY_PATH"] = os.pathsep.join([str(d) for d in libs if d.is_dir()] + [os.environ.get("LD_LIBRARY_PATH", "")]).strip(os.pathsep)
    env["NO_COLOR"] = "1"

    def render(flags, label):
        say(label)
        return run([node, "render.mjs", *flags], cwd=project, env=env).returncode

    soft = ["--soft-gl"] if args.soft_gl else []
    cache = TOOLS / "render.json"
    cfg = json.loads(cache.read_text()) if cache.exists() else {}
    if not soft and cfg.get("soft_gl") is True:
        soft = ["--soft-gl"]; ok("这台机器用软件渲染(上次已经测出来了)")
    elif not soft and cfg.get("soft_gl") is None:
        say("先渲染一帧,看看这台机器的浏览器拿不拿得到 WebGL(最多等 90 秒)")
        probe = [node, "render.mjs", "--sheet=0", "--cols=1", "--w=160", "--out=out/check/probe.jpg", "--workers=1"]
        good = False
        try:
            r = subprocess.run([str(c) for c in probe], cwd=project, env=env, capture_output=True, text=True, timeout=90)
            good = r.returncode == 0
        except subprocess.TimeoutExpired:
            warn("显卡那条路卡住了 —— 换软件渲染(swiftshader)")
        if not good:
            try:
                r2 = subprocess.run([str(c) for c in probe + ["--soft-gl"]], cwd=project, env=env, capture_output=True, text=True, timeout=300)
            except subprocess.TimeoutExpired:
                die("软件渲染也卡住了", "把报错发我;或先手动跑 node render.mjs --sheet=0 --soft-gl 看看")
            if r2.returncode:
                print((r2.stdout + r2.stderr)[-1500:]); die("这一帧没渲染出来", "把上面的报错发我看看")
            soft = ["--soft-gl"]; cfg["soft_gl"] = True; ok("用软件渲染(swiftshader),已记住")
        else:
            cfg["soft_gl"] = False; ok("GPU 路径可用")
        cache.write_text(json.dumps(cfg, indent=2))

    if args.sheet:
        sheet = args.sheet
        say(f"缩略图 {sheet} → {project}/out/check/sheet.jpg")
        rc = render([f"--sheet={sheet}", "--cols=3", "--w=560", f"--fps={args.fps}", "--out=out/check/sheet.jpg", *soft, f"--workers={args.workers}"], "渲染缩略图")
        sys.exit(rc)

    frames = ["--frames", f"--workers={args.workers}", f"--fps={args.fps}", *soft]
    if args.range_: frames.append(f"--range={args.range_}")
    if render(frames, f"逐帧渲染({args.workers} 个浏览器并行,可随时 Ctrl-C,再跑会接着上次继续)"): die("渲染中断")
    out = args.out or "out/video.mp4"
    enc = ["--encode", f"--out={out}", f"--fps={args.fps}", *soft]
    if args.audio:
        a = Path(args.audio).expanduser()
        if not a.exists(): die(f"找不到音频 {a}")
        shutil.copy(a, project / "assets" / a.name)
        enc.append(f"--audio=assets/{a.name}")
    if render(enc, "编码成 mp4"): die("编码失败")

    final = project / out
    print()
    ok(f"成片:{final}  ({final.stat().st_size / 1048576:.1f} MB)")
    print("\n双击就能看。想改画面:studio.html 用浏览器打开可以拖时间轴。\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n中断了 —— 渲到一半的帧都留着,再跑一次会继续。\n")
