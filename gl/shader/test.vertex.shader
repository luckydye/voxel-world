varying vec2 vTexColor;

attribute vec4 aPosition;
attribute vec2 aTextCords;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjMatrix;

void main () {
  vTexColor = aTextCords;
  gl_Position = uProjMatrix * uViewMatrix * uModelMatrix * aPosition;
}

