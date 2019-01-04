#version 300 es
precision mediump float;

in vec2 vTexCoords;

uniform sampler2D uTexture;
uniform float uTextureSize;
uniform vec3 uDiffuseColor;

out vec4 oFragColor;

void main() {
  if(uTextureSize > 1.0) {
    vec2 imageSize = vec2(textureSize(uTexture, 0));
    vec4 textureColor = texture(uTexture, vec2(vTexCoords) / (imageSize.x / uTextureSize));
    oFragColor = textureColor * vec4(uDiffuseColor, 1.0);
  } else {
    oFragColor = vec4(uDiffuseColor, 1.0);
  }

  oFragColor = vec4(vTexCoords.x, 1.0, vTexCoords.y, 1.0);
}
