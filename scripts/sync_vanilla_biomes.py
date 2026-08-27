#!/usr/bin/env python3
"""
Generate full client biome JSONs from Mojang's current Bedrock samples while
preserving vanilla fog, music, ambience, grass/foliage and water appearance.

Only Vibrant Visuals identifier components are patched. This avoids the
1.21.90+ per-biome precedence issue without replacing unrelated biome data.
"""
from __future__ import annotations
import argparse, json, pathlib, urllib.request

API = "https://api.github.com/repos/Mojang/bedrock-samples/contents/resource_pack/biomes"
NETHER = {"minecraft:hell","minecraft:crimson_forest","minecraft:warped_forest","minecraft:soulsand_valley","minecraft:basalt_deltas"}

def load_json(url: str):
    req = urllib.request.Request(url, headers={"User-Agent":"DLavie-Shader-builder"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--out", default="biomes")
    ap.add_argument("--ref", default="main")
    args=ap.parse_args()
    out=pathlib.Path(args.out); out.mkdir(parents=True, exist_ok=True)
    entries=load_json(API + "?ref=" + args.ref)
    count=0
    for entry in entries:
        if entry.get("type")!="file" or not entry["name"].endswith(".client_biome.json"):
            continue
        data=load_json(entry["download_url"])
        cb=data.get("minecraft:client_biome",{})
        ident=cb.get("description",{}).get("identifier")
        comps=cb.setdefault("components",{})
        if ident in NETHER:
            comps["minecraft:atmosphere_identifier"]={"atmosphere_identifier":"dlavie:nether_atmospherics"}
            comps["minecraft:color_grading_identifier"]={"color_grading_identifier":"dlavie:nether_color_grading"}
            comps["minecraft:lighting_identifier"]={"lighting_identifier":"dlavie:nether_lighting"}
        elif ident=="minecraft:the_end":
            comps["minecraft:atmosphere_identifier"]={"atmosphere_identifier":"dlavie:end_atmospherics"}
            comps["minecraft:color_grading_identifier"]={"color_grading_identifier":"dlavie:end_color_grading"}
            comps["minecraft:lighting_identifier"]={"lighting_identifier":"dlavie:end_lighting"}
        else:
            comps["minecraft:atmosphere_identifier"]={"atmosphere_identifier":"dlavie:default_atmospherics"}
            comps["minecraft:color_grading_identifier"]={"color_grading_identifier":"dlavie:default_color_grading"}
            comps["minecraft:lighting_identifier"]={"lighting_identifier":"dlavie:default_lighting"}
            comps["minecraft:water_identifier"]={"water_identifier":"dlavie:default_water"}
        (out/entry["name"]).write_text(json.dumps(data,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
        count += 1
    print(f"Generated {count} preserved vanilla biome bindings in {out}")

if __name__=="__main__":
    main()
