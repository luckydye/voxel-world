#version 300 es
precision mediump float;

// in vec4 normalPos;
in vec4 worldPos;
// in vec2 texCoords;

out vec4 oFragColor;

void main () {
  oFragColor = vec4(worldPos.xyz, 1.0);
}
