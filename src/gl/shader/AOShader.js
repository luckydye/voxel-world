import { GLShader } from "../GL.js";
import { Resources } from "../../Resources.js";

Resources.add({
    'ao.fs': './resources/shader/ao.fragment.shader',
}, false)

export default class AOShader extends GLShader {

    static get source() {
        return [
            `#version 300 es

                layout(location = 0) in vec3 aPosition;
                layout(location = 1) in vec2 aTexCoords;
                
                out vec2 texCoord;
                
                void main() {
                    gl_Position = vec4(aPosition, 1.0);
                    texCoord = aTexCoords;
                }
            `,
            Resources.get('ao.fs')
        ];
    }

    constructor() {
        super({ name: "ao" });
    }

}