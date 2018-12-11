import { Renderer } from "./gl/Renderer.js";
import { Scene } from "./gl/Scene.js";
import { Cube } from "./gl/geo/Cube.js";
import TestShader from "./gl/shader/TestShader.js";
import { Vec } from "./gl/Math.js";

const shaders = [
    new TestShader()
];

export default class VoxelWorld {

    constructor({ canvas } = {}) {

        this.scene = new Scene();
        this.renderer = new Renderer(canvas);
        this.renderer.setScene(this.scene);

        this.buildCube(5, 5, 5);
    }
    
    makeCube(args) {
        const cube = new Cube(args);
        cube.assignShader(shaders[0]);
        return cube;
    }

    randomTexture() {
        const textures = [
            "./dirt.png",
            "./stone.png"
        ];
        return textures[Math.floor(Math.random() * textures.length)];
    }

    buildCube(w, h, d) {
        for(let x = 0; x < w; x++) {
            for(let y = 0; y < h; y++) {
                for(let z = 0; z < d; z++) {
                    this.scene.add(this.makeCube({
                        position: new Vec(
                            ((x * 600) + 300) - ((w/2) * 600),
                            ((y * 600) + 300) - ((h) * 600),
                            ((z * 600) + 300) - ((d/2) * 600),
                        ),
                        texture: this.randomTexture()
                    }));
                }
            }
        }
    }

}