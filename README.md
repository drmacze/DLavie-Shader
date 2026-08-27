<p align="center">
  <img src="brand/dlavie-brand.png" alt="DLavie Shader" width="480">
</p>

<h1 align="center">DLavie Shader</h1>

<p align="center"><strong>Vibrant Visuals · PBR Enhanced · Mobile First</strong></p>

DLavie Shader is a long-term Minecraft Bedrock shader/resource-pack project built around the official **Vibrant Visuals** and **PBR** pipeline. Its visual identity now uses the official DLavie stone-arch / sunlight emblem and metallic wordmark supplied by the project owner.

> **Important:** DLavie Shader is an original Bedrock implementation. Its visual target is inspired in part by high-end Java shader packs such as **Photon by SixthSurge**, but it does not redistribute Photon source code or copyrighted shader assets.

## v0.1.2 — Godrays pass

- Terrain-aware volumetric fog/light shafts for stronger sunlight through leaves, windows, cave openings and roof gaps
- Time-of-day Mie scattering and sun-glare profiles for cleaner noon light and stronger golden-hour rays
- Per-tier godray tuning for Low / Medium / High / Ultra
- Vanilla fog identifiers, underwater colors and biome-specific distance fog are preserved by the fog sync generator
- Nether and End are excluded from Overworld sunlight-shaft injection
- Stable manifest v2 + Vibrant Visuals `pbr` capability

## Quality presets

| Preset | Target | Godrays | Water | Caustics | Shadows |
|---|---|---|---|---|---|
| Low | FPS / thermals | Light | Flat | Off | Blocky |
| Medium | Mobile balanced | Balanced | 8-octave waves | Off | Soft |
| High | Strong phones/tablets | Strong | 16-octave waves | On | Soft |
| Ultra | Screenshots / headroom | Cinematic | 28-octave waves | Strong | Soft |

**Recommended first choice on iPhone:** Medium. Use High when evaluating godrays and final visual quality.

## Install / use

1. Build or obtain the latest `.mcpack` from an authenticated/trusted file source.
2. Open the `.mcpack` with Minecraft.
3. Activate **DLavie Shader** in Global Resources or the world resource packs.
4. Enable **Vibrant Visuals** in Minecraft's Video settings.
5. Open the pack's gear / Pack Settings and choose Low, Medium, High, or Ultra.

### Important for private GitHub repositories

Do not rely on an unauthenticated `github.com/.../raw/...mcpack` link from iOS. If the repository is private, GitHub can return an HTML/login response while the saved filename still ends in `.mcpack`. Minecraft then reports **"cannot find manifest in pack"** because the downloaded file is not the actual ZIP resource pack.

## Developer build

```bash
python3 scripts/sync_vanilla_biomes.py --out biomes
python3 scripts/sync_vanilla_fogs.py --root .
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
