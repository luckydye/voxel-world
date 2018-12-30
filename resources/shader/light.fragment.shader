#version 300 es
precision mediump float;

in vec4 vWorldPos;
in vec3 vNormal;

uniform vec3 pointLightPos;
uniform float ambient;

out vec4 oFragColor;

void main () {

  vec4 cBase = vec4(1.0, 1.0, 1.0, 1.0);
  vec3 cLight = vec3(1.0, 1.0, 1.0);

  vec3 cAmbient = ambient * cLight;

  vec3 lightDir = normalize(pointLightPos - vWorldPos.xyz);
  float diffAngle = max(dot(vNormal, lightDir), 0.0);
  float diffuse = 0.5;

  vec3 cDiffuse = diffAngle * cLight * diffuse * 2.0;

  vec3 color = (cAmbient + cDiffuse) * cBase.rgb;
  oFragColor = vec4(color, 1.0);
}
