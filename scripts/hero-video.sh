#!/bin/sh
set -e
src="$1"
out="${2:-public/media}"
desktop="scale=1920:-2"
mobile="crop=ih*9/16:ih:iw*0.41:0,scale=720:1280"
av1="-fps_mode passthrough -c:v libsvtav1 -preset 6 -g 300 -pix_fmt yuv420p -svtav1-params tune=0 -movflags +faststart"
h264="-fps_mode passthrough -c:v libx264 -preset slow -crf 28 -profile:v high -pix_fmt yuv420p -movflags +faststart"
ffmpeg -v error -y -i "$src" -an -vf "$desktop" $av1 -crf 38 "$out/hero.av1.mp4"
ffmpeg -v error -y -i "$src" -an -vf "$mobile" $av1 -crf 40 "$out/hero_portrait.av1.mp4"
ffmpeg -v error -y -i "$src" -an -vf "scale=1280:-2" $h264 "$out/hero.h264.mp4"
ffmpeg -v error -y -i "$src" -an -vf "$mobile" $h264 "$out/hero_portrait.h264.mp4"
poster="-frames:v 1 -c:v libwebp -quality 82"
still="-frames:v 1 -c:v libwebp -quality 75"
ffmpeg -v error -y -i "$out/hero.av1.mp4" $poster "$out/hero.poster.webp"
ffmpeg -v error -y -i "$out/hero_portrait.av1.mp4" $poster "$out/hero_portrait.poster.webp"
ffmpeg -v error -y -i "$src" $still -vf "$desktop" "$out/hero.webp"
ffmpeg -v error -y -i "$src" $still -vf "$mobile" "$out/hero_portrait.webp"
for f in "$out"/hero*.mp4; do
    printf '%s %s ' "$(basename "$f")" "$(wc -c < "$f" | awk '{printf "%.1fMB", $1/1048576}')"
    ffprobe -v error -select_streams v:0 -show_entries stream=codec_name,width,height,nb_frames,avg_frame_rate -of csv=p=0 "$f"
done
