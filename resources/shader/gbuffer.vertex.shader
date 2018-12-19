#version 300 es

in vec3 aPosition;
in vec2 aTexCoords;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjMatrix;

out vec4 worldPos;
out vec4 normalPos;
out vec2 texCoords;

void main () {
  gl_Position = uProjMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);
  worldPos = uModelMatrix * vec4(aPosition, 1.0);
  normalPos = uModelMatrix * vec4(aPosition, 1.0);
  texCoords = aTexCoords;
}
