#version 300 es
precision mediump float;

in vec4 vWorldPos;
in vec2 vTexCoords;

out vec4 oFragColor;

void main () {
  oFragColor = vec4(vTexCoords.x, vTexCoords.y, 0.2, 1.0);
}
