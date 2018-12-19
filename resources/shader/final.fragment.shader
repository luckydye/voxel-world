#version 300 es
precision mediump float;

in vec2 texCoord;

uniform sampler2D colorBuffer;
uniform sampler2D depthBuffer;
uniform sampler2D normalBuffer;

out vec4 oFragColor;

void main () {

  vec4 color = texture(colorBuffer, texCoord);
  vec4 depth = texture(depthBuffer, texCoord);
  vec4 normal = texture(normalBuffer, texCoord);

  oFragColor = vec4(1.0, texCoord, 0.0);
}
