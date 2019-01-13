import { Resources } from '../Resources.js';
import { GLShader } from '../graphics/GLShader.js';

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
		// return {
        //     ambient: 0.75,
        //     shadowcolor: 0.33,
        // };
		return {
            ambient: 0.05,
            shadowcolor: 0.03,
        };
	}
    
    constructor() {
        super({ name: "light" });
    }
}