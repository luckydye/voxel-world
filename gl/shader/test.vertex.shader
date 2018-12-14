attribute vec4 aPosition;
attribute vec2 aTextCords;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjMatrix;

varying vec2 vTexColor;
varying vec3 vNormal;

void main () {
  vTexColor = aTextCords;
  gl_Position = uProjMatrix * uViewMatrix * uModelMatrix * aPosition;
  vNormal = (uModelMatrix * aPosition).xyz;
}
