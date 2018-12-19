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
    
    constructor() {
        super({ name: "final" });
    }

}