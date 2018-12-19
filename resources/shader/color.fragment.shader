#version 300 es
precision mediump float;

in vec4 normalPos;
in vec4 worldPos;
in vec2 texCoords;

uniform sampler2D uTexture;

out vec4 oFragColor;

void main () {
  vec4 textureColor = texture(uTexture, texCoords / (256.0 / 16.0));
  oFragColor = textureColor;
}
