# Tracing an animated logo

The Outrun header logo, `src/components/Header/CheetahLogo.tsx`, is a seventeen-frame gallop traced from a silhouette
clip (Pixabay video 232970) into integer SVG paths: about 350 bytes a frame, 6 KB for the loop. The pipeline runs in a
scratch folder; only the component ships.

1. Find a clip of the mark as a solid silhouette on a flat background, ideally an exact loop. Note the loop length and
   the union bounding box of the silhouette across all frames.
2. Extract the frames: `ffmpeg -i clip.mp4 frames/%02d.png`.
3. Crop every frame to that same union box so the strip stays aligned:
   `magick frames/01.png -crop <w>x<h>+<x>+<y> +repage cropped/01.png`.
4. Trace each frame with the npm `potrace` port (threshold 128, turdSize 20) to SVG.
5. Shrink with `svgo` at `floatPrecision: 0`, baking a scale transform so the paths land on integers in a small
   viewBox (134×60 for the cheetah). Integer rounding in a small box is what makes it small; potrace's simplification
   settings barely matter.
6. Lay the frames out as the strip in the component and keep its playback: frames advance with scroll travel at a
   capped rate, and the strip freezes when motion is paused. The Header entry in the Layout section of
   `CLAUDE.md` describes it.
