#version 300 es

layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec2 aTexCoords;
layout(location = 2) in vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjMatrix;
uniform mat4 uNormalMatrix;

uniform float uTime;

out vec2 vTexCoords;
out vec4 vWorldPos;
out vec3 vNormal;

vec3 warp(vec3 p) {
  return p + 0.5 * abs(cos((uTime * 0.002)) * 40.0) * aNormal;
}

void main() {
  vec4 pos = uModelMatrix * vec4(aPosition, 1.0);

  vWorldPos = pos;
  vNormal = vec4(aNormal, 1.0).xyz;
  vTexCoords = aTexCoords;

  gl_Position = uProjMatrix * uViewMatrix * vec4(pos.xyz, 1.0);
  gl_PointSize = 2.5;
}
