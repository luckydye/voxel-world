attribute vec4 aPosition;
attribute vec2 aTextCords;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjMatrix;

uniform mat4 uLightProjMatrix;
uniform mat4 uLightViewMatrix;

varying vec2 vTexCoords;
varying vec4 vVertexLightPos;

void main () {
  vTexCoords = aTextCords;
  
  vVertexLightPos = (uLightProjMatrix * uLightViewMatrix) * aPosition;

  gl_Position = uProjMatrix * uViewMatrix * uModelMatrix * aPosition;
}
