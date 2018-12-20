#version 300 es
precision mediump float;

in vec2 texCoords;

uniform sampler2D colorBuffer;
uniform sampler2D depthBuffer;
uniform sampler2D normalBuffer;

uniform float aspectRatio;

out vec4 oFragColor;

void main() {
  vec4 color = texture(colorBuffer, texCoords);
  vec4 depth = texture(depthBuffer, texCoords);
  vec4 normal = texture(normalBuffer, texCoords);

  oFragColor = color / vec4(max(depth.r, 0.4));
}
