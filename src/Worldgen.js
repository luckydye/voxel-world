import { VoxelWorldGenerator } from "./VoxelWorldGenerator.js";

const worldGen = new VoxelWorldGenerator();

onmessage = (e) => {
    switch(e.data.type) {

        case 'regen':
            worldGen.setOptions(e.data.settings);
            worldGen.regen(0, tile => {
                self.postMessage({ type: 'tile', tile });
            })
            break;

    }
}
