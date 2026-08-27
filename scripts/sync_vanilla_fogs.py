#!/usr/bin/env python3
"""
Generate DLavie-enhanced fog definitions from Mojang's current Bedrock samples.

The generator keeps every vanilla fog identifier and distance/underwater color,
then adds or tunes only the Vibrant Visuals volumetric-lighting layer. Because
the identifiers stay vanilla, existing biome fog bindings keep working without
changing biome colors or water appearance.

Generated files:
  fogs/*.json                       -> Medium/default profile
  subpacks/low/fogs/*.json          -> Low profile
  subpacks/medium/fogs/*.json       -> Medium profile
  subpacks/high/fogs/*.json         -> High profile
  subpacks/ultra/fogs/*.json        -> Ultra profile
"""
from __future__ import annotations

import argparse
import copy
import json
import pathlib
import urllib.request

API = "https://api.github.com/repos/Mojang/bedrock-samples/contents/resource_pack/fogs"

PROFILES = {
    "low": {
        "density": 0.0035,
        "scattering": 0.012,
        "g": 0.68,
        "zero_height": 176.0,
        "max_height": 28.0,
    },
    "medium": {
        "density": 0.0060,
        "scattering": 0.016,
        "g": 0.76,
        "zero_height": 192.0,
        "max_height": 24.0,
    },
    "high": {
        "density": 0.0090,
        "scattering": 0.021,
        "g": 0.83,
        "zero_height": 208.0,
        "max_height": 20.0,
    },
    "ultra": {
        "density": 0.0120,
        "scattering": 0.026,
        "g": 0.88,
        "zero_height": 224.0,
        "max_height": 16.0,
    },
}

# Sun shafts are an Overworld feature. Nether and End fogs retain Mojang's
# original volumetric values to avoid fake sunlight in those dimensions.
NON_OVERWORLD_TOKENS = (
    "the_end",
    "hell",
    "nether",
    "crimson_forest",
    "warped_forest",
    "soulsand_valley",
    "soul_sand_valley",
    "basalt_deltas",
)


def load_json(url: str):
    req = urllib.request.Request(url, headers={"User-Agent": "DLavie-Shader-builder"})
    with urllib.request.urlopen(req, timeout=30) as response:
        return json.load(response)


def is_overworld(data: dict, filename: str) -> bool:
    settings = data.get("minecraft:fog_settings", {})
    identifier = settings.get("description", {}).get("identifier", "")
    haystack = (filename + " " + identifier).lower()
    return not any(token in haystack for token in NON_OVERWORLD_TOKENS)


def enhance(data: dict, profile: dict) -> dict:
    out = copy.deepcopy(data)
    out["format_version"] = "1.21.90"
    settings = out.setdefault("minecraft:fog_settings", {})
    volumetric = settings.setdefault("volumetric", {})

    density = volumetric.setdefault("density", {})
    air_density = density.get("air")
    if not isinstance(air_density, dict):
        density["air"] = {
            "max_density": profile["density"],
            "zero_density_height": profile["zero_height"],
            "max_density_height": profile["max_height"],
        }
    else:
        # Preserve authored biome fog density/height. Only fill missing fields.
        air_density.setdefault("max_density", profile["density"])
        if not air_density.get("uniform", False):
            air_density.setdefault("zero_density_height", profile["zero_height"])
            air_density.setdefault("max_density_height", profile["max_height"])

    media = volumetric.setdefault("media_coefficients", {})
    air_media = media.get("air")
    if not isinstance(air_media, dict):
        media["air"] = {
            "scattering": [profile["scattering"]] * 3,
            "absorption": [0.0, 0.0, 0.0],
        }
    else:
        air_media.setdefault("scattering", [profile["scattering"]] * 3)
        air_media.setdefault("absorption", [0.0, 0.0, 0.0])

    phase = volumetric.setdefault("henyey_greenstein_g", {})
    phase["air"] = {"henyey_greenstein_g": profile["g"]}
    return out


def write_json(path: pathlib.Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default=".")
    parser.add_argument("--ref", default="main")
    args = parser.parse_args()

    root = pathlib.Path(args.root).resolve()
    entries = load_json(API + "?ref=" + args.ref)
    generated = 0

    for entry in entries:
        if entry.get("type") != "file" or not entry["name"].endswith(".json"):
            continue

        vanilla = load_json(entry["download_url"])
        filename = entry["name"]

        if not is_overworld(vanilla, filename):
            # Keep dimension-specific fog untouched in every tier.
            write_json(root / "fogs" / filename, vanilla)
            for tier in PROFILES:
                write_json(root / "subpacks" / tier / "fogs" / filename, vanilla)
            generated += 1
            continue

        for tier, profile in PROFILES.items():
            tuned = enhance(vanilla, profile)
            write_json(root / "subpacks" / tier / "fogs" / filename, tuned)
            if tier == "medium":
                write_json(root / "fogs" / filename, tuned)
        generated += 1

    print(f"Generated {generated} vanilla-preserving fog definitions with DLavie light shafts")


if __name__ == "__main__":
    main()
