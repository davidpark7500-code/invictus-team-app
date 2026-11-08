#!/usr/bin/env bash
# Make phone-friendly copies of the app's videos, next to the originals in Dropbox.
#
#   720p H.264 + AAC MP4, "faststart" so playback begins before the whole file loads.
#   A 45-minute talk drops from several GB to roughly 300-500 MB.
#   Originals are never modified. Copies go to "<Invictus Team App>/App Videos/".
#
# Usage (on the Mac, needs ffmpeg: `brew install ffmpeg`):
#   scripts/convert-videos.sh "$HOME/Library/CloudStorage/Dropbox/Invictus Team App"
#
# If Dropbox files are "online only", reading them downloads them first; that is expected.
set -euo pipefail

ROOT="${1:?Pass the path to the "Invictus Team App" Dropbox folder}"
OUT="$ROOT/App Videos"
mkdir -p "$OUT"
command -v ffmpeg >/dev/null || { echo "ffmpeg not found. Install it with: brew install ffmpeg"; exit 1; }

# app id | source path inside the Dropbox folder
VIDEOS=(
  "t-resources|Activation Videos/2022-03-19_Resources_Park.mp4"
  "t-owner|Activation Videos/(01) 2021-11-06 Chad and Chelsea.mp4"
  "t-sales|Activation Videos/2023-10-17_Training_LutzSalesMindset.mp4"
  "t-networking|Activation Videos/(03) 2021-11-06 Kyle and Lucas.mp4"
  "t-core|Activation Videos/(04) 2021-11-23 Brown Training Shortened.mp4"
  "t-financial|Activation Videos/2023-06-11_Finances_McCann.mp4"
  "t-blueprint|Activation Videos/2025-04-16_Blueprint_David.mp4"
  "profile-kopecky|ProfileVideos/Kopecky Profile Video.MOV"
  "profile-brown|ProfileVideos/Brown Profile Video.mov"
  "profile-wyatt|ProfileVideos/Wyatt Profile Video.mov"
  "profile-jahnke|ProfileVideos/Jahnke Profile Video.MOV"
  "profile-raniolo|ProfileVideos/Raniolo Profile Video.MOV"
  "profile-brite|ProfileVideos/Brite Profile Video.mov"
  "profile-greene|ProfileVideos/Greene Profile Video.mov"
  "profile-park|ProfileVideos/Park Profile Video.mov"
  "profile-calahan|ProfileVideos/Calahan Profile Video.mov"
  "profile-mccann|ProfileVideos/McCann Profile Video.MOV"
  "profile-quinn|ProfileVideos/Quinn Profile Video.mov"
  "profile-pugliese|ProfileVideos/Pugliese Profile Video.MOV"
)

done_count=0; skipped=0; missing=()
for entry in "${VIDEOS[@]}"; do
  id="${entry%%|*}"; src="$ROOT/${entry#*|}"; dst="$OUT/$id.mp4"
  if [[ ! -f "$src" ]]; then missing+=("${entry#*|}"); continue; fi
  if [[ -f "$dst" ]]; then echo "skip  $id (already converted)"; skipped=$((skipped+1)); continue; fi
  echo "make  $id  <-  ${entry#*|}"
  ffmpeg -nostdin -hide_banner -loglevel error -stats -i "$src" \
    -vf "scale='min(1280,iw)':-2" -c:v libx264 -preset slow -crf 24 -pix_fmt yuv420p \
    -c:a aac -b:a 128k -ac 2 -movflags +faststart "$dst.part.mp4"
  mv "$dst.part.mp4" "$dst"
  done_count=$((done_count+1))
done

echo; echo "converted: $done_count   already done: $skipped   missing: ${#missing[@]}"
for m in "${missing[@]}"; do echo "  missing: $m"; done
du -sh "$OUT" 2>/dev/null || true
