import { Renderer } from "./gl/Renderer.js";
import { Scene } from "./gl/Scene.js";
import { Cube } from "./gl/geo/Cube.js";
import TestShader from "./gl/shader/TestShader.js";
import { Vec } from "./gl/Math.js";

export default class VoxelWorld {

    constructor({ canvas } = {}) {

        this.scene = new Scene();
        this.renderer = new Renderer(canvas);
        this.renderer.setScene(this.scene);

        this.buildCube(3, 3, 3);
    }
    
    makeCube(args) {
        const cube = new Cube(args);
        const shader = new TestShader();
        cube.assignShader(shader);
        return cube;
    }

    randomTexture() {
        const textures = [
            "../dirt.jpg",
            "../stone.jpg"
        ];
        return textures[Math.floor(Math.random() * textures.length)];
    }

    buildCube(w, h, d) {
        for(let x = 0; x < w; x++) {
            for(let y = 0; y < h; y++) {
                for(let z = 0; z < d; z++) {
                    this.scene.add(this.makeCube({
                        position: new Vec(
                            x * 600 - ((w/2) * 300),
                            y * -600 - 300,
                            z * 600 - ((d/2) * 300),
                        ),
                        texture: this.randomTexture()
                    }));
                }
            }
        }
    }

}