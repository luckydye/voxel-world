#version 300 es

in vec4 aPosition;
in vec2 aTextCords;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjMatrix;

out vec2 vTexCoords;

void main () {
  gl_Position = uProjMatrix * uViewMatrix * uModelMatrix * aPosition;
  vTexCoords = aTextCords;
}