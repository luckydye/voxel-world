precision mediump float;

varying vec4 vNormal;
varying vec2 vTexColor;

uniform sampler2D uDepthTexture;
uniform sampler2D uColorTexture;

uniform float ambient;

void main () {
  float visibility = 1.0;
  if ( texture2D( uDepthTexture, vNormal.xy ).z < vNormal.z ) {
      visibility = 0.5;
  }

  vec2 texCoord = vec2(vTexColor);
  vec4 color = texture2D(uColorTexture, texCoord).rgba;
  
  gl_FragColor = vec4(visibility) * color;
}
