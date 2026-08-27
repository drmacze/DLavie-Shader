#!/usr/bin/env python3
from __future__ import annotations
import argparse, pathlib, shutil, subprocess, zipfile

ROOT=pathlib.Path(__file__).resolve().parents[1]
EXCLUDE={".git",".github","dist","test-builds","docs","scripts","brand","__pycache__"}

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--output",default="dist/DLavie-Shader-v0.1.0.mcpack")
    ap.add_argument("--skip-biome-sync",action="store_true")
    args=ap.parse_args()

    if not args.skip_biome_sync:
        subprocess.run(["python3",str(ROOT/"scripts/sync_vanilla_biomes.py"),"--out",str(ROOT/"biomes")],check=True)

    output=ROOT/args.output
    output.parent.mkdir(parents=True,exist_ok=True)
    with zipfile.ZipFile(output,"w",zipfile.ZIP_DEFLATED,compresslevel=9) as z:
        for p in ROOT.rglob("*"):
            if not p.is_file(): continue
            rel=p.relative_to(ROOT)
            if rel.parts[0] in EXCLUDE: continue
            if rel == pathlib.Path(args.output): continue
            z.write(p,rel.as_posix())
    print(output)

if __name__=="__main__":
    main()
