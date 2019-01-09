#version 300 es
precision mediump float;

in vec2 vTexCoords;
in vec4 vWorldPos;

uniform sampler2D colorTexture;
uniform sampler2D reflectionMap;
uniform sampler2D reflectionBuffer;

uniform float textureScale;
uniform float transparency;
uniform vec3 diffuseColor;

out vec4 oFragColor;

void main() {
  // set diffuse color
  oFragColor = vec4(diffuseColor, 1.0 - transparency);

  vec2 imageSize = vec2(textureSize(colorTexture, 0));
  vec2 textureCoords = vec2(vTexCoords) / (imageSize.x / textureScale);

  vec4 textureColor = texture(colorTexture, textureCoords);
  oFragColor *= textureColor;

  float reflectivenss = texture(reflectionMap, textureCoords).r;
  if(reflectivenss > 0.0) {
    oFragColor = vec4(1.0, 1.0, 1.0, 1.0);
  }
}
