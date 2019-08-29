import { Resources } from '@uncut/viewport/src/Resources';
import Viewport from '@uncut/viewport/components/Viewport';
import { Scene } from '@uncut/viewport/src/scene/Scene';
import { Group } from '@uncut/viewport/src/geo/Group';
import DefaultMaterial from '@uncut/viewport/src/materials/DefaultMaterial';
import Config from '@uncut/viewport/src/Config';
import { ViewportController } from '@uncut/viewport/src/controlers/ViewportController';
import { Cube } from '@uncut/viewport/src/geo/Cube';
import PrimitivetMaterial from '@uncut/viewport/src/materials/PrimitiveMaterial';
import { Geometry } from '@uncut/viewport/src/scene/Geometry';
import { Texture } from '@uncut/viewport/src/materials/Texture';

Resources.add({
    'world': 'worlds/default.json',
    'blockTexture': 'textures/blocks_solid_textured.png',
}, false);

Config.global.setValue('show.grid', true);

export class VoxelWorld extends Viewport {

    init(args) {
        super.init(args);

        this.worker = new Worker('./Worldgen.js');

        this.createVoxelScene();
    }

    createVoxelScene(args) {
        this.scene = new Scene(this.camera);
        this.renderer.setScene(this.scene);

        this.camera.fov = 50;

        this.renderer.setResolution(640, 272);

        const controler = new ViewportController(this.camera, this);

        this.scene.clear();

        this.worker.postMessage({ type: 'regen', settings: Resources.get('world').world });

        this.worker.onmessage = e => {
            if (e.data.type == 'tile') {

                const geo = new Geometry({
                    vertecies: e.data.buffer.vertecies,
                    position: e.data.position,
                    material: new DefaultMaterial({
                        texture: new Texture(Resources.get('blockTexture')),
                        textureScale: 16
                    })
                });

                this.scene.add(geo);
            }
        }
    }

}

customElements.define('voxel-world', VoxelWorld);
