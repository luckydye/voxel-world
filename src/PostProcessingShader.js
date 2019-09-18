import CompShader from '@uncut/viewport/src/shader/CompShader';
import MeshShader from '@uncut/viewport/src/shader/MeshShader';

MeshShader.vertexSource = () => {
    return `#version 300 es
    
    precision mediump float;
    
    layout(std140, column_major) uniform;
    
    layout(location = 0) in vec3 aPosition;
    layout(location = 1) in vec2 aTexCoords;
    layout(location = 2) in vec3 aNormal;
    
    struct SceneProjection {
        mat4 model;
        mat4 view;
        mat4 projection;
    };
    
    struct Material {
        sampler2D texture;
        sampler2D specularMap;
        sampler2D normalMap;
        sampler2D displacementMap;
        sampler2D roughnessMap;
        vec4 diffuseColor;
        float specular;
        float roughness;
        float transparency;
        float textureScale;
        bool scaleUniform;
    };
    
    uniform SceneProjection scene;
    uniform Material material;
    
    uniform mat4 lightProjViewMatrix;
    uniform vec4 cameraPosition;

    uniform float time;
    
    out vec2 vTexCoords;
    out vec4 vWorldPos;
    out vec4 vTexelPos;
    out vec3 vViewPos;
    out vec3 vNormal;
    out vec3 vVertexPos;
    out vec3 primitiveColor;
    out SceneProjection sceneProjection;
    
    void main() {
        float uniformSacle = 1.0;
        if(material.scaleUniform) {
            uniformSacle = (scene.projection * scene.view * scene.model * vec4(aPosition, 1.0)).z;
        }

        if(material.textureScale > 0.0) {
            vec2 imageSize = vec2(textureSize(material.texture, 0));
            float scale = (imageSize.x / material.textureScale);
            vTexCoords = aTexCoords / scale;
        } else {
            vTexCoords = aTexCoords;
        }
    
        vec4 pos = scene.model * vec4(aPosition * uniformSacle, 1.0);
        float bump = texture(material.displacementMap, vTexCoords).r * 10.0;
        pos += vec4(aNormal.xyz, 1.0) * bump;

        vViewPos = -cameraPosition.xyz;
        vVertexPos = aPosition;
        vWorldPos = pos;
        vNormal = (vec4(aNormal, 0.0) * inverse(scene.model)).xyz;
        primitiveColor = aNormal;
        sceneProjection = scene;
    
        gl_Position = scene.projection * scene.view * vec4(pos.xyz, 1.0);
        gl_PointSize = 5.0;

        vTexelPos = gl_Position;
    }`;
}

export default class PostProcessingShader extends CompShader {

    static fragmentSource() {
        return `#version 300 es

        precision mediump float;
        
        in vec2 vTexCoords;
        
        uniform sampler2D colorBuffer;
        uniform sampler2D depthBuffer;
        
        out vec4 oFragColor;
        
        void main() {
            vec4 color = texture(colorBuffer, vTexCoords);
            float depth = texture(depthBuffer, vTexCoords).r;

            float selfShadow = clamp(pow(depth, 20.0), 0.75, 1.0);

            vec3 fog = vec3(pow(texture(depthBuffer, vTexCoords).r, 200000.0));

            float ambient = 0.05;

            oFragColor = vec4(color.rgb * selfShadow + fog + ambient, color.a - fog);
        }`;
    }
}
