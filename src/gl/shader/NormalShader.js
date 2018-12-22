import { Resources } from '../../Resources.js';
import { GLShader } from "../GL.js";

Resources.add({
    'gbuffer.vs': './resources/shader/gbuffer.vertex.shader',
    'normal.fs': './resources/shader/normal.fragment.shader',
}, false);

export default class NormalShader extends GLShader {

    static get source() {
        return [
            Resources.get('gbuffer.vs'),
            Resources.get('normal.fs'),
        ];
    }

    get uniform() {
        return {
            uTime: performance.now(),
        }
    }
    
    constructor() {
        super({ name: "normal" });
    }

}