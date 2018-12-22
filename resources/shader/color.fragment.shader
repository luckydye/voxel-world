#version 300 es
precision mediump float;

in vec2 vTexCoords;

uniform sampler2D uTexture;

out vec4 oFragColor;

void main() {
  vec4 textureColor = texture(uTexture, vec2(vTexCoords) / (256.0 / 16.0));
  oFragColor = textureColor;
}
