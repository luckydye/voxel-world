import { Renderer } from "./gl/Renderer.js";
import { Scene } from "./gl/Scene.js";
import { Cube } from "./gl/geo/Cube.js";
import { Vec } from "./gl/Math.js";
import { Camera } from "./gl/Camera.js";

const size = [10, 6, 10];

export default class VoxelWorld {

    constructor({ canvas } = {}) {

        const sceneOpts = {
            camera: new Camera({ 
                fov: 65, 
                position: new Vec(0, 4000, -15000) 
            })
        }

        this.scene = new Scene(sceneOpts);
        this.renderer = new Renderer(canvas);
        this.renderer.setScene(this.scene);

        this.buildCube(...size);
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

                    let material = "DIRT";
                    if(y < 2 || y < 3 && Math.random() > 0.5) {
                        material = "GRASS";
                    } else if(y > 4 && Math.random() > 0.25) {
                        if(Math.random() < 0.2) {
                            material = "STONE";
                        } else {
                            material = "LAVA";
                        }
                    }

                    if(Math.random() > 0.33 || y < 4) {
                        this.scene.add(this.makeCube({
                            material,
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
        this.buildCube(...size);
    }
}