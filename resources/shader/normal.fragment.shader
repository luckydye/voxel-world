#version 300 es
precision mediump float;

in vec3 vNormal;

out vec4 oFragColor;

void main () {
    oFragColor = vec4(vNormal.xyz, 1.0);
}
