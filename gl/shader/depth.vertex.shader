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

  float lightPower = 7.0;

  gl_Position = uProjMatrix * uViewMatrix * uModelMatrix * aPosition;
  
  vec4 lightPosition = uLightProjMatrix * uLightViewMatrix * uLightModelMatrix * aPosition;

  vec3 projCoord = lightPower / lightPosition.xyz;
  depth = projCoord.z;
}
