attribute vec4 aPosition;
attribute vec2 aTextCords;

varying vec2 vTexColor;
varying float depth;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjMatrix;

uniform mat4 uLightModelMatrix;
uniform mat4 uLightViewMatrix;
uniform mat4 uLightProjMatrix;

void main () {
  vTexColor = aTextCords;

  gl_Position = uProjMatrix * uViewMatrix * uModelMatrix * aPosition;
  vec4 lightPosition = uLightProjMatrix * uLightViewMatrix * uLightModelMatrix * aPosition;

  vec3 projCoord = (lightPosition.xyz / 66.0);
  depth = projCoord.z;
}
