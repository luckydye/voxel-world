import CompShader from '@uncut/viewport/src/shader/CompShader';

export default class PostProcessingShader extends CompShader {

    static fragmentSource() {
        return `#version 300 es

        precision mediump float;
        
        in vec2 vTexCoords;
        
        uniform sampler2D color;
        uniform sampler2D depth;
        uniform sampler2D shadow;
        
        out vec4 oFragColor;
        
        void main() {
            vec4 color = texture(color, vTexCoords);
            float depthValue = texture(depth, vTexCoords).r;

            float selfShadow = clamp(pow(depthValue, 20.0), 0.75, 1.0);

            vec3 fog = vec3(pow(texture(depth, vTexCoords).r, 150000.0));

            float ambient = 0.05;

            oFragColor = vec4(color.rgb * selfShadow + fog + ambient, color.a - fog);
        }`;
    }
}
