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
import { PlayerControler } from '@uncut/viewport/src/controlers/PlayerControler';
import PostProcessingShader from './PostProcessingShader';
import MeshShader from '@uncut/viewport/src/shader/MeshShader';

Resources.resourceRoot = "./res";

if (!location.hash) {
    MeshShader.spuash = false;
}

Resources.add({
    'world': 'worlds/default.json',
    'blockTexture': 'textures/blocks_solid_textured.png',
    'blockRoughness': 'textures/blocks_solid_roughness.png',
    'blockNormals': 'textures/blocks_solid_normals.png',
}, false);

const canvas = document.createElement('canvas');
const offscreen = canvas.transferControlToOffscreen();

export class VoxelWorld extends Viewport {

    constructor() {
        super({
            controllertype: null,
            offscreen: offscreen,
            canvas: canvas,
        });
    }

    init(args) {
        super.init(args);

        this.worker = new Worker('./Worldgen.js');

        // this.renderer.compShader = new PostProcessingShader();

        this.renderer.background = [0, 0, 0, 0];

        this.renderer.setOptions({
            DEPTH_TEST: true,
            CULL_FACE: true,
            BLEND: true,
        });

        this.renderer.TEXTURE_MAG_FILTER = this.renderer.gl.NEAREST;
		this.renderer.TEXTURE_MIN_FILTER = this.renderer.gl.NEAREST;

        this.scene = new Scene();

        this.scene.add(this.camera);

        this.camera.fov = 50;
        this.camera.farplane = 5000;

        this.renderer.setResolution(this.parentNode.clientWidth, this.parentNode.clientHeight);
        window.addEventListener('resize', () => {
            this.renderer.setResolution(this.parentNode.clientWidth, this.parentNode.clientHeight);
        })

        this.createVoxelScene();
    }

    createVoxelScene(args) {
        const tileSize = 32;
        const viewDistance = 512;

        const requestTile = () => {
            const pos = [
                Math.floor(-this.camera.position.x / tileSize),
                Math.floor(-(this.camera.position.z + 75) / tileSize),
            ];

            this.worker.postMessage({
                type: 'regen',
                settings: Object.assign(Resources.get('world').world, {
                    view_distance: 7,
                    tile_size: tileSize,
                }),
                offset: pos
            });

        }

        setInterval(requestTile, 1000 / 14);
        requestTile();

        this.scheduler.addTask(new Task(ms => {
            this.camera.position.z -= 0.002 * ms;

            this.camera.position.y = -120;
            this.camera.position.x = 0;
    
            this.camera.rotation.x = 0.4;
            this.camera.rotation.y = 0;
            this.camera.rotation.z = 0;

            this.scene.lightsource.parent = this.camera;
            this.scene.lightsource.position.y = -1000;
            this.scene.lightsource.position.x = 0;
            this.scene.lightsource.position.z = 0;

            // this.scene.lightsource.rotation.x = (3.14 / 2) - 0.5;
            // this.scene.lightsource.rotation.y = -0.1;
            // this.scene.lightsource.rotation.z = -0.33;

            this.scene.lightsource.sensor.width = 128;
            this.scene.lightsource.sensor.height = 128;

            this.scene.lightsource.hidden = false;
        }));

        this.scene.getRenderableObjects = () => {

            let arr = [...this.scene.objects].filter(obj => {
                const distX = Math.abs(-this.camera.position.x - obj.position.x);
                const distZ = Math.abs(-this.camera.position.z - obj.position.z);

                const dist = Math.sqrt(
                    Math.pow(-this.camera.position.x - obj.position.x, 2) +
                    Math.pow(-this.camera.position.z - obj.position.z, 2)
                );

                return obj.guide || !obj.hidden && dist < viewDistance;
            });

            return arr;
        }

        const chunkTexture = new Texture(Resources.get('blockTexture'));
        const chunkTextureRoughness = new Texture(Resources.get('blockRoughness'));
        const chunkTextureNormals = new Texture(Resources.get('blockNormals'));

        const debugMaterial = new PrimitivetMaterial();
        const chunkMaterial = new DefaultMaterial({
            diffuseColor: [0, 0, 0, 0],
            texture: chunkTexture,
            specularMap: chunkTextureRoughness,
            normalMap: chunkTextureNormals,
            specular: 1,
            roughness: 1,
        });

        this.worker.onmessage = e => {
            if (e.data.type == 'tile') {

                const geo = new Geometry({
                    vertecies: e.data.buffer.vertecies,
                    position: e.data.position,
                    material: chunkMaterial,
                });

                geo.voxels = e.data.tileData;

                geo.timestamp = Date.now();

                this.scene.add(geo);

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
                        material: debugMaterial,
                    });

                    this.scene.add(grid);
                }
            }
        }
    }

}

customElements.define('voxel-world', VoxelWorld);
