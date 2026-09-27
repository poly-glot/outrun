#!/bin/sh
set -e
src="$1"
out="${2:-public/media}"
frame="crop=1080:1350:0:100,scale=864:1080"
ffmpeg -v error -y -i "$src" -an -vf "$frame" -c:v libx264 -preset slow -crf 26 -x264-params keyint=1:min-keyint=1:scenecut=0:bframes=0 -profile:v high -pix_fmt yuv420p -movflags +faststart "$out/miles.h264.mp4"
ffmpeg -v error -y -i "$src" -frames:v 1 -vf "$frame" -c:v libwebp -quality 75 "$out/miles.webp"
