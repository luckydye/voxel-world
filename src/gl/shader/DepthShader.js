import { Resources } from '../../Resources.js';
import { GLShader } from "../GL.js";

Resources.add({
    'gbuffer.vs': './resources/shader/gbuffer.vertex.shader',
    'depth.fs': './resources/shader/depth.fragment.shader',
}, false);

export default class DepthShader extends GLShader {

    static get source() {
        return [
            Resources.get('gbuffer.vs'),
            Resources.get('depth.fs'),
        ];
    }

    constructor() {
        super({ name: "depth" });
    }

}