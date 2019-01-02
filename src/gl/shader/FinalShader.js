import { GLShader } from "../graphics/GL.js";

export default class FinalShader extends GLShader {

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
            `#version 300 es
            precision mediump float;
            
            in vec2 texCoord;
            
            uniform sampler2D normalBuffer;
            uniform sampler2D colorBuffer;
            uniform sampler2D lightBuffer;
            uniform sampler2D aoBuffer;
            
            out vec4 oFragColor;
            
            void main(void)
            {
                vec4 color = texture(colorBuffer, texCoord);
                vec4 light = texture(lightBuffer, texCoord);
                // vec4 normal = texture(normalBuffer, texCoord);
                // vec4 ao = texture(aoBuffer, texCoord);
            
                oFragColor = color * light;
            }
            `
        ];
    }

    constructor() {
        super({ name: "final" });
    }

}