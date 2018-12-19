#version 300 es
precision mediump float;

in vec4 vPos;

out vec4 oFragColor;

void main () {
  oFragColor = vec4(vec3(1.0 / vPos.z), 1.0);
}
