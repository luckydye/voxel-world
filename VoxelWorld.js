import { Renderer } from "./gl/Renderer.js";
import { Scene } from "./gl/Scene.js";
import { Cube } from "./gl/geo/Cube.js";
import { Vec } from "./gl/Math.js";
import { Camera } from "./gl/Camera.js";
import { WorldGenerator } from "./WorldGenerator.js";
import { Material } from "./gl/Material.js";

export default class VoxelWorld {

    constructor({ canvas } = {}) {

        const sceneOpts = {
            camera: new Camera({ 
                fov: 65, 
                position: new Vec(0, 7000, -18000) 
            })
        }
        this.scene = new Scene(sceneOpts);

		setInterval(() => {
            sceneOpts.camera.rotation.y -= 0.25;
            sceneOpts.camera.update();
		}, 16);

        this.renderer = new Renderer(canvas);
        this.renderer.setScene(this.scene);

        this.worldgen = new WorldGenerator({
            tileSize: 20,
            tileHeight: 20,
            seed: 200,
            threshold: 0.14,
            resolution: 10,
        });
        this.regen();
    }

    regen() {
        this.scene.clear();
        const tile = this.worldgen.generateTile();
        this.buildTile(tile);
    }

    voxel(x, y, z) {
        const tileSize = this.worldgen.tileSize;
        const tileHeight = this.worldgen.tileHeight;
        const cube = new Cube({
            material: Material.STONE,
            position: new Vec(
                ((x * 600) + 300) - ((tileSize/2) * 600),
                ((y * 600) + 300) - ((tileHeight) * 600),
                ((z * 600) + 300) - ((tileSize/2) * 600),
            )
        });
        this.scene.add(cube);
    }

    buildTile(tile) {
        const tileData = tile.tileData;

        for(let x = 0; x < tileData.length; x++) {
            for(let y = 0; y < tileData[x].length; y++) {
                for(let z = 0; z < tileData[x][y].length; z++) {
                    if(tileData[x][y][z]) {
                        this.voxel(x, y, z);
                    }
                }
            }
        }
    }
}