import { Renderer } from "./gl/Renderer.js";
import { Scene } from "./gl/Scene.js";
import { Cube } from "./gl/geo/Cube.js";
import TestShader from "./gl/shader/TestShader.js";
import { Vec } from "./gl/Math.js";

const shaders = [
    new TestShader({ texturesrc: "./images/dirt.png" }),
    new TestShader({ texturesrc: "./images/stone.png" }),
    new TestShader({ texturesrc: "./images/lava.png" }),
];

export default class VoxelWorld {

    constructor({ canvas } = {}) {

        this.scene = new Scene();
        this.renderer = new Renderer(canvas);
        this.renderer.setScene(this.scene);

        this.buildCube(10, 10, 10);
        console.log("drawing", 10 * 10 * 10, "blocks, equals", 10 * 10 * 10 * 36, "verts");
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
                    if(Math.random() > 0.65) {
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
        this.buildCube(10, 10, 10);
    }
}