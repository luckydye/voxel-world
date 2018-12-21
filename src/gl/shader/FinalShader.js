import { Resources } from '../../Resources.js';
import { GLShader } from "../GL.js";

Resources.add({
    'final.vs': './resources/shader/final.vertex.shader',
    'final.fs': './resources/shader/final.fragment.shader',
}, false);

export default class FinalShader extends GLShader {

    static get source() {
        return [
            Resources.get('final.vs'),
            Resources.get('final.fs'),
        ];
    }

    get lightPos() {
        const t = performance.now() / 500;
        const x = Math.sin(t) * 300;
        const y = Math.sin(t) * 500 + 700;
        const z = Math.cos(t) * 300;
        return [x, y, z];
    }

    get uniform() {
		return {
            integer: { samples: 64 },
            radius: 4.0,
            width: window.innerWidth,
            height: window.innerWidth,
            lightPos: this.lightPos,
        };
	}
    
    constructor() {
        super({ name: "final" });
    }

}