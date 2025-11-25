import os
import re
import json
import requests
from pathlib import Path
from datetime import timedelta
import subprocess

API_BASE = "https://api.imdbapi.dev"

# -----------------------
# Helpers
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

def get_video_duration(path):
    """Return duration of a video file in format 'Xm' or 'Xh Ym'."""
    try:
        result = subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries",
             "format=duration", "-of",
             "default=noprint_wrappers=1:nokey=1", path],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT
        )
        seconds = float(result.stdout)
        td = timedelta(seconds=int(seconds))
        if td.seconds < 3600:
            return f"{td.seconds // 60}m"
        else:
            return f"{td.seconds // 3600}h {(td.seconds % 3600) // 60}m"
    except Exception:
        return ""

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

    # Determine if TV: check for season folders
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

    # Fetch general IMDb info
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
                    ep_info = episodes_meta.get(e_num, {"title": f"Episode {e_num}", "duration": get_video_duration(str(f))})
                    episodes.append({
                        "id": f"e{e_num}",
                        "title": ep_info.get("title"),
                        "number": e_num,
                        "videoUrl": str(f.resolve()),
                        "duration": ep_info.get("duration")
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
            output["duration"] = get_video_duration(str(f))

    # Save JSON
    json_path = Path(f"{folder_name}.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2)
    print(f"\nJSON saved: {json_path}\n")

    # Pretty print
    print("=== Final Media Info ===")
    print(f"Title      : {output.get('title')}")
    print(f"Type       : {output.get('type')}")
    print(f"Year       : {output.get('year')}")
    print(f"Description: {output.get('description')}")
    print(f"Poster URL : {output.get('poster')}")
    print(f"Trailer    : {output.get('trailer')}")
    if is_tv:
        for season in output["seasons"]:
            print(f"\nSeason {season['number']}:")
            for ep in season["episodes"]:
                print(f"  Ep{ep['number']}: {ep['title']} ({ep['duration']})")
    else:
        print(f"Video URL  : {output.get('videoUrl')}")
        print(f"Duration   : {output.get('duration')}")

# -----------------------
# Run
# -----------------------

if __name__ == "__main__":
    folder = input("Enter folder path: ").strip()
    title = input("Enter title override (optional): ").strip() or None
    print("\nProcessing started...\n")
    scan_folder(folder, title_override=title)
