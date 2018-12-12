import { Renderer } from "./gl/Renderer.js";
import { Scene } from "./gl/Scene.js";
import { Cube } from "./gl/geo/Cube.js";
import TestShader from "./gl/shader/TestShader.js";
import { Vec } from "./gl/Math.js";

const shaders = [
    new TestShader({ texturesrc: "./images/dirt.png" }),
    new TestShader({ texturesrc: "./images/stone.png" }),
    new TestShader({ texturesrc: "./images/grass.png" }),
    new TestShader({ texturesrc: "./images/lava.png" }),
    new TestShader({  }),
];

const size = 10;

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

                    let shader = shaders[0];
                    if(y < 2 || y < 3 && Math.random() > 0.5) {
                        shader = shaders[2];
                    } else if(y > 5 && Math.random() > 0.25) {
                        if(Math.random() < 0.2) {
                            shader = shaders[1];
                        } else if(Math.random() > 0.33) {
                            shader = shaders[4];
                        } else {
                            shader = shaders[3];
                        }
                    }

                    if(Math.random() > 0.33 || y >= 1) {
                        this.scene.add(this.makeCube({
                            shader: shader,
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