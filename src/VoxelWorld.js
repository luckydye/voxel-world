import { Resources } from '@uncut/viewport/src/Resources';
import Viewport from '@uncut/viewport/components/Viewport';
import { Scene } from '@uncut/viewport/src/scene/Scene';
import { Group } from '@uncut/viewport/src/geo/Group';
import { Material } from '@uncut/viewport/src/materials/Material';

Resources.add({
    'world': './res/worlds/default.json',
    'defaultTextureAtlas': './res/textures/blocks_solid.png',
    'defaultReflectionMap': './res/textures/blocks_solid_reflectionmap.png',
    'placeholder': './res/textures/placeholder.png',
}, false);

let worker;

function createWorker() {
    return new Worker('./Worldgen.js');
}

export class VoxelWorld extends Viewport {

    init() {
        super.init();

        worker = createWorker();

        this.createVoxelScene();
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
            if (e.data.type == 'tile') {
                const tile = Object.assign(new Group, e.data.tile.group);
                tile.mat = Material.WORLD;
                this.scene.add(tile);
            }
        }

        this.defaultLighting();
    }

    defaultLighting() {
        this.scene.lightSources.position.z = -2500;
        this.scene.lightSources.position.y = 1000;
        this.scene.lightSources.fov = 100;
    }

}

customElements.define('voxel-world', VoxelWorld);
