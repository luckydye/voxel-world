#version 300 es

in vec4 aPosition;
in vec2 aTextCords;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjMatrix;

out vec2 vTextCords;
out vec4 vPos;

void main () {
  gl_Position = uProjMatrix * uViewMatrix * uModelMatrix * aPosition;
  vTextCords = aTextCords;
  vPos = gl_Position;
}
