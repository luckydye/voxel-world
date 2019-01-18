import { VoxelWorldGenerator } from "./VoxelWorldGenerator.js";

const worldGen = new VoxelWorldGenerator();

onmessage = (e) => {
    switch(e.data.type) {

        case 'regen':
            worldGen.setOptions(e.data.settings);
            const startTime = performance.now();
            worldGen.regen(0, tile => {
                self.postMessage({ type: 'tile', tile });
            }).then(() => {
                console.log("World gen in", Math.floor(performance.now() - startTime), "ms");
            })
            break;

    }
}
