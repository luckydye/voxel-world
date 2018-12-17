precision mediump float;

varying vec2 vTexCoords;
varying vec4 vPos;

uniform sampler2D uDepthTexture;
uniform sampler2D uColorTexture;

uniform float ambient;
uniform float ligthIntesity;
uniform vec4 dcolor;

void main () {
  
  float depth = ligthIntesity / vPos.z;
  vec4 color = texture2D(uColorTexture, vTexCoords).rgba;

  gl_FragColor = color * max(min(ambient * depth, 1.3), 0.7);
}
