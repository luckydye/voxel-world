precision mediump float;

varying vec4 vLightPos;

void main () {
  float lightIntensity = 6.0;
  vec3 projCoord = lightIntensity / vLightPos.xyz;
  float depth = projCoord.z;

  gl_FragColor = vec4(depth, depth, depth, 1.0);
}