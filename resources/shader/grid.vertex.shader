#version 300 es

layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec3 aColor;

uniform mat4 uViewMatrix;
uniform mat4 uProjMatrix;

out vec3 vColor;
out vec4 vPos;

void main () {
  gl_Position = uProjMatrix * uViewMatrix * vec4(aPosition, 1.0);
  vColor = aColor;
  vPos = vec4(aPosition, 1.0);
}
