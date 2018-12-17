attribute vec4 aPosition;
attribute vec2 aTextCords;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjMatrix;

uniform mat4 uLightProjMatrix;
uniform mat4 uLightViewMatrix;

varying vec2 vTexCoords;
varying vec4 vPos;


void main () {
  vec4 pos = aPosition;
  gl_Position = uProjMatrix * uViewMatrix * uModelMatrix * pos;

  vTexCoords = aTextCords;
  vPos = gl_Position;
}
