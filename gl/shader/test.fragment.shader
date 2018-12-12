precision mediump float;

varying vec2 vTexColor;
varying vec3 vFragCoord;

uniform sampler2D uSampler;
uniform float ambient;

void main () {
  vec2 texcoord = vec2(vTexColor);
  gl_FragColor = texture2D(uSampler, texcoord) * ambient;
}
