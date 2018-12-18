import { Resources } from '../../lib/Resources.js';
import { GLShader } from "../GL.js";

Resources.add({
    'test.vs': './resources/shader/test.vertex.shader',
    'test.fs': './resources/shader/test.fragment.shader',
}, false);

export default class TestShader extends GLShader {
    
    constructor() {
        super({ name: "test" });

        this.src = [
            Resources.get('test.vs'),
            Resources.get('test.fs'),
        ];
    }

    get uniform() {
        return {
            ambient: 1.0,
            ligthIntesity: 40.0
        }
    }

}