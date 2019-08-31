import { Resources } from '@uncut/viewport/src/Resources';
import Viewport from '@uncut/viewport/components/Viewport';
import { Scene } from '@uncut/viewport/src/scene/Scene';
import { Group } from '@uncut/viewport/src/geo/Group';
import DefaultMaterial from '@uncut/viewport/src/materials/DefaultMaterial';
import Config from '@uncut/viewport/src/Config';
import { Cube } from '@uncut/viewport/src/geo/Cube';
import PrimitivetMaterial from '@uncut/viewport/src/materials/PrimitiveMaterial';
import { Geometry } from '@uncut/viewport/src/scene/Geometry';
import { Texture } from '@uncut/viewport/src/materials/Texture';
import { Task } from '@uncut/viewport/src/Scheduler';
import { CameraControler } from '@uncut/viewport/src/controlers/CameraControler';

Resources.resourceRoot = "./res";

Resources.add({
    'world': 'worlds/default.json',
    'blockTexture': 'textures/blocks_solid_textured.png',
}, false);

Config.global.setValue('show.grid', false);

Config.global.define('freemode', false, false);
Config.global.define('debug', false, false);
Config.global.define('view_distance', 7, 7);

Config.global.load();

Config.global.setValue('view_distance', 5);

Config.global.save();

export class VoxelWorld extends Viewport {

    init(args) {
        super.init(args);

        this.worker = new Worker('./Worldgen.js');

        this.renderer.setOptions({
            DEPTH_TEST: true,
            CULL_FACE: true,
            BLEND: true,
        });

        this.createVoxelScene();
    }

    createVoxelScene(args) {

        this.scene.clear();

        this.scene = new Scene(this.camera);
        this.renderer.setScene(this.scene);

        this.renderer.background = [0, 0, 0, 0];

        this.camera.position.y = -550;
        this.camera.position.x = -10;

        this.camera.fov = 50;

        let zOffset = 0;

        const tileSize = 20 * 32;

        // freemode
        if (!Config.global.getValue('freemode')) {
            zOffset = 6;
        }

        setInterval(() => {
            const pos = [
                Math.floor(-this.camera.position.x / tileSize),
                Math.floor(-this.camera.position.z / tileSize) - zOffset,
            ];

            this.worker.postMessage({
                type: 'regen',
                settings: Object.assign(Resources.get('world').world, {
                    view_distance: +Config.global.getValue('view_distance'),
                    tile_size: 32,
                }),
                offset: pos
            });

        }, 1000 / 14);

        // freemode
        if (!Config.global.getValue('freemode')) {
            this.scheduler.addTask(new Task(ms => {
                this.camera.position.z += 0.25 * ms;
            }));
        }

        this.scene.getRenderableObjects = () => {

            let arr = [...this.scene.objects].filter(obj => {

                const distX = Math.abs(-this.camera.position.x - obj.position.x);
                const distZ = Math.abs(-this.camera.position.z - obj.position.z);

                const viewDistance = tileSize * (+Config.global.getValue('view_distance'));

                return obj.guide || !obj.hidden && distX < viewDistance && distZ < viewDistance;
            });

            arr = arr.sort((a, b) => {

                const distA = Math.sqrt(
                    Math.pow(-this.camera.position.x - a.position.x, 2),
                    Math.pow(-this.camera.position.z - a.position.z, 2),
                );

                const distB = Math.sqrt(
                    Math.pow(-this.camera.position.x - b.position.x, 2),
                    Math.pow(-this.camera.position.z - b.position.z, 2),
                );

                return distB - distA;
            })

            return arr;
        }

        let ratio = 2.35;

        if (location.hash) {
            ratio = +location.hash.substr(1);
        }

        // freemode
        if (Config.global.getValue('freemode')) {
            this.renderer.setResolution(1280, 1280 / ratio);
            this.camera.fov = 90;
            const controler = new CameraControler(this.camera, this);
        } else {

            this.renderer.setResolution(640, 640 / ratio);
        }

        this.worker.onmessage = e => {
            if (e.data.type == 'tile') {

                const geo = new Geometry({
                    vertecies: e.data.buffer.vertecies,
                    position: e.data.position,
                    material: new PrimitivetMaterial()
                });

                this.scene.add(geo);

                setTimeout(() => {
                    geo.material = new DefaultMaterial({
                        diffuseColor: [0, 0, 0, 0],
                        texture: new Texture(Resources.get('blockTexture')),
                        textureScale: 16
                    });
                }, 250);

                if (Config.global.getValue('debug')) {

                    const tiledim = tileSize / 2;
                    const tileheight = 20 * 64;

                    const grid = new Geometry({
                        guide: true,
                        vertecies: [
                            -tiledim, tileheight, -tiledim, 0, 0, 1, 0, 0,
                            -tiledim, tileheight, tiledim, 0, 0, 1, 0, 0,

                            tiledim, tileheight, tiledim, 0, 0, 1, 0, 0,
                            tiledim, tileheight, -tiledim, 0, 0, 1, 0, 0,

                            -tiledim, tileheight, -tiledim, 0, 0, 1, 0, 0,
                            tiledim, tileheight, -tiledim, 0, 0, 1, 0, 0,

                            -tiledim, tileheight, tiledim, 0, 0, 1, 0, 0,
                            tiledim, tileheight, tiledim, 0, 0, 1, 0, 0,

                            -tiledim, 0, -tiledim, 0, 0, 1, 0, 0,
                            -tiledim, 0, tiledim, 0, 0, 1, 0, 0,

                            tiledim, 0, tiledim, 0, 0, 1, 0, 0,
                            tiledim, 0, -tiledim, 0, 0, 1, 0, 0,

                            -tiledim, 0, -tiledim, 0, 0, 1, 0, 0,
                            tiledim, 0, -tiledim, 0, 0, 1, 0, 0,

                            -tiledim, 0, tiledim, 0, 0, 1, 0, 0,
                            tiledim, 0, tiledim, 0, 0, 1, 0, 0,

                            // up

                            tiledim, 0, tiledim, 0, 0, 1, 0, 0,
                            tiledim, tileheight, tiledim, 0, 0, 1, 0, 0,

                            -tiledim, 0, tiledim, 0, 0, 1, 0, 0,
                            -tiledim, tileheight, tiledim, 0, 0, 1, 0, 0,

                            tiledim, 0, -tiledim, 0, 0, 1, 0, 0,
                            tiledim, tileheight, -tiledim, 0, 0, 1, 0, 0,
                        ],
                        position: e.data.position,
                        material: new PrimitivetMaterial(),
                    });

                    this.scene.add(grid);
                }
            }
        }
    }

}

customElements.define('voxel-world', VoxelWorld);
