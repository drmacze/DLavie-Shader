# Changelog

## 0.1.3 — Mobile Lighting Pass

- Expanded colored local-light coverage from 15 to 36 vanilla emitter blocks, including candles, end rods, beacons, magma, respawn anchors and jack o’lanterns.
- Added a hybrid Medium lighting budget for iPhone 11: compact lights use real point lights while large-area emitters remain static to reduce overdraw and heat.
- Kept Low entirely static and High/Ultra fully point-lit, so every quality choice changes actual renderer work.
- Added automated tier budget checks to prevent future presets from silently exceeding the mobile lighting contract.

## 0.1.2 — Godrays Pass

- Added a vanilla-preserving fog generator for Vibrant Visuals volumetric fog and terrain-aware light shafts.
- Added Low / Medium / High / Ultra volumetric profiles with progressively stronger forward scattering.
- Preserved vanilla fog identifiers, distance fog, underwater colors, and authored biome-specific fog properties.
- Kept Nether and End fog behavior dimension-correct; Overworld sun shafts are not injected into those dimensions.
- Reworked `sun_mie_strength` into time-of-day keyframes so sunlight scattering peaks around sunrise and sunset while remaining visible at noon.
- Reworked `sun_glare_shape` into time-of-day keyframes for a tighter, more natural solar scattering lobe.
- Added Henyey-Greenstein forward scattering for sharper shafts through leaves, windows, cave openings, and narrow terrain gaps.
- Updated the pack builder to generate and verify fog overrides for every quality preset.
- Updated CI output to `DLavie-Shader-v0.1.2.mcpack`.

## 0.1.1 — Import Fix

- Fixed `.mcpack` import structure and root-manifest verification.
- Kept stable manifest v2 subpack configuration.

## 0.1.0 — Foundation

- Initial DLavie Shader architecture.
- Added Vibrant Visuals + PBR capability.
- Added four real quality subpacks.
- Added Overworld, Nether and End lighting/atmosphere/color-grade identities.
- Added water simulation, caustics, shadows and local-light profiles.
- Added conservative PBR fallback model.
- Added vanilla-biome preservation/binding generator.
- Added CI validation and `.mcpack` artifact build.
- Added project branding, architecture notes and roadmap.
