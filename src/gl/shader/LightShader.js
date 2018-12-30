import { Resources } from '../../Resources.js';
import { GLShader } from "../GL.js";

Resources.add({
    'gbuffer.vs': './resources/shader/gbuffer.vertex.shader',
    'light.fs': './resources/shader/light.fragment.shader',
}, false);

export default class LightShader extends GLShader {

    static get source() {
        return [
            Resources.get('gbuffer.vs'),
            Resources.get('light.fs'),
        ]
    }

    get lightPos() {
        const t = performance.now() / 1000;
        const radius = 700;

        const x = Math.sin(t) * radius;
        const y = 1000;
        const z = Math.cos(t) * radius;
        return [x, y, z];
    }

    get uniform() {
		return {
            pointLightPos: this.lightPos,
            ambient: 0.45,
        };
	}
    
    constructor() {
        super({ name: "light" });
    }

}