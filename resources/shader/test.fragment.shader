#version 300 es
precision mediump float;
precision highp sampler2DArray;

in vec2 vTexCoords;

uniform sampler2D uTextureArray;
uniform float ambient;
uniform float ligthIntesity;

const float texCount = 256.0 / 16.0;

out vec4 oFragColor;

void main () {
  vec4 color = texture(uTextureArray, vTexCoords / texCount);

  // maybe fix some aliasing
  vec4 randomSpot = texture(uTextureArray, vec2(0.7, 0.7) / texCount);
  if(color.r > 0.95 && color.g > 0.95 && color.b > 0.95) {
    color = randomSpot;
  }

  oFragColor = color;
}
