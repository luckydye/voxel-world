import '../lib/gl-matrix.js';
import { Renderer } from "./gl/Renderer.js";
import { Scene } from "./gl/scene/Scene.js";
import { Cube } from "./gl/geo/Cube.js";
import { Vec } from "./gl/Math.js";
import { Camera } from "./gl/scene/Camera.js";
import { WorldGenerator } from "./WorldGenerator.js";
import { Material } from "./gl/scene/Material.js";
import { Resources } from "./Resources.js";
import { Statistics } from './Statistics.js';
import { Voxel } from './gl/geo/Voxel.js';

let world = 'example1';

if(document.location.search) {
    world = document.location.search.substr(1);
}

let wtexture = './resources/textures/blocks_solid.png';

if(document.location.hash == "#mc") {
    wtexture = './resources/textures/blocks.png';
}

Resources.add({
    'materials': './resources/materials/materials.json',
    'worldtextures': wtexture,
    'cubetexture': './resources/textures/cube.png',
    'world': './resources/worlds/' + world + '.json',
}, false);

let nextFrame, lastFrame;

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

        const settingsCamPos = settings.scene.camera.position;
        const settingsCamRot = settings.scene.camera.rotation;

        const sceneOpts = {
            camera: new Camera({ 
                fov: settings.scene.camera.fov,
                position: settingsCamPos ? new Vec(...settingsCamPos) : new Vec(0.5, 200.5, -600.5),
                rotation: settingsCamRot ? new Vec(...settingsCamRot) : new Vec(19.5, 0.5, 0.5) 
            })
        }
        this.scene = new Scene(sceneOpts);
        this.renderer = new Renderer(canvas);
        this.worldgen = new WorldGenerator(settings.world);

        this.renderer.setScene(this.scene);

        this.regen(settings.world.seed);

        this.showcase = new Cube({
            scale: 10,
            position: new Vec(0,-400,0),
            material: Material.WORLD,
            uv: [2, 0]
        });

        this.scene.add(this.showcase)

        this.renderLoop();
    }

    renderLoop() {
		if(nextFrame) {
			cancelAnimationFrame(nextFrame);
        }
        
        const loop = () => {
            const currentFrame = performance.now();
            Statistics.data.fps = Math.floor(1000 / (currentFrame - lastFrame));
            Statistics.data.passes = 0;

            this.showcase.rotation.x += 0.05;
            this.showcase.rotation.z += 0.05;

            this.scene.update();
            this.renderer.draw();

            if(lastFrame) {
                Statistics.data.drawTime = Math.round((performance.now() - lastFrame) * 10) / 10;
            }

            lastFrame = currentFrame;
        
            nextFrame = requestAnimationFrame(loop);
        }

        loop();
    }

    initMaterials() {
        const mats = Resources.get('materials');
        for(let name in mats) {
            const mat = Material.create({ 
                name: name,
                texture: Resources.get(mats[name].texture),
            });
            if(mat.texture && mat.texture.localName === "video") {
                mat.animated = true;
            }
            mat.defuseColor = mats[name].defuseColor;
            mat.textureSize = mats[name].textureSize;
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
        const tileHeight = this.worldgen.tileHeight;
        const cube = new Voxel({
            material: Material.WORLD,
            uv: tileData[x][y][z],
            position: new Vec(
                ((x * 20) + 10) - ((tileSize/2) * 20),
                ((y * 20) + 10) - ((tileHeight) * 20) - 0.5,
                ((z * 20) + 10) - ((tileSize/2) * 20),
            )
        });

        if((y-1 > 0 && y-1 < tileHeight) && tileData[x][y-1][z]) {
            cube.visible.TOP = false;
        }
        if((y+1 > 0 && y+1 < tileHeight) && tileData[x][y+1][z]) {
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

        if(!cube.invisible) {
            Statistics.data.voxels++;
            this.scene.add(cube);
        }
    }

    buildTiles(tiles) {
        Statistics.data.voxels = 0;

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