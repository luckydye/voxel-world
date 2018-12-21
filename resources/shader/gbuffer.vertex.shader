#version 300 es

layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec2 aTexCoords;
layout(location = 2) in vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjMatrix;

out vec4 worldPos;
out vec4 normalPos;
out vec2 texCoords;

void main() {
  gl_Position = uProjMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);
  worldPos = uModelMatrix * vec4(aPosition, 1.0);
  normalPos = vec4(aNormal, 1.0);
  texCoords = aTexCoords;
}
