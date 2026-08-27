# Third-party references

## Photon Shaders

- Project: Photon by SixthSurge (Minecraft Java Edition)
- Role in DLavie Shader: visual/art-direction reference only
- Included Photon source/assets: **none**
- DLavie implementation: independently authored for the Minecraft Bedrock Vibrant Visuals/PBR pipeline

Photon's license permits examination and learning from its source and defines conditions for redistribution. DLavie v0.1.0 intentionally does not redistribute Photon code or assets, keeping this repository's implementation independent.

## Mojang Bedrock Samples

The build script reads current client-biome JSON data from Mojang's public `bedrock-samples` repository at build time, preserves vanilla biome components, and changes only Vibrant Visuals identifier bindings in the generated build output. Generated biome files are not committed to this repository.
