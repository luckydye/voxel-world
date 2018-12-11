precision mediump float;

varying vec2 vTexColor;
uniform sampler2D uSampler;

void main () {
  vec2 texcoord = vec2(vTexColor);
  gl_FragColor = texture2D(uSampler, texcoord);
}
