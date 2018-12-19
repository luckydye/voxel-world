import { Resources } from '../../Resources.js';
import { GLShader } from "../GL.js";

Resources.add({
    'gbuffer.vs': './resources/shader/gbuffer.vertex.shader',
    'normal.fs': './resources/shader/normal.fragment.shader',
}, false);

export default class NormalShader extends GLShader {
    
    constructor() {
        super({ name: "normal" });

        this.src = [
            Resources.get('gbuffer.vs'),
            Resources.get('normal.fs'),
        ];
    }

}