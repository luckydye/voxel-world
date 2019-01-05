import '../lib/gl-matrix.js';
import { Renderer } from "./gl/graphics/Renderer.js";
import { Scene } from "./gl/scene/Scene.js";
import { Vec } from "./gl/Math.js";
import { Camera } from "./gl/scene/Camera.js";
import { VoxelWorldGenerator } from "./VoxelWorldGenerator.js";
import { Material } from "./gl/graphics/Material.js";
import { Resources } from "./gl/Resources.js";
import { Terrain } from './gl/geo/Terrain.js';

Resources.add({
    'materials': './resources/materials/materials.json',
    'defaulttexture': './resources/textures/placeholder.png',
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
            rotation: settingsCamRot ? new Vec(...settingsCamRot) : new Vec(19.5, 0.5, 0.5) 
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

    createVoxelScene() {
        this.scene = new Scene({
            camera: this.camera,
        });
        this.renderer.setScene(this.scene);
        
        const settings = Resources.get('world');
        this.worldgen = new VoxelWorldGenerator(settings.world);
        this.worldgen.scene = this.scene;

        //voxel world generation
        this.scene.clear();
        this.worldgen.regen(settings.world.seed);
    }

    initMaterials() {
        const mats = Resources.get('materials');
        for(let name in mats) {
            const mat = Material.create(name);
            mat.texture = Resources.get(mats[name].texture) || Resources.get("defaulttexture");
            mat.animated = mat.texture.localName === "video";
            mat.diffuseColor = mats[name].diffuseColor || [1, 1, 1];
            mat.textureSize = mats[name].textureSize || 0;
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