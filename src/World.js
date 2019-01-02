import '../lib/gl-matrix.js';
import { Renderer } from "./gl/graphics/Renderer.js";
import { Scene } from "./gl/scene/Scene.js";
import { Vec } from "./gl/Math.js";
import { Camera } from "./gl/scene/Camera.js";
import { VoxelWorldGenerator } from "./VoxelWorldGenerator.js";
import { Material } from "./gl/graphics/Material.js";
import { Resources } from "./gl/Resources.js";

Resources.add({
    'materials': './resources/materials/materials.json',
    'cubetexture': './resources/textures/cube.png',
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
        this.worldgen = new VoxelWorldGenerator(settings.world);

        this.renderer.setScene(this.scene);
        this.worldgen.scene = this.scene;

        // voxel world generation
        this.scene.clear();
        this.worldgen.regen(settings.world.seed);
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
            mat.emission = mats[name].emission || 0;
            mat.defuseColor = mats[name].defuseColor;
            mat.textureSize = mats[name].textureSize;
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