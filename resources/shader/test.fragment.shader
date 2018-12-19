#version 300 es

precision mediump float;

in vec2 vTexCoords;
in vec4 vPos;

uniform sampler2D uTexture;
uniform sampler2D depthTexture;

const float texCount = 256.0 / 16.0;
const float fogDensity = 300.0;

out vec4 oFragColor;

void main () {
  vec4 colorBuffer = texture(uTexture, vTexCoords / texCount);
  vec4 depthBuffer = texture(depthTexture, vPos.xy);
  
  // float depth = min((vPos.z) / fogDensity, 0.8);
  oFragColor = colorBuffer + depthBuffer;
}
