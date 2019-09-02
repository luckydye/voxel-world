import CompShader from '@uncut/viewport/src/shader/CompShader';

export default class PostProcessingShader extends CompShader {

    static fragmentSource() {
        return `#version 300 es

        precision mediump float;
        
        in vec2 vTexCoords;
        
        struct SceneProjection {
            mat4 model;
            mat4 view;
            mat4 projection;
        };
        uniform SceneProjection scene;
        
        uniform vec3 cameraPosition;
        
        uniform sampler2D colorBuffer;
        uniform sampler2D shadowBuffer;
        uniform sampler2D depthBuffer;
        uniform sampler2D normalBuffer;
        
        out vec4 oFragColor;
        
        void main() {
            float depth = texture(depthBuffer, vTexCoords).r;
            vec4 color = texture(colorBuffer, vTexCoords);
            vec4 shadow = texture(shadowBuffer, vTexCoords);
            vec4 normal = texture(normalBuffer, vTexCoords);

            float selfShadow = clamp(pow(depth, 20.0), 0.75, 1.0);

            float fog = (pow(depth, 300.0) * 0.5);

            float ambient = 0.05;

            oFragColor = vec4((color * selfShadow + fog + ambient).rgb, color.a);
        }`;
    }

}