#version 300 es
precision mediump float;

in vec3 vNormal;

out vec4 oFragColor;

void main () {
    oFragColor = vec4(vNormal.xyz / 2.0 + 0.5, 1.0);
}
