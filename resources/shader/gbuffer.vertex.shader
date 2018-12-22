#version 300 es

layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec2 aTexCoords;
layout(location = 2) in vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjMatrix;
uniform mat4 worldInverseTranspose;

uniform vec3 pointLightPos;

out vec4 vWorldPos;
out vec3 vNormal;
out vec3 vSurfaceToLight;
out vec2 texCoords;

void main() {
  gl_Position = uProjMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);

  texCoords = aTexCoords;

  vNormal = mat3(worldInverseTranspose) * aNormal;

  vWorldPos = uModelMatrix * vec4(aPosition, 1.0);
  vSurfaceToLight = pointLightPos - vWorldPos.xyz;
}
