import os
import re
import json
import requests
import subprocess
from pathlib import Path
from datetime import timedelta
from langdetect import detect, DetectorFactory

DetectorFactory.seed = 0  # deterministic langdetect

API_BASE = "https://api.imdbapi.dev"

HE_LANGS = ["he", "heb", "hebrew"]
EN_LANGS = ["en", "eng", "english"]
KEEP_LANGS = HE_LANGS + EN_LANGS

# -----------------------
# IMDb helpers
# -----------------------

def imdb_search(title):
    """Search IMDb API for a title, return the IMDb ID."""
    title_encoded = title.replace(" ", "%20")
    url = f"{API_BASE}/search/titles?query={title_encoded}"
    try:
        r = requests.get(url, timeout=10)
        data = r.json()
        if "titles" in data and len(data["titles"]) > 0:
            return data["titles"][0]["id"]
        else:
            print(f"No results found for search. URL: {url}")
    except Exception as e:
        print(f"IMDb search failed for URL: {url}")
        print("Error:", e)
    return None

def imdb_get_episodes(imdb_id, season_num):
    """Fetch episode titles and info for a season."""
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
    """Return YouTube video ID from a search."""
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
    """Return list of subtitle tracks from mkvmerge JSON."""
    try:
        output = subprocess.run(
            ["mkvmerge", "-J", str(mkv_path)],
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True
        ).stdout
        data = json.loads(output)
        tracks = [t for t in data.get("tracks", []) if t.get("type") == "subtitles"]
        return tracks
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

def convert_srt_to_vtt(srt_path):
    vtt_path = srt_path.with_suffix(".vtt")
    with open(srt_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
    with open(vtt_path, "w", encoding="utf-8") as f:
        f.write("WEBVTT\n\n")
        for line in lines:
            line = re.sub(r"(\d+:\d+:\d+),(\d+)", r"\1.\2", line)
            f.write(line)
    srt_path.unlink()
    return vtt_path

def process_subtitles(mkv_path, out_dir):
    out_dir.mkdir(parents=True, exist_ok=True)
    tracks = get_mkv_tracks(mkv_path)

    selected = []
    langs_found = set()

    # First attempt: metadata matching
    for t in tracks:
        lang = t.get("properties", {}).get("language", "").lower()
        name = t.get("properties", {}).get("track_name", "").lower()
        if any(x in lang or x in name for x in HE_LANGS) and "hebrew" not in langs_found:
            selected.append((t, "Hebrew"))
            langs_found.add("hebrew")
        elif any(x in lang or x in name for x in EN_LANGS) and "English" not in langs_found:
            selected.append((t, "English"))
            langs_found.add("English")

    # Fallback
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
        final_subs.append({
            "subtitleUrl": str(vtt_path),
            "language": lang
        })
    return final_subs


# -----------------------
# Main scanning
# -----------------------

def scan_folder(folder_path, title_override=None):
    folder = Path(folder_path)
    if not folder.exists():
        print("Folder does not exist:", folder)
        return

    folder_name = folder.name
    search_title = title_override or folder_name
    imdb_id = imdb_search(search_title)
    print(f"Detected IMDb ID: {imdb_id}")

    season_folders = sorted([f for f in folder.iterdir() if f.is_dir() and re.search(r"S\d+\.COMPLETE", f.name, re.I)])
    is_tv = len(season_folders) > 0

    output = {
        "id": imdb_id or folder_name.replace(" ", "_"),
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

    if is_tv:
        output["seasons"] = []
        for season_folder in season_folders:
            m = re.search(r"S(\d+)\.COMPLETE", season_folder.name, re.I)
            if not m:
                continue
            season_num = int(m.group(1))
            episodes_meta = imdb_get_episodes(imdb_id, season_num)
            episodes = []

            files = sorted([f for f in season_folder.iterdir() if f.is_file() and f.suffix in [".mp4",".mkv"]])
            for f in files:
                ep_match = re.search(r"[Ss](\d+)[Ee](\d+)", f.name)
                if ep_match:
                    e_num = int(ep_match.group(2))
                    ep_info = episodes_meta.get(e_num, {"title": f"Episode {e_num}", "duration": ""})
                    subtitle_dir = season_folder / "subtitles"
                    subtitle_dir.mkdir(exist_ok=True)
                    vtts = process_subtitles(f, subtitle_dir)
                    episodes.append({
                        "id": f"e{e_num}",
                        "title": ep_info.get("title"),
                        "number": e_num,
                        "videoUrl": str(f.resolve()),
                        "duration": ep_info.get("duration"),
                        "subtitles": vtts
                    })

            output["seasons"].append({
                "id": f"s{season_num}",
                "number": season_num,
                "episodes": sorted(episodes, key=lambda x: x["number"])
            })
    else:
        # Movie
        files = [f for f in folder.iterdir() if f.is_file() and f.suffix in [".mp4",".mkv"]]
        if files:
            f = files[0]
            output["videoUrl"] = str(f.resolve())
            output["duration"] = ""
            subtitle_dir = folder / "subtitles"
            subtitle_dir.mkdir(exist_ok=True)
            output["subtitles"] = process_subtitles(f, subtitle_dir)

    # Save JSON
    json_path = f"{folder_name}.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2)
    print(f"\nJSON saved: {json_path}\n")

# -----------------------
# Run
# -----------------------

if __name__ == "__main__":
    folder = input("Enter folder path: ").strip()
    title = input("Enter title override (optional): ").strip() or None
    print("\nProcessing started...\n")
    scan_folder(folder, title_override=title)
