import { GLShader } from "../graphics/GLShader.js";

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
            
            uniform sampler2D diffuseBuffer;
            uniform sampler2D depthBuffer;
            uniform sampler2D lightBuffer;
            
            out vec4 oFragColor;
            
            void main(void)
            {
                vec2 texCoords = texCoord;
                
                vec4 color = texture(diffuseBuffer, texCoords);
                vec4 light = texture(lightBuffer, texCoords);
            
                oFragColor = color * light;
            }
            `
        ];
    }

    constructor() {
        super({ name: "final" });
    }

}