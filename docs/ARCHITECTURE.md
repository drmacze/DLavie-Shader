# DLavie Shader Architecture

## Rendering target

DLavie Shader targets Minecraft Bedrock's Vibrant Visuals/PBR resource-pack pipeline rather than legacy RenderDragon shader injection. This keeps the project aligned with the supported Bedrock rendering path.

## Layer order

1. **Vanilla client biome data** — generated at build time from Mojang's current samples.
2. **DLavie biome bindings** — only atmosphere, color grading, lighting and water identifiers are changed.
3. **Base Medium configuration** — safe fallback if a subpack is not resolved.
4. **Quality subpack** — overrides the same resource paths for Low/Medium/High/Ultra.
5. **Future PBR library** — curated normal/MERS texture sets, added in batches with mobile performance review.

## Why generate biome files?

From Bedrock 1.21.90 onward, built-in per-biome Vibrant Visuals lighting can take precedence over a pack-wide `lighting/global.json`. Replacing every biome with a tiny custom JSON would also erase unrelated vanilla components. The generator instead downloads the complete current client-biome files and patches only four identifier components.

## Preset contract

Every preset owns the same paths:

- `lighting/global.json`, `lighting/nether.json`, `lighting/end.json`
- `atmospherics/atmospherics.json`, `atmospherics/nether.json`, `atmospherics/end.json`
- `color_grading/color_grading.json`, `color_grading/nether.json`, `color_grading/end.json`
- `water/water.json`
- `shadows/global.json`
- `local_lighting/local_lighting.json`

That makes comparisons deterministic and prevents hidden fallback differences.

## iPhone 11 performance contract

Medium is the baseline preset for the A13-class minimum target. It combines eight-octave water, soft shadows without caustics, restrained volumetric density and a hybrid local-light palette. Torches, lanterns, campfires and end rods use point lights; broad or commonly repeated surfaces use the cheaper static-light path. Low disables water waves and point lights as a thermal fallback. High and Ultra trade battery and sustained frame pacing for full point-light coverage, additional wave octaves, caustics and stronger atmosphere.

Cloud animation is owned by Bedrock's renderer and cannot be replaced by a Vibrant Visuals resource-pack component. Clouds still respond dynamically to the authored sky, sun, fog and time-of-day lighting. This project does not use unsupported RenderDragon injection on iOS.

## PBR strategy

`pbr/global.json` supplies a conservative non-metallic rough fallback for blocks, actors, particles and items. Per-material normal/MERS texture sets should only be added when the corresponding source textures can be redistributed or are authored specifically for DLavie.

Planned authored material batches:
- stone family
- polished/metal-like utility blocks
- wood family
- foliage
- glass/ice
- emissive blocks
- ores
- Nether/End materials

## Java shader inspiration boundary

High-end Java shaders are useful visual references for targets such as readable indirect-looking ambience, soft shadows, water response, atmospheric depth, sunset color separation and balanced bloom. DLavie does not copy GLSL source, binaries or copyrighted texture assets from another shader.
