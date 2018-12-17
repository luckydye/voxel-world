#version 300 es
precision mediump float;
precision highp sampler2DArray;

in vec2 vTexCoords;

uniform sampler2D uTextureArray;
uniform float ambient;
uniform float ligthIntesity;

out vec4 oFragColor;

void main () {
  vec4 color = texture(uTextureArray, vTexCoords / 8.0);

  oFragColor = vec4(color.rgb * 0.9, 1);
}
