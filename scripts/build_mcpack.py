#!/usr/bin/env python3
from __future__ import annotations
import argparse, json, pathlib, subprocess, zipfile

ROOT = pathlib.Path(__file__).resolve().parents[1]
PACK_ROOT_FILES = {"manifest.json", "pack_icon.png"}
PACK_DIRS = {"atmospherics", "biomes", "color_grading", "fogs", "lighting", "local_lighting", "pbr", "shadows", "subpacks", "textures", "water"}

def include(rel: pathlib.Path) -> bool:
    return rel.as_posix() in PACK_ROOT_FILES or (len(rel.parts) > 1 and rel.parts[0] in PACK_DIRS)

def verify_archive(path: pathlib.Path) -> None:
    with zipfile.ZipFile(path) as z:
        names = set(z.namelist())
        if "manifest.json" not in names:
            raise RuntimeError("manifest.json is not at archive root")
        manifest = json.loads(z.read("manifest.json").decode("utf-8-sig"))
        if not manifest.get("header", {}).get("uuid") or not manifest.get("modules"):
            raise RuntimeError("manifest.json is incomplete")
        if any(n.startswith("DLavie-Shader/") for n in names):
            raise RuntimeError("pack was accidentally nested inside a top-level folder")
        bad = [n for n in names if n.startswith("../") or "/../" in n]
        if bad:
            raise RuntimeError(f"unsafe archive paths: {bad[:3]}")
        if not any(n.startswith("fogs/") for n in names):
            raise RuntimeError("generated Vibrant Visuals fog definitions are missing")
        for tier in ("low", "medium", "high", "ultra"):
            if not any(n.startswith(f"subpacks/{tier}/fogs/") for n in names):
                raise RuntimeError(f"generated {tier} volumetric fog overrides are missing")
    print(f"Verified import + volumetric structure: {path}")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--output", default="dist/DLavie-Shader-v0.1.1.mcpack")
    ap.add_argument("--skip-biome-sync", action="store_true")
    ap.add_argument("--skip-fog-sync", action="store_true")
    args = ap.parse_args()
    if not args.skip_biome_sync:
        subprocess.run(["python3", str(ROOT/"scripts/sync_vanilla_biomes.py"), "--out", str(ROOT/"biomes")], check=True)
    if not args.skip_fog_sync:
        subprocess.run(["python3", str(ROOT/"scripts/sync_vanilla_fogs.py"), "--root", str(ROOT)], check=True)
    output = ROOT / args.output
    output.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(output, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for p in sorted(ROOT.rglob("*")):
            if not p.is_file():
                continue
            rel = p.relative_to(ROOT)
            if include(rel):
                z.write(p, rel.as_posix())
    verify_archive(output)
    print(output)

if __name__ == "__main__":
    main()
