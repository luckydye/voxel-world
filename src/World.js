import '../lib/gl-matrix.js';
import { Renderer } from "./gl/graphics/Renderer.js";
import { Scene } from "./gl/scene/Scene.js";
import { Vec } from "./gl/Math.js";
import { Camera } from "./gl/scene/Camera.js";
import { VoxelWorldGenerator } from "./VoxelWorldGenerator.js";
import { Material } from "./gl/graphics/Material.js";
import { Resources } from "./gl/Resources.js";
import { Terrain } from './gl/geo/Terrain.js';
import { MouseControler } from './gl/entity/MouseControler.js';
import { Texture } from './gl/graphics/Texture.js';

Resources.add({
    'materials': './resources/materials/materials.json',
}, false);

let nextFrame = 0, 
    lastFrame = 0, 
    accumulator = 0, 
    tickrate = 128;

export default class World {

    onloaded() { }

    render(canvas) {
        Resources.load().then(() => {
            console.log("resources loaded");
            this.init(canvas);

            console.log("resources initialized");
            this.renderLoop();

            this.onloaded();
        });
    }

    init(canvas) {
        this.initMaterials();

        this.renderer = new Renderer(canvas);

        const settings = Resources.get('world');
        const settingsCamPos = settings.scene.camera.position;
        const settingsCamRot = settings.scene.camera.rotation;

        this.camera = new Camera({ 
            fov: settings.scene.camera.fov,
            position: settingsCamPos ? new Vec(...settingsCamPos) : new Vec(0.5, 200.5, -600.5),
            rotation: settingsCamRot ? new Vec(...settingsCamRot) : new Vec(19.5, 0.5, 0.5),
			controller: MouseControler,
        });

        this.createVoxelScene();
    }

    createTerrainScene(args) {
        this.scene = new Scene({
            camera: this.camera,
        });
        this.renderer.setScene(this.scene);

        this.terrain = new Terrain({
            material: Material.TERRAIN,
            ...args
        });

        this.scene.add(this.terrain);
    }

    createVoxelScene(args) {
        this.scene = new Scene({
            camera: this.camera,
        });
        this.renderer.setScene(this.scene);
        
        const settings = Resources.get('world');
        this.worldgen = new VoxelWorldGenerator(args || settings.world);
        this.worldgen.scene = this.scene;

        //voxel world generation
        this.scene.clear();
        this.worldgen.regen(settings.world.seed);
    }

    initTexture(texImage) {
        const texture = new Texture(texImage);
        return texture;
    }

    initMaterials() {
        const mats = Resources.get('materials');
        for(let name in mats) {
            const mat = Material.create(name);
            const texImage = Resources.get(mats[name].texture);
            const texture = this.initTexture(texImage);
            mat.texture = texture;
            mat.diffuseColor = mats[name].diffuseColor || [1, 1, 1];
        }
    }

    renderLoop() {
        const currentFrame = performance.now();
        const delta = currentFrame - lastFrame;

        accumulator += delta;
        if(accumulator >= (1000 / tickrate)) {
            this.scene.update(delta);

            accumulator = 0;
        }
        this.renderer.draw();
        
        lastFrame = currentFrame;
        nextFrame = requestAnimationFrame(this.renderLoop.bind(this));
    }
}