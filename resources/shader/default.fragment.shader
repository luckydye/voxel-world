precision mediump float;

varying vec3 vColor;
varying vec4 vPos;

void main () {
  vec4 color = vec4(0, 0, 0, 1.0);

  if(vPos.x == 0.0) {
    color.r = 0.5;
  } else if(vPos.z == 0.0) {
    color.b = 0.5;
  } else {
    color = vec4(vColor, 1.0);
  }

  gl_FragColor = color;
}
