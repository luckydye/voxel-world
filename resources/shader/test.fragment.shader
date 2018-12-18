#version 300 es
precision mediump float;
precision highp sampler2DArray;

in vec2 vTexCoords;

uniform sampler2D uTextureArray;
uniform float ambient;
uniform float ligthIntesity;

out vec4 oFragColor;

void main () {
  float texCount = 512.0 / 64.0;
  vec4 color = texture(uTextureArray, vTexCoords / texCount);

  oFragColor = vec4(color.rgb, 1);
}
