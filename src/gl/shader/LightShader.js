import { Resources } from '../Resources.js';
import { GLShader } from "../graphics/GL.js";

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

    get uniform() {
		return {
            pointLightPos: this.lightPos,
            ambient: 0.45,
        };
	}
    
    constructor() {
        super({ name: "light" });

        this.lightPos = [0, 1000, 0];
    }

}