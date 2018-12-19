#version 300 es
precision mediump float;

in vec4 vPos;

out vec4 oFragColor;

void main () {
  vec4 color = vec4(0, 0, 0, 1.0);

  if(vPos.x == 0.0) {
    color.r = 0.5;
  } else if(vPos.z == 0.0) {
    color.b = 0.5;
  } else {
    color = vec4(0.2, 0.2, 0.2, 1.0);
  }

  oFragColor = color;
}
