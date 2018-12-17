import { Renderer } from "../gl/Renderer.js";
import { Scene } from "../gl/scene/Scene.js";
import { Cube } from "../gl/geo/Cube.js";
import { Vec } from "../gl/Math.js";
import { Camera } from "../gl/scene/Camera.js";
import { WorldGenerator } from "./WorldGenerator.js";
import { Material } from "../gl/scene/Material.js";
import { Resources } from "../gl/Resources.js";

Resources.add({
    'materials': './resources/materials/materials.json',
    'worldtextures': './resources/images/blocks_solid.png',
    'world': './resources/worlds/example.json',
}, false);

export default class VoxelWorld {

    render(canvas) {
        Resources.load().then(() => {
            console.log("resources loaded");
            this.init(canvas);
        });
    }

    init(canvas) {
        this.initMaterials();

        const settings = Resources.get('world');

        const sceneOpts = {
            camera: new Camera({ 
                fov: settings.scene.camera.fov,
                position: new Vec(0, 3500, -13000),
                rotation: new Vec(19, -45, 0) 
            })
        }
        this.scene = new Scene(sceneOpts);
        
        let lastTick = 0;
        setInterval(() => {
            if(this.turntable) {
                this.scene.camera.rotation.y += 0.02 * (this.renderer.time - lastTick);
                this.scene.camera.update();
            }
            lastTick = this.renderer.time;
        }, 14);

        this.renderer = new Renderer(canvas);
        this.renderer.setScene(this.scene);

        this.worldgen = new WorldGenerator(settings.world);

        this.regen(settings.world.seed);
    }

    initMaterials() {
        const mats = Resources.get('materials');
        for(let name in mats) {
            const mat = Material.create({ name });
            mat.texture = Resources.get(mats[name].texture);
            mat.defuseColor = mats[name].defuseColor;
        }
    }

    regen(seed) {
        seed = seed || Math.random();
        this.worldgen.setSeed(seed);
        this.scene.clear();
        this.tiles = [
            this.worldgen.generateTile(0, 0),
        ]
        this.buildTiles(this.tiles);
    }

    voxel(tileData, x, y, z) {
        const tileSize = this.worldgen.tileSize;
        const cube = new Cube({
            material: Material.WORLD,
            uv: tileData[x][y][z],
            position: new Vec(
                ((x * 200) + 100) - ((tileSize/2) * 200),
                ((y * 200) + 100) - ((tileSize) * 200),
                ((z * 200) + 100) - ((tileSize/2) * 200),
            )
        });

        if((y-1 > 0 && y-1 < tileSize) && tileData[x][y-1][z]) {
            cube.visible.TOP = false;
        }
        if((y+1 > 0 && y+1 < tileSize) && tileData[x][y+1][z]) {
            cube.visible.BOTTOM = false;
        }
        if((z-1 > 0 && z-1 < tileSize) && tileData[x][y][z-1]) {
            cube.visible.RIGHT = false;
        }
        if((z+1 > 0 && z+1 < tileSize) && tileData[x][y][z+1]) {
            cube.visible.LEFT = false;
        }
        if((x-1 > 0 && x-1 < tileSize) && tileData[x-1][y][z]) {
            cube.visible.BACK = false;
        }
        if((x+1 > 0 && x+1 < tileSize) && tileData[x+1][y][z]) {
            cube.visible.FRONT = false;
        }

        this.scene.add(cube);
    }

    buildTiles(tiles) {
        for(let tile of tiles) {
            const tileData = tile.tileData;
            for(let x = 0; x < tileData.length; x++) {
                for(let y = 0; y < tileData[x].length; y++) {
                    for(let z = 0; z < tileData[x][y].length; z++) {
                        if(tileData[x][y][z]) {
                            this.voxel(tileData, x + tile.pos.x, y, z + tile.pos.y);
                        }
                    }
                }
            }
        }
    }
}