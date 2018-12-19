import { GLShader } from "../GL.js";
import { Resources } from "../../Resources.js";

Resources.add({
    'grid.vs': './resources/shader/grid.vertex.shader',
    'grid.fs': './resources/shader/grid.fragment.shader',
}, false);

export default class GridShader extends GLShader {
    
    constructor() {
        super({ name: "grid" });

        this.src = [
            Resources.get('grid.vs'),
            Resources.get('grid.fs'),
        ];
    }
}
