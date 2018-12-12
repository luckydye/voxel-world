attribute vec4 aPosition;
attribute vec3 aColor;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjMatrix;

varying vec3 vColor;

void main () {
  gl_Position = uProjMatrix * uViewMatrix * uModelMatrix * aPosition;
  vColor = aColor;
}

