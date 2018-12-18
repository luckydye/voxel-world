import { Resources } from '../../Resources.js';
import { GLShader } from "../GL.js";

Resources.add({
    'depth.vs': './resources/shader/depth.vertex.shader',
    'depth.fs': './resources/shader/depth.fragment.shader',
}, false);

export default class DepthShader extends GLShader {

    constructor() {
        super({ name: "depth" });

        this.src = [
            Resources.get('depth.vs'),
            Resources.get('depth.fs'),
        ];
    }

}