precision mediump float;

varying vec2 vTexCoords;
varying vec4 vPos;

uniform sampler2D uDepthTexture;
uniform sampler2D uColorTexture;

uniform float ambient;
uniform float frameIndexMod4;

void main () {

  float ligthIntesity = 20.0;
  float distance = 5.0;
  
  float depth = ligthIntesity / vPos.z;
  vec4 color = texture2D(uColorTexture, vTexCoords).rgba;

  gl_FragColor = color * min(ambient * log(depth * distance), 1.3);
}
