# Exercise animation renders

Renders the realistic exercise videos in `public/animations/` with Blender. The app plays `<id>.mp4` with `<id>.jpg` as the poster and falls back to the SVG animation from `src/data/animations.ts` when a video cannot load.

## Requirements

- Blender 4.2 LTS (Linux portable build is enough, no GPU needed).
- The CC0 [Human Base Meshes bundle](https://www.blender.org/download/demo-files/) v1.4.1.
- `ffmpeg` on the `PATH`.

## Build the shared base

```bash
export BLENDER=/path/to/blender
export RENDER_WORK=/path/to/work-dir   # outside the repo; holds base.blend and frames
$BLENDER -b /path/to/human_base_meshes_bundle.blend --python tools/animation-renders/base.py
```

`base.py` rigs the realistic male mesh, paints one mask per muscle from `muscles.py` and saves `base.blend` with the studio lights and camera.

## Render exercises

Timings come from the app data so the phase labels stay in sync with the video. Regenerate them after changing keyframes in `src/data/animations.ts`:

```bash
npx vite-node tools/animation-renders/export-timelines.ts
```

Preview the start of every phase, or render and encode the final loop:

```bash
tools/animation-renders/render.sh bench-press preview
tools/animation-renders/render.sh bench-press render
tools/animation-renders/queue.sh bench-press back-squat rdl
```

Each exercise script in `exercises/` declares one pose per keyframe of its timeline. IK conventions for this rig: arm poles use `pole_angle=-90`, leg poles `90`. FK rotations on the left side (the right side is mirrored with `Scene.both`): trunk and head `X+` flex forward, upper arm `X+` raises forward and `Z+` abducts, forearm `X+` flexes the elbow, thigh `X+` flexes the hip, shin `X-` flexes the knee.
