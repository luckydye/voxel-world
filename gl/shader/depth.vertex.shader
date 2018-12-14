attribute vec4 aPosition;
attribute vec2 aTextCords;

varying vec2 vTexColor;
varying vec4 vLightPos;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjMatrix;

uniform mat4 uLightModelMatrix;
uniform mat4 uLightViewMatrix;
uniform mat4 uLightProjMatrix;

void main () {
  vTexColor = aTextCords;
  vLightPos = uLightProjMatrix * uLightViewMatrix * uLightModelMatrix * aPosition;
  
  gl_Position = uProjMatrix * uViewMatrix * uModelMatrix * aPosition;
}
