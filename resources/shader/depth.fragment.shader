precision mediump float;

varying vec4 vLightPos;
varying vec4 vFPos;

void main () {
  float ligthIntesity = 20.0;
  float depth = vFPos.z;
  depth = ligthIntesity / depth;

  gl_FragColor = vec4(depth, depth, depth, 1.0);
}