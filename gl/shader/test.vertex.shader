attribute vec4 aPosition;
attribute vec2 aTextCords;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjMatrix;

uniform mat4 uLightProjMatrix;
uniform mat4 uLightViewMatrix;

varying highp vec2 vTexCoords;
varying vec4 vVertexLightPos;


void main () {
  vTexCoords = aTextCords * 0.25;
  
  vVertexLightPos = uLightViewMatrix * uModelMatrix * aPosition;

  gl_Position = uProjMatrix * uViewMatrix * uModelMatrix * aPosition;
}
