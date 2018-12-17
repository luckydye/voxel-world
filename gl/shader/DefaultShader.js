import { Resources } from '../Resources.js';
import { GLShader } from "../GLShader.js";

Resources.add({
    'default.vs': './resources/shader/default.vertex.shader',
    'default.fs': './resources/shader/default.fragment.shader',
}, false);

export default class DefaultShader extends GLShader {

    constructor() {
        super({ name: "default" });

        this.src = [
            Resources.get('default.vs'),
            Resources.get('default.fs'),
        ];
    }

}