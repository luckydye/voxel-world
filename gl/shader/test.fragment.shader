precision mediump float;

varying vec2 vTexCoords;
varying vec4 vVertexLightPos;

uniform sampler2D uDepthTexture;
uniform sampler2D uColorTexture;

uniform float ambient;

bool in_shadow(void) {
  vec3 vertex_relative_to_light = vVertexLightPos.xyz / vVertexLightPos.w;
  vertex_relative_to_light = vertex_relative_to_light * 0.5 + 0.5;

  vec4 shadowmap_color = texture2D(uDepthTexture, vertex_relative_to_light.xy);
  float shadowmap_distance = shadowmap_color.r;

  if(vertex_relative_to_light.z <= shadowmap_distance + 0.000040) {
    return false;
  } else {
    return true;
  }
}

void main () {

  float light = 1.0;

  if(in_shadow()) {
    light = 0.5;
  }

  vec4 color = texture2D(uColorTexture, vTexCoords).rgba;
  gl_FragColor = color * ambient * light;
}
