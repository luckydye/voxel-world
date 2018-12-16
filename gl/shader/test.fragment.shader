precision mediump float;

varying vec2 vTexCoords;
varying vec4 vPos;

uniform sampler2D uDepthTexture;
uniform sampler2D uColorTexture;

uniform float ambient;
uniform float ligthIntesity;

void main () {
  
  float depth = ligthIntesity / vPos.z;
  vec4 color = texture2D(uColorTexture, vTexCoords).rgba;

  gl_FragColor = color * min(ambient * (depth), 1.3);
}
