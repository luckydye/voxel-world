import { Renderer } from "./gl/Renderer.js";
import { Scene } from "./gl/Scene.js";
import { Cube } from "./gl/geo/Cube.js";
import TestShader from "./gl/shader/TestShader.js";
import { Vec } from "./gl/Math.js";

const shaders = [
    new TestShader({ texturesrc: "./images/dirt.png" }),
    new TestShader({ texturesrc: "./images/stone.png" }),
    new TestShader({ texturesrc: "./images/lava.png" }),
    new TestShader({ texturesrc: "./images/diamond_block.png" }),
    new TestShader({ texturesrc: "./images/crafting_table_top.png" }),
];

const size = 20;

export default class VoxelWorld {

    constructor({ canvas } = {}) {

        this.scene = new Scene();
        this.renderer = new Renderer(canvas);
        this.renderer.setScene(this.scene);

        this.buildCube(size, size, size);
    }
    
    makeCube(args) {
        const cube = new Cube(args);
        return cube;
    }

    randomShader() {
        return shaders[Math.floor(Math.random() * shaders.length)];
    }

    buildCube(w, h, d) {
        for(let x = 0; x < w; x++) {
            for(let y = 0; y < h; y++) {
                for(let z = 0; z < d; z++) {
                    if(Math.random() > 0.66) {
                        this.scene.add(this.makeCube({
                            shader: this.randomShader(),
                            position: new Vec(
                                ((x * 600) + 300) - ((w/2) * 600),
                                ((y * 600) + 300) - ((h) * 600),
                                ((z * 600) + 300) - ((d/2) * 600),
                            )
                        })); 
                    }
                }
            }
        }
    }

    regen() {
        this.scene.clear();
        this.buildCube(size, size, size);
    }
}