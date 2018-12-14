precision mediump float;

varying vec2 vTexColor;
varying vec3 vNormal;

uniform sampler2D uSampler;
uniform float ambient;
uniform float time;

void main () {

  float anim = sin(time/1000.0) + 1.0 / 2.0;

  vec3 light = vec3(0.5, 0.3 + anim, 0.4 + (anim / 2.0));
  light = normalize(light);
  float dProd = max(0.3, dot(vNormal, light));

  vec2 texCoord = vec2(vTexColor);
  vec4 color = texture2D(uSampler, texCoord);

  if(dProd < 0.5) {
    color = (dProd + color) / 2.0;
  }

  gl_FragColor = color * ambient;
}
