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
                position: new Vec(0, 3000, -10000),
                rotation: new Vec(12, 45, 0) 
            })
        }
        this.scene = new Scene(sceneOpts);

        this.renderer = new Renderer(canvas);
        this.renderer.setScene(this.scene);

        const example = {
            tileSize: 20,
            tileHeight: 10,
            seed: 0.9216802954674626,
            threshold: 0.12,
            resolution: 12,
        }

        this.worldgen = new WorldGenerator(example);
        const tile = this.worldgen.generateTile();
        this.buildTile(tile);
    }

    regen() {
        this.worldgen.setSeed(Math.random());
        this.scene.clear();
        const tile = this.worldgen.generateTile();
        this.buildTile(tile);
    }

    voxel(x, y, z) {
        const tileSize = this.worldgen.tileSize;
        const tileHeight = this.worldgen.tileHeight;
        const mat = (() => {
            let mats = [ "STONE", "STONE", "DIRT" ];
            if(y < 6) {
                mats = [ "DIRT", "GRASS", "STONE" ];
            }
            if(y < 2) {
                mats = [ "GRASS" ];
            }
            if(y > 9) {
                mats = [ "STONE", "LAVA" ];
            }
            return Material[mats[Math.floor(Math.random() * mats.length)]];
        })();
        const cube = new Cube({
            material: mat,
            position: new Vec(
                ((x * 200) + 100) - ((tileSize/2) * 200),
                ((y * 200) + 100) - ((tileHeight) * 200),
                ((z * 200) + 100) - ((tileSize/2) * 200),
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
                        if(this.shouldDraw(tileData, x, y ,z)) {
                            this.voxel(x, y, z);
                        }
                    }
                }
            }
        }
    }

    shouldDraw(tileData, x, y, z) {

        /* Order:
            x  y  z
            0  0  0  --  center

            1  0  0  --  left
            -1 0  0  --  right

            0  1  0  --  top
            0 -1  0  --  bottom

            0  0  1  --  front
            0  0 -1  --  back
        */

        return true;
    }
}