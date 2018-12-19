import { Resources } from '../../Resources.js';
import { GLShader } from "../GL.js";

Resources.add({
    'gbuffer.vs': './resources/shader/gbuffer.vertex.shader',
    'color.fs': './resources/shader/color.fragment.shader',
}, false);

export default class ColorShader extends GLShader {
    
    constructor() {
        super({ name: "color" });

        this.src = [
            Resources.get('gbuffer.vs'),
            Resources.get('color.fs'),
        ];
    }

}