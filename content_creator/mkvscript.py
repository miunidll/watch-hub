#!/usr/bin/env python3
import subprocess
from pathlib import Path
import os
import langdetect
from tqdm import tqdm
from concurrent.futures import ThreadPoolExecutor, as_completed

BASE_FOLDER = Path("tedlasso")
OUTPUT_FOLDER = Path(f"{BASE_FOLDER}_processed")
TARGET_LANGS = ["en", "he"]  # English + Hebrew

OUTPUT_FOLDER.mkdir(exist_ok=True)


def run_cmd(cmd):
    """Run a shell command and return stdout."""
    result = subprocess.run(
        cmd, shell=True, capture_output=True, text=True
    )
    if result.returncode != 0:
        print(f"[!] Command failed: {cmd}\n{result.stderr}")
    return result.stdout


def detect_language_from_srt(srt_file):
    """Read a sample from SRT and detect language."""
    try:
        sample = ""
        with open(srt_file, "r", encoding="utf-8", errors="ignore") as f:
            for _ in range(30):
                line = f.readline()
                if not line:
                    break
                if "-->" not in line and not line.strip().isdigit():
                    sample += line.strip() + " "
        return langdetect.detect(sample) if sample.strip() else "unknown"
    except Exception:
        return "unknown"


def extract_subtitles_with_mkvtoolnix(mkv_path, output_dir):
    """
    Extract ALL subtitle tracks using mkvextract.
    Return list of (srt_path, detected_lang).
    """
    output_dir.mkdir(parents=True, exist_ok=True)

    # Get all track info
    track_info = run_cmd(f'mkvmerge -i "{mkv_path}"')

    subtitle_tracks = []
    for line in track_info.splitlines():
        if "subtitles" in line.lower():
            # Format: "Track ID 2: subtitles (SubRip/SRT)"
            parts = line.split()
            track_id = parts[2].replace(":", "")  # remove trailing colon
            subtitle_tracks.append(track_id)

    if not subtitle_tracks:
        print(f"[!] No subtitle tracks found in {mkv_path}")
        return []

    extracted = []

    for idx, track_id in enumerate(subtitle_tracks, start=1):
        srt_out = output_dir / f"{mkv_path.stem}_track{track_id}.srt"

        cmd = f'mkvextract tracks "{mkv_path}" {track_id}:"{srt_out}"'
        run_cmd(cmd)

        if not srt_out.exists() or srt_out.stat().st_size == 0:
            print(f"[!] Empty subtitle track {track_id}, skipping")
            continue

        lang = detect_language_from_srt(srt_out)

        extracted.append((srt_out, lang))

    return extracted


def convert_srt_to_vtt(srt_path):
    """Convert SRT → VTT via ffmpeg."""
    vtt_path = srt_path.with_suffix(".vtt")
    run_cmd(f'ffmpeg -y -i "{srt_path}" "{vtt_path}"')
    return vtt_path


def process_single_mkv(mkv_path, pbar):
    """Process one MKV file with progress bar."""
    relative = mkv_path.parent.relative_to(BASE_FOLDER)
    out_dir = OUTPUT_FOLDER / relative

    pbar.set_description(f"Extract: {mkv_path.name}")

    # 1. Extract subtitles
    subs = extract_subtitles_with_mkvtoolnix(mkv_path, out_dir)
    pbar.update(1)

    # 2. Filter languages
    good_subs = []
    for srt_path, lang in subs:
        if lang in TARGET_LANGS:
            good_subs.append((srt_path, lang))
        else:
            srt_path.unlink(missing_ok=True)

    pbar.update(1)
    pbar.set_description(f"Convert: {mkv_path.name}")

    # 3. Convert to VTT
    for srt_path, lang in good_subs:
        vtt = convert_srt_to_vtt(srt_path)
        srt_path.unlink()   # remove SRT
    pbar.update(1)

    pbar.set_description(f"Done: {mkv_path.name}")

    # 4. MKV → MP4 (disabled)
    # mp4_path = out_dir / f"{mkv_path.stem}.mp4"
    # run_cmd(f'ffmpeg -i "{mkv_path}" -map 0:v -map 0:a -c copy "{mp4_path}"')


def scan_folder_threaded(folder, workers=4):
    mkv_files = list(folder.rglob("*.mkv"))

    print(f"Found {len(mkv_files)} MKVs")

    with ThreadPoolExecutor(max_workers=workers) as executor:
        futures = {}

        # Create a progress bar per MKV file
        for mkv in mkv_files:
            pbar = tqdm(total=3, position=len(futures), leave=True)
            pbar.set_description(f"Pending: {mkv.name}")
            future = executor.submit(process_single_mkv, mkv, pbar)
            futures[future] = pbar

        # Handle completion
        for future in as_completed(futures):
            pbar = futures[future]
            pbar.close()


if __name__ == "__main__":
    workers = max(2, os.cpu_count())
    scan_folder_threaded(BASE_FOLDER, workers=workers)
    print("✅ Done processing all MKVs.")
