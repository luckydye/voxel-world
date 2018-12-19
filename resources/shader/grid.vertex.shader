#version 300 es

layout(location = 0) in vec3 aPosition;

uniform mat4 uViewMatrix;
uniform mat4 uProjMatrix;

out vec4 vPos;

void main () {
  gl_Position = uProjMatrix * uViewMatrix * vec4(aPosition, 1.0);
  vPos = vec4(aPosition, 1.0);
}
