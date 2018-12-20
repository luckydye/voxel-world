#version 300 es
precision mediump float;

in vec2 texCoords;

uniform sampler2D colorBuffer;
uniform sampler2D depthBuffer;
uniform sampler2D normalBuffer;
uniform bool splitView;

out vec4 oFragColor;

void main() {
  vec4 color = texture(colorBuffer, texCoords);
  vec4 depth = texture(depthBuffer, texCoords);
  vec4 normal = texture(normalBuffer, texCoords);

  if(splitView) {
    if(texCoords.x < 0.33) {
      oFragColor = normal;
    } else if(texCoords.x < 0.66) {
      oFragColor = vec4(pow(depth.r, 100.0));
      if(oFragColor.r == 1.0) {
        discard;
      }
    } else {
      oFragColor = color / vec4(max(depth.r, 0.4));
    }
  } else {
    oFragColor = color / vec4(max(depth.r, 0.4));
  }

}
