#version 300 es
precision mediump float;

in vec4 vWorldPos;
in vec3 vNormal;
in vec3 vertexPos;
in mat4 vLightProjViewMatrix;

uniform sampler2D shadowDepthMap;

uniform vec3 pointLightPos;
uniform float ambient;
uniform vec3 lightColor;
uniform float lightIntensity;

out vec4 oFragColor;

float ShadowCalculation(vec4 fragPosLightSpace)
{
    vec3 projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;
    projCoords = projCoords * 0.5 + 0.5;
    float closestDepth = texture(shadowDepthMap, projCoords.xy).r;
    float currentDepth = projCoords.z;
    
    float bias = 0.00004;
    float shadow = currentDepth - bias <= closestDepth ? 1.0 : 0.0;  

    return shadow;
}

void main () {

  vec4 cBase = vec4(1.0, 1.0, 1.0, 1.0);
  vec3 cLight = vec3(1.0, 1.0, 1.0);

  vec3 cAmbient = ambient * cLight;

  vec3 lightDir = normalize(pointLightPos - vWorldPos.xyz);
  float diffAngle = max(dot(vNormal, lightDir), 0.0);
  float diffuse = 0.5;

  float intensity = pow(1.0 / (distance(vWorldPos.xyz, pointLightPos) * 0.001), 1.5) * 2.0;
  vec3 cDiffuse = cLight * diffAngle * diffuse * intensity;

  vec3 color = (cAmbient + cDiffuse) * cBase.rgb;
  oFragColor = vec4(color, 1.0);

  if(lightIntensity > 0.0) {
    oFragColor = vec4(lightColor, 1.0);
  }

  // shadow map
  vec4 fragPosLightSpace = vLightProjViewMatrix * vWorldPos;
  float shadow = ShadowCalculation(fragPosLightSpace);
  
  oFragColor *= vec4(vec3(shadow + 0.33), 1.0);
}
