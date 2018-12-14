attribute vec4 aPosition;
attribute vec2 aTextCords;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjMatrix;

uniform mat4 uLightProjMatrix;
uniform mat4 uLightViewMatrix;
uniform mat4 uLightModelMatrix;

varying vec2 vTexColor;
varying vec4 vNormal;

void main () {
  vTexColor = aTextCords;
  gl_Position = uProjMatrix * uViewMatrix * uModelMatrix * aPosition;

  vec3 vertPos = (uModelMatrix * aPosition).xyz;

  mat4 depthMVP = uLightModelMatrix * uLightViewMatrix * uLightProjMatrix;
  vNormal = depthMVP * vec4(vertPos, 1.0);
}
