<p align="center">
  <img src="brand/dlavie-logo.svg" alt="DLavie Shader" width="760">
</p>

<h1 align="center">DLavie Shader</h1>

<p align="center"><strong>Vibrant Visuals · PBR Enhanced · Mobile First</strong></p>

DLavie Shader is a long-term Minecraft Bedrock shader/resource-pack project built around the official **Vibrant Visuals** and **PBR** pipeline. Its art direction targets the cinematic clarity, expressive skies, soft light and reflective material feel associated with high-end Java shaders, while remaining designed for Bedrock mobile.

> **Important:** DLavie Shader is an original Bedrock implementation. Its visual target is inspired in part by high-end Java shader packs such as **Photon by SixthSurge**, but it does not redistribute Photon source code or copyrighted shader assets.

## v0.1.1 — Import fix

- Stable manifest v2 + Vibrant Visuals `pbr` capability
- Low / Medium / High / Ultra remain real subpack presets
- Removed custom manifest-v3 `settings` from the stable mobile build
- Clean-pack build allowlist: only Minecraft resource-pack files enter the `.mcpack`
- Build script now verifies that `manifest.json` is at archive root and parseable before completing

## Quality presets

| Preset | Target | Water | Caustics | Shadows | Light style |
|---|---|---|---|---|---|
| Low | FPS / thermals | Flat | Off | Blocky | Static-biased |
| Medium | Mobile balanced | 8-octave waves | Off | Soft | Static-biased |
| High | Strong phones/tablets | 16-octave waves | On | Soft | Point-light enhanced |
| Ultra | Screenshots / headroom | 28-octave waves | On, strongest | Soft | Point-light enhanced |

**Recommended first choice on iPhone:** Medium.

## Install / use

1. Build or obtain `DLavie-Shader-v0.1.1.mcpack` from an authenticated/trusted file source.
2. Open the `.mcpack` with Minecraft.
3. Activate **DLavie Shader** in Global Resources or the world resource packs.
4. Enable **Vibrant Visuals** in Minecraft's Video settings.
5. Open the pack's gear / Pack Settings and choose Low, Medium, High, or Ultra.

### Important for private GitHub repositories

Do not rely on an unauthenticated `github.com/.../raw/...mcpack` link from iOS. If the repository is private, GitHub can return an HTML/login response while the saved filename still ends in `.mcpack`. Minecraft then reports **"cannot find manifest in pack"** because the downloaded file is not the actual ZIP resource pack.

## Developer build

```bash
python3 scripts/sync_vanilla_biomes.py --out biomes
python3 scripts/build_mcpack.py --skip-biome-sync
```

The builder performs an import-structure self-check before completing.

## Project principles

1. **Mobile first, not mobile only.** Every visual feature must have a sensible performance tier.
2. **Original implementation.** Learn from the visual goals of excellent Java shaders; do not clone their code.
3. **Reproducible builds.** A release should be buildable from the repository.
4. **No fake toggles.** A quality option must correspond to a real resource override.
5. **PBR grows incrementally.** The fallback material model ships first; authored per-block normal/MERS assets are added in reviewed sets.
6. **Visual consistency.** Overworld, Nether and End each receive an intentional palette rather than accidental defaults.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/ROADMAP.md](docs/ROADMAP.md).

## Visual reference & attribution

Photon by SixthSurge is used as a **visual reference only** for goals such as sky depth, readable lighting, water response, soft shadows and cinematic color separation. DLavie Shader contains original Bedrock JSON/configuration and branding; it does not include Photon GLSL or Photon texture assets.
