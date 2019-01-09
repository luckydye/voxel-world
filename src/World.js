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
import { Geometry } from './gl/scene/Geometry.js';
import { VertexBuffer } from './gl/graphics/VertexBuffer.js';
import { PointLight } from './gl/scene/PointLight.js';

Resources.add({
    'materials': './resources/materials/materials.json',
	'defaultTextureAtlas': './resources/textures/blocks_solid.png',
	'defaultReflectionMap': './resources/textures/blocks_solid_reflectionmap.png',
    'spaceship': './resources/models/spaceship.obj',
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

        this.scene = new Scene({
            camera: this.camera,
        });

        this.renderer.setScene(this.scene);

        this.createVoxelScene();

		// this.scene.add(new PointLight({ material: Material.LIGHT }));
    }

    createModelFromFile(resource) {
        const data = Resources.get(resource);

        const geo = new Geometry();
        geo.createBuffer = () => {
            const vertArray = [];
            for(let v = 0; v < data.vertecies.length; v++) {
                vertArray.push(
                    data.vertecies[v][0],
                    data.vertecies[v][1],
                    data.vertecies[v][2],
                    data.uvs[v][0],
                    data.uvs[v][1],
                );
            }
            const vertxBuffer = VertexBuffer.create(vertArray);
            vertxBuffer.type = "TRIANGLES";
            vertxBuffer.attributes = [
                { size: 3, attribute: "aPosition" },
                { size: 2, attribute: "aTexCoords" }
            ]
            return vertxBuffer;
        }
        geo.scale = 50;
        geo.position.y = -400;

        return geo;
    }

    createTerrainScene(args) {
        this.terrain = new Terrain({
            material: Material.WORLD,
            ...args
        });

        this.scene.clear();
        this.scene.add(this.terrain);
    }

    createVoxelScene(args) {
        const settings = Resources.get('world');
        this.worldgen = new VoxelWorldGenerator(args || settings.world);

        //voxel world generation
        this.scene.clear();
        this.worldgen.regen(settings.world.seed);

        this.worldgen.group.mat = Material.WORLD;

        this.scene.add(this.worldgen.group);
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

            const reflectionImage = Resources.get(mats[name].reflectionMap);
            const reflectionTexture = this.initTexture(reflectionImage);
            mat.reflectionMap = reflectionTexture;
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