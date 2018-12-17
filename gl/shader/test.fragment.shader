#version 300 es
precision mediump float;
precision highp sampler2DArray;

in vec2 vTexCoords;

uniform sampler2D uTextureArray;
uniform float ambient;
uniform float ligthIntesity;
uniform vec4 dcolor;

out vec4 oFragColor;

void main () {
  vec4 color = texture(uTextureArray, vTexCoords / 8.0);

  oFragColor = (gl_FragCoord.z / 2.0) * color;
}
