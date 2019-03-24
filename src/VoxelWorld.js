import Viewport from "./Viewport.js";
import { Resources } from "./gl/Resources.js";
import { Scene } from "./gl/scene/Scene.js";
import { PointLight } from "./gl/scene/PointLight.js";
import { Terrain } from "./gl/geo/Terrain.js";
import { Group } from "./gl/geo/Group.js";
import { Vec } from "./gl/Math.js";
import { Material } from "./gl/graphics/Material.js";

Resources.add({
    'world': './resources/worlds/default.json',
    'materials': './resources/materials/materials.json',
	'defaultTextureAtlas': './resources/textures/blocks_solid.png',
	'defaultReflectionMap': './resources/textures/blocks_solid_reflectionmap.png',
    'spaceship': './resources/models/spaceship.obj',
    'placeholder': './resources/textures/placeholder.png',
}, false);

let worker;

function createWorker() {
    return new Worker('./dist/Worldgen.js');
}

worker = createWorker();

class VoxelWorld extends Viewport {

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

        this.defaultLighting();
    }

    createVoxelScene(args) {
        this.scene = new Scene({
            camera: this.camera,
        });

        this.renderer.setScene(this.scene);

        const settings = args || Resources.get('world').world;

        worker.postMessage({ type: 'regen', settings: settings });

        this.scene.clear();

        worker.onmessage = e => {
            if(e.data.type == 'tile') {
                const tile = Object.assign(new Group, e.data.tile.group);
                tile.mat = Material.WORLD;
                this.scene.add(tile);
            }
        }

        this.defaultLighting();
    }

    defaultLighting() {
        // const pointLight = new PointLight({
        //     material: Material.LIGHT,
        //     position: new Vec(0, -300, 0),
        //     intensity: 1.0,
        //     color: [0.2, 0.5, 1.0],
        //     size: 3,
        // });
        // this.scene.add(pointLight);

        // const pointLight2 = new PointLight({
        //     material: Material.LIGHT,
        //     position: new Vec(0, -300, 0),
        //     intensity: 2.0,
        //     color: [0.4, 1.0, 0.1],
        //     size: 3,
        // });
        // this.scene.add(pointLight2);

        const pointLight3 = new PointLight({
            material: null,
            position: new Vec(0, -800, 0),
            intensity: 3.0,
            color: [1.0, 1.0, 1.0],
            size: 10,
        });
        this.scene.add(pointLight3);

        this.scene.onupdate = () => {
            // const time = performance.now();
            // pointLight.rotation.x += 0.54;
            // pointLight.rotation.y += 0.54;

            // pointLight.position.x = Math.sin(time / 600) * 300;
            // pointLight.position.z = Math.cos(time / 600) * 300;

            // pointLight2.rotation.x += 0.54;
            // pointLight2.rotation.y += 0.54;

            // pointLight2.position.x = Math.sin(time / 1000) * 600;
            // pointLight2.position.z = Math.cos(time / 1000) * 600;
            // pointLight2.position.y = (Math.sin(time / 2000) * 100) - 400;
        }
    }

}

customElements.define('voxel-world', VoxelWorld);