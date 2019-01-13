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
import { Geometry } from './gl/scene/Geometry.js';
import { VertexBuffer } from './gl/graphics/VertexBuffer.js';
import { PointLight } from './gl/scene/PointLight.js';
import { Cube } from './gl/geo/Cube.js';

Resources.add({
    'materials': './resources/materials/materials.json',
	'defaultTextureAtlas': './resources/textures/blocks_solid.png',
	'defaultReflectionMap': './resources/textures/blocks_solid_reflectionmap.png',
    'spaceship': './resources/models/spaceship.obj',
    'placeholder': './resources/textures/placeholder.png',
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

    init(canvas) {
        const mats = Resources.get('materials');
        for(let name in mats) {
            Material.createFromJson(name, mats[name]);
        }

        this.renderer = new Renderer(canvas);

        const settings = Resources.get('world');
        const settingsCamPos = settings.scene.camera.position;
        const settingsCamRot = settings.scene.camera.rotation;

        this.camera = new Camera({ 
            fov: 90,
            position: settingsCamPos ? new Vec(...settingsCamPos) : new Vec(0.5, 200.5, -600.5),
            rotation: settingsCamRot ? new Vec(...settingsCamRot) : new Vec(19.5, 0.5, 0.5),
			controller: MouseControler,
        });

        this.renderer.fogEnabled = true;

        this.createVoxelScene();

        console.log(this.scene);
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
                { size: 3, attribute: "aTexCoords" }
            ]
            return vertxBuffer;
        }
        geo.scale = 50;
        geo.position.y = -400;

        return geo;
    }

    createTerrainScene(args) {
        this.scene = new Scene({
            camera: this.camera,
        });

        this.renderer.setScene(this.scene);

        this.terrain = new Terrain({
            material: Material.TEST,
            ...args
        });

        this.scene.clear();
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

        this.addLights();
    }

    addLights() {
        const pointLight = new PointLight({
            material: Material.LIGHT,
            position: new Vec(0, -300, 0),
            intensity: 3.0,
            color: [1.0, 0.1, 0.1],
            size: 2,
        });
        this.scene.add(pointLight);

        const pointLight2 = new PointLight({
            material: Material.LIGHT,
            position: new Vec(0, -300, 0),
            intensity: 2.5,
            color: [0.4, 1.0, 0.1],
            size: 3,
        });
        this.scene.add(pointLight2);

        setInterval(() => {
            const time = performance.now();
            pointLight.rotation.x += 0.54;
            pointLight.rotation.y += 0.54;

            pointLight.position.x = Math.sin(time / 600) * 300;
            pointLight.position.z = Math.cos(time / 600) * 300;

            pointLight2.rotation.x += 0.54;
            pointLight2.rotation.y += 0.54;

            pointLight2.position.x = Math.sin(time / 1000) * 600;
            pointLight2.position.z = Math.cos(time / 1000) * 600;
            pointLight2.position.y = (Math.sin(time / 2000) * 100) - 400;
        }, 14);
    }
}