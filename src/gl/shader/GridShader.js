import { GLShader } from "../GL.js";
import { Resources } from "../../Resources.js";

Resources.add({
    'grid.vs': './resources/shader/grid.vertex.shader',
    'grid.fs': './resources/shader/grid.fragment.shader',
}, false);

export default class GridShader extends GLShader {

    static get source() {
        return [
            Resources.get('grid.vs'),
            Resources.get('grid.fs'),
        ];
    }
    
    constructor() {
        super({ name: "grid" });
    }
}
