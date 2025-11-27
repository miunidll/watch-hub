import os
import re
import json
import requests
import subprocess
from pathlib import Path
from datetime import timedelta
from langdetect import detect, DetectorFactory
from concurrent.futures import ThreadPoolExecutor, as_completed
from tqdm import tqdm

DetectorFactory.seed = 0  # deterministic langdetect

API_BASE = "https://api.imdbapi.dev"

HE_LANGS = ["he", "heb", "hebrew"]
EN_LANGS = ["en", "eng", "english"]
KEEP_LANGS = HE_LANGS + EN_LANGS

HEBREW_RANGE = re.compile(r"[\u0590-\u05FF]")
PUNCTUATION = ".,!?;:"

# -----------------------
# IMDb helpers
# -----------------------

def imdb_search(title):
    title_encoded = title.replace(" ", "%20")
    url = f"{API_BASE}/search/titles?query={title_encoded}"
    try:
        r = requests.get(url, timeout=10)
        data = r.json()
        if "titles" in data and len(data["titles"]) > 0:
            return data["titles"][0]["id"]
    except Exception as e:
        print(f"IMDb search failed for URL: {url} | Error: {e}")
    return None

def imdb_get_episodes(imdb_id, season_num):
    url = f"{API_BASE}/titles/{imdb_id}/episodes?season={season_num}"
    try:
        r = requests.get(url, timeout=10)
        data = r.json()
        eps = {}
        for ep in data.get("episodes", []):
            eps[int(ep["episodeNumber"])] = {
                "id": ep.get("id", ""),
                "title": ep.get("title", f"Episode {ep.get('episodeNumber',1)}"),
                "plot": ep.get("plot", ""),
                "duration": f"{int(ep.get('runtimeSeconds',0)//60)}m"
            }
        return eps
    except Exception as e:
        print(f"Failed to fetch episodes for season {season_num}: {e}")
        return {}

def fetch_youtube_trailer(title):
    query = f"{title} trailer"
    url = f"https://www.youtube.com/results?search_query={query.replace(' ','+')}"
    try:
        r = requests.get(url)
        match = re.search(r"watch\?v=(\S{11})", r.text)
        if match:
            return match.group(1)
    except Exception:
        pass
    return ""

# -----------------------
# Video helpers
# -----------------------

def get_mkv_tracks(mkv_path):
    try:
        output = subprocess.run(
            ["mkvmerge", "-J", str(mkv_path)],
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True
        ).stdout
        data = json.loads(output)
        return [t for t in data.get("tracks", []) if t.get("type") == "subtitles"]
    except Exception as e:
        print(f"[!] Failed to get tracks from {mkv_path.name}: {e}")
        return []

def detect_lang_srt(srt_path):
    try:
        with open(srt_path, "r", encoding="utf-8") as f:
            text = f.read()
        return detect(text)
    except Exception:
        return None

def extract_subtitle(mkv_path, track_id, out_path):
    subprocess.run(["mkvextract", "tracks", str(mkv_path), f"{track_id}:{out_path}"])

def fix_hebrew_punctuation(line):
    if not HEBREW_RANGE.search(line):
        return line
    trimmed = line.rstrip("\n").strip()
    if not trimmed:
        return line
    if trimmed[0] in PUNCTUATION:
        flipped = trimmed[1:].rstrip() + trimmed[0]
        return flipped + ("\n" if line.endswith("\n") else "")
    if trimmed[-1] in PUNCTUATION:
        return line
    return line

def apply_rtl_force(line):
    if HEBREW_RANGE.search(line):
        stripped = line.strip("\n")
        return f"\u202B{stripped}\u202C\n"
    return line

def convert_srt_to_vtt(srt_path):
    vtt_path = srt_path.with_suffix(".vtt")
    with open(srt_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
    with open(vtt_path, "w", encoding="utf-8") as f:
        f.write("WEBVTT\n\n")
        for line in lines:
            if "-->" in line:
                line = re.sub(r"(\d+:\d+:\d+),(\d+)", r"\1.\2", line)
                f.write(line)
                continue
            if line.strip().isdigit() or line.strip() == "":
                f.write(line)
                continue
            if HEBREW_RANGE.search(line):
                line = fix_hebrew_punctuation(line)
                line = apply_rtl_force(line)
            f.write(line)
    srt_path.unlink()
    return vtt_path

def process_subtitles(mkv_path, out_dir):
    out_dir.mkdir(parents=True, exist_ok=True)
    tracks = get_mkv_tracks(mkv_path)
    selected = []
    langs_found = set()

    for t in tracks:
        lang = t.get("properties", {}).get("language", "").lower()
        name = t.get("properties", {}).get("track_name", "").lower()
        if any(x in lang or x in name for x in HE_LANGS) and "hebrew" not in langs_found:
            selected.append((t, "Hebrew"))
            langs_found.add("hebrew")
        elif any(x in lang or x in name for x in EN_LANGS) and "English" not in langs_found:
            selected.append((t, "English"))
            langs_found.add("English")

    fallback = False
    if not selected:
        fallback = True
        temp_dir = out_dir / "temp_subs"
        temp_dir.mkdir(exist_ok=True)
        for t in tracks:
            tid = t["id"]
            srt_path = temp_dir / f"{mkv_path.stem}_track{tid}.srt"
            extract_subtitle(mkv_path, tid, str(srt_path))
            lang_detected = detect_lang_srt(srt_path)
            if lang_detected == "he" and "Hebrew" not in langs_found:
                selected.append(({"id": tid}, "Hebrew"))
                langs_found.add("Hebrew")
            elif lang_detected == "en" and "English" not in langs_found:
                selected.append(({"id": tid}, "English"))
                langs_found.add("English")
            else:
                srt_path.unlink()
        if not any(temp_dir.iterdir()):
            temp_dir.rmdir()

    final_subs = []
    for t, lang in selected:
        tid = t["id"]
        if fallback:
            srt_path = t.get("srt_path", out_dir / f"{mkv_path.stem}_track{tid}.srt")
        else:
            lang_meta = lang.lower()
            srt_path = out_dir / f"{mkv_path.stem}_{lang_meta}.srt"
            extract_subtitle(mkv_path, tid, str(srt_path))
        vtt_path = convert_srt_to_vtt(srt_path)
        relative_sub_path = "/" + os.path.relpath(vtt_path.resolve(), Path.cwd() / "public").replace(os.sep, "/")
        final_subs.append({
            "subtitleUrl": relative_sub_path,
            "language": lang
        })

    return final_subs

# -----------------------
# MKV → MP4 Conversion
# -----------------------

def convert_mkv_to_mp4(mkv_path):
    mp4_path = mkv_path.with_suffix(".mp4")
    cmd = ["ffmpeg", "-y", "-i", str(mkv_path), "-c", "copy", str(mp4_path)]
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if result.returncode == 0 and mp4_path.exists():
        mkv_path.unlink()
        return mp4_path
    return None

# -----------------------
# Main scanning
# -----------------------

def scan_folder(folder_name, title_override=None):
    # Determine tv or movies path
    base_dir = Path("public/content")
    tv_path = base_dir / "tv" / folder_name
    movies_path = base_dir / "movies" / folder_name
    folder = tv_path if tv_path.exists() else movies_path
    if not folder.exists():
        print(f"Folder not found in tv or movies: {folder_name}")
        return

    folder_name_clean = folder.name
    search_title = title_override or folder_name_clean
    imdb_id = imdb_search(search_title)
    print(f"Detected IMDb ID: {imdb_id}")

    season_folders = sorted([f for f in folder.iterdir() if f.is_dir() and re.search(r"S\d+\.COMPLETE", f.name, re.I)])
    is_tv = len(season_folders) > 0

    output = {
        "id": imdb_id or folder_name_clean.replace(" ", "_"),
        "title": search_title,
        "type": "tv" if is_tv else "movie",
        "poster": "",
        "description": "",
        "trailer": fetch_youtube_trailer(search_title),
        "year": "",
    }

    if imdb_id:
        try:
            url = f"{API_BASE}/titles/{imdb_id}"
            r = requests.get(url, timeout=10)
            data = r.json()
            output["title"] = data.get("primaryTitle", search_title)
            output["poster"] = data.get("primaryImage", {}).get("url", "")
            output["description"] = data.get("plot", "")
            output["year"] = data.get("startYear", "")
        except Exception as e:
            print("Failed to fetch IMDb details:", e)

    def process_file(f):
        subtitle_dir = f.parent / "subtitles"
        subtitle_dir.mkdir(exist_ok=True)
        vtts = process_subtitles(f, subtitle_dir)
        mp4_file = f
        if f.suffix.lower() == ".mkv":
            mp4_file = convert_mkv_to_mp4(f)
            if not mp4_file:
                print(f"Failed to convert {f.name}")
                mp4_file = f
        # return relative web path
        relative_path = "/" + os.path.relpath(mp4_file.resolve(), Path.cwd() / "public").replace(os.sep, "/")
        ep_match = re.search(r"[Ss](\d+)[Ee](\d+)", f.name)
        e_num = int(ep_match.group(2)) if ep_match else 1
        return {
            "id": f"e{e_num}",
            "title": f.stem,
            "number": e_num,
            "videoUrl": relative_path,
            "duration": "",
            "subtitles": vtts
        }

    if is_tv:
        output["seasons"] = []
        for season_folder in season_folders:
            m = re.search(r"S(\d+)\.COMPLETE", season_folder.name, re.I)
            if not m:
                continue
            season_num = int(m.group(1))
            episodes_meta = imdb_get_episodes(imdb_id, season_num)
            files = sorted([f for f in season_folder.iterdir() if f.is_file() and f.suffix in [".mp4",".mkv"]])

            episodes = []
            with ThreadPoolExecutor(max_workers=4) as executor:
                future_map = {executor.submit(process_file, f): f for f in files}
                for future in tqdm(as_completed(future_map), total=len(files), desc="Converting MKVs", ncols=100):
                    ep_data = future.result()
                    ep_info = episodes_meta.get(ep_data["number"], {"title": ep_data["title"], "duration": ""})
                    ep_data["title"] = ep_info.get("title")
                    ep_data["duration"] = ep_info.get("duration")
                    episodes.append(ep_data)

            output["seasons"].append({
                "id": f"s{season_num}",
                "number": season_num,
                "episodes": sorted(episodes, key=lambda x: x["number"])
            })
    else:
        files = [f for f in folder.iterdir() if f.is_file() and f.suffix in [".mp4",".mkv"]]
        episodes = []
        with ThreadPoolExecutor(max_workers=4) as executor:
            future_map = {executor.submit(process_file, f): f for f in files}
            for future in as_completed(future_map):
                episodes.append(future.result())
        if episodes:
            output["videoUrl"] = episodes[0]["videoUrl"]
            output["duration"] = episodes[0]["duration"]
            output["subtitles"] = episodes[0]["subtitles"]

    # Save JSON
    json_path = Path("src/content") / ("tv" if is_tv else "movies") / f"{folder_name_clean}.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2)
    print(f"\nJSON saved: {json_path}\n")

# -----------------------
# Run
# -----------------------

if __name__ == "__main__":
    folder_input = input("Enter folder name (inside public/content/tv or movies): ").strip()
    title = input("Enter title override (optional): ").strip() or None
    print("\nProcessing started...\n")
    scan_folder(folder_input, title_override=title)
