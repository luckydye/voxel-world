#version 300 es
precision mediump float;

in vec4 vWorldPos;
in vec3 vNormal;
in vec3 vSurfaceToLight;

out vec4 oFragColor;

void main () {

  vec3 surfaceToLightDirection = normalize(vSurfaceToLight);

  float light = dot(vNormal, surfaceToLightDirection);

  oFragColor = vec4(0.2) + pow(light, 50.0);
}
