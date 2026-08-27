<p align="center">
  <img src="brand/dlavie-logo.svg" alt="DLavie Shader" width="760">
</p>

<h1 align="center">DLavie Shader</h1>

<p align="center"><strong>Vibrant Visuals · PBR Enhanced · Mobile First</strong></p>

DLavie Shader is a long-term Minecraft Bedrock shader/resource-pack project built around the official **Vibrant Visuals** and **PBR** pipeline. Its art direction targets the cinematic clarity, expressive skies, soft light and reflective material feel associated with high-end Java shaders, while remaining designed for Bedrock mobile.

> **Important:** DLavie Shader is an original Bedrock implementation. Its visual target is inspired in part by high-end Java shader packs such as **Photon by SixthSurge**, but it does not redistribute Photon source code or copyrighted shader assets.

## v0.1.0 — Foundation

- Dynamic sun / moon / ambient light over the full day-night cycle
- Warm sunrise and sunset, cool moonlight, cleaner night separation
- Custom Overworld, Nether and End atmosphere identities
- Vibrant-but-controlled color grading and generic tone mapping
- PBR-enhanced fallback material response via `pbr/global.json` (normal/MERS material library is the next authored stage)
- Custom local-light colors for torches, lanterns, glowstone, froglights, etc.
- Tunable water simulation and caustics
- Four real quality subpacks: **Low, Medium, High, Ultra**
- Reproducible biome-binding generator that preserves vanilla biome data
- GitHub Actions validation + `.mcpack` build artifact

## Quality presets

| Preset | Target | Water | Caustics | Shadows | Light style |
|---|---|---|---|---|---|
| Low | FPS / thermals | Flat | Off | Blocky | Static-biased |
| Medium | Mobile balanced | 8-octave waves | Off | Soft | Static-biased |
| High | Strong phones/tablets | 16-octave waves | On | Soft | Point-light enhanced |
| Ultra | Screenshots / headroom | 28-octave waves | On, strongest | Soft | Point-light enhanced |

**Recommended first choice on iPhone:** Medium. Use Low if the device gets hot or frame pacing becomes unstable; High/Ultra are intentionally more demanding.

## Install / use

1. Download the latest `.mcpack` from the repository's **Actions** artifact.
2. Open it with Minecraft.
3. Activate **DLavie Shader** in Global Resources or the world resource packs.
4. Enable **Vibrant Visuals** in Minecraft's Video settings.
5. Open the pack's **gear / Pack Settings** and choose Low, Medium, High, or Ultra.
6. Restart/reload the world after changing a subpack if Minecraft does not refresh it immediately.

## Immediate mobile smoke-test build

A directly downloadable compatibility build is tracked at `test-builds/DLavie-Shader-v0.1.0-mobile-test.mcpack`. It contains the complete DLavie base renderer and all Low/Medium/High/Ultra subpacks, but intentionally omits the generated vanilla-biome binding layer. Use it to confirm import, Vibrant Visuals activation, Pack Settings and device performance.

The full reproducible build adds preserved current vanilla biome bindings through `scripts/sync_vanilla_biomes.py`.

## Developer build

```bash
python3 scripts/sync_vanilla_biomes.py --out biomes
python3 scripts/build_mcpack.py --skip-biome-sync
```

The biome generator downloads Mojang's current Bedrock sample client-biome JSONs, preserves all vanilla components, and changes only the Vibrant Visuals identifier components. This is deliberate: newer Bedrock versions use per-biome visual identifiers that can take precedence over pack-wide defaults.

## Project principles

1. **Mobile first, not mobile only.** Every visual feature must have a sensible performance tier.
2. **Original implementation.** Learn from the visual goals of excellent Java shaders; do not clone their code.
3. **Reproducible builds.** A release should be buildable from the repository.
4. **No fake toggles.** A quality option must correspond to a real resource override.
5. **PBR grows incrementally.** The fallback material model ships first; authored per-block normal/MERS assets are added in reviewed sets.
6. **Visual consistency.** Overworld, Nether and End each receive an intentional palette rather than accidental defaults.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/ROADMAP.md](docs/ROADMAP.md).

## Visual reference & attribution

Photon by SixthSurge is used as a **visual reference only** for goals such as sky depth, readable lighting, water response, soft shadows and cinematic color separation. DLavie Shader v0.1.0 contains original Bedrock JSON/configuration and branding; it does not include Photon GLSL or Photon texture assets.
