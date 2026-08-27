#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ALLOWED_LIGHT_TYPES = {'static_light', 'point_light'}
ALLOWED_SHADOWS = {'blocky_shadows', 'soft_shadows'}
WATER_WAVE_KEYS = {'enabled','frequency','octaves','depth','speed','shape','pull','mix','frequency_scaling','speed_scaling'}
WATER_CAUSTIC_KEYS = {'enabled','frame_length','scale','power'}
EXPECTED_PRESETS = {'low','medium','high','ultra'}


def fail(msg: str) -> None:
    raise SystemExit(f'VALIDATION ERROR: {msg}')


def load(path: Path):
    try:
        return json.loads(path.read_text(encoding='utf-8'))
    except Exception as exc:
        fail(f'{path.relative_to(ROOT)}: invalid JSON: {exc}')


def validate_manifest() -> None:
    m = load(ROOT/'manifest.json')
    if m.get('format_version') != 2:
        fail('manifest format_version must remain 2 for stable subpack compatibility')
    if m.get('header',{}).get('min_engine_version',[]) < [1,21,120]:
        fail('min_engine_version must be >= 1.21.120 for pbr capability')
    if 'pbr' not in m.get('capabilities',[]):
        fail('manifest must include pbr capability')
    names={x.get('folder_name') for x in m.get('subpacks',[])}
    if names != EXPECTED_PRESETS:
        fail(f'subpacks must be exactly {sorted(EXPECTED_PRESETS)}; got {sorted(names)}')


def validate_atmosphere_file(path: Path) -> None:
    d = load(path)
    settings = d.get('minecraft:atmosphere_settings', {})
    mie = settings.get('sun_mie_strength')
    glare = settings.get('sun_glare_shape')
    if not isinstance(mie, dict) or len(mie) < 5:
        fail(f'{path.relative_to(ROOT)}: sun_mie_strength must be time-keyframed')
    if not isinstance(glare, dict) or len(glare) < 5:
        fail(f'{path.relative_to(ROOT)}: sun_glare_shape must be time-keyframed')
    if float(mie.get('0.50', mie.get('0.5', 1.0))) > 0.05:
        fail(f'{path.relative_to(ROOT)}: sun Mie must fall near zero at midnight')


def validate_visual_jsons() -> None:
    for p in ROOT.rglob('*.json'):
        if 'biomes' in p.parts:
            continue
        d=load(p)
        rel=p.relative_to(ROOT).as_posix()
        if '/lighting/' in f'/{rel}' or rel.startswith('lighting/'):
            if d.get('format_version') != '1.21.80':
                fail(f'{rel}: lighting schema must be 1.21.80')
        if '/water/' in f'/{rel}' or rel.startswith('water/'):
            if d.get('format_version') != '1.21.120':
                fail(f'{rel}: water schema must be 1.21.120')
            w=d.get('minecraft:water_settings',{})
            extra=set(w.get('waves',{}))-WATER_WAVE_KEYS
            if extra: fail(f'{rel}: unsupported water wave keys: {sorted(extra)}')
            extra=set(w.get('caustics',{}))-WATER_CAUSTIC_KEYS
            if extra: fail(f'{rel}: unsupported caustic keys: {sorted(extra)}')
        if '/shadows/' in f'/{rel}' or rel.startswith('shadows/'):
            st=d.get('minecraft:shadow_settings',{}).get('shadow_style')
            if st not in ALLOWED_SHADOWS:
                fail(f'{rel}: invalid shadow_style {st!r}')
        if '/local_lighting/' in f'/{rel}' or rel.startswith('local_lighting/'):
            for block,cfg in d.get('minecraft:local_light_settings',{}).items():
                if cfg.get('light_type') not in ALLOWED_LIGHT_TYPES:
                    fail(f'{rel}: {block} has invalid light_type')
        if '/fogs/' in f'/{rel}' or rel.startswith('fogs/'):
            fog=d.get('minecraft:fog_settings',{})
            air=fog.get('volumetric',{}).get('henyey_greenstein_g',{}).get('air',{})
            if air:
                g=air.get('henyey_greenstein_g')
                if not isinstance(g,(int,float)) or not -1.0 <= g <= 1.0:
                    fail(f'{rel}: invalid Henyey-Greenstein g {g!r}')


def validate_required_files() -> None:
    common=['lighting/global.json','lighting/nether.json','lighting/end.json',
            'atmospherics/atmospherics.json','atmospherics/nether.json','atmospherics/end.json',
            'color_grading/color_grading.json','color_grading/nether.json','color_grading/end.json',
            'water/water.json','shadows/global.json','local_lighting/local_lighting.json']
    for rel in ['manifest.json','pack_icon.png','pbr/global.json',*common]:
        if not (ROOT/rel).is_file(): fail(f'missing required file: {rel}')
    for preset in EXPECTED_PRESETS:
        for rel in common:
            if not (ROOT/'subpacks'/preset/rel).is_file():
                fail(f'{preset}: missing override {rel}')
    validate_atmosphere_file(ROOT/'atmospherics/atmospherics.json')
    for preset in EXPECTED_PRESETS:
        validate_atmosphere_file(ROOT/'subpacks'/preset/'atmospherics/atmospherics.json')


def validate_generators() -> None:
    biome=(ROOT/'scripts/sync_vanilla_biomes.py').read_text(encoding='utf-8')
    for token in ('minecraft:hell','minecraft:the_end','minecraft:water_identifier'):
        if token not in biome: fail(f'biome generator missing {token}')
    fog=(ROOT/'scripts/sync_vanilla_fogs.py').read_text(encoding='utf-8')
    for token in ('henyey_greenstein_g','max_density','media_coefficients','low','medium','high','ultra'):
        if token not in fog: fail(f'fog generator missing {token}')


def main() -> None:
    validate_manifest(); validate_required_files(); validate_visual_jsons(); validate_generators()
    print('DLavie Shader validation passed.')

if __name__ == '__main__':
    main()
