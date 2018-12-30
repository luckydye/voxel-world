#version 300 es
precision mediump float;

in vec2 vTexCoords;

uniform float uTextureSize;
uniform sampler2D uTexture;

out vec4 oFragColor;

void main() {
  vec2 imageSize = vec2(textureSize(uTexture, 0));
  vec4 textureColor = texture(uTexture, vec2(vTexCoords) / (imageSize.x / uTextureSize));
  oFragColor = textureColor;
}
