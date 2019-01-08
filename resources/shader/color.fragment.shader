#version 300 es
precision mediump float;

in vec2 vTexCoords;

uniform sampler2D colorTexture;
uniform float textureScale;

uniform vec3 diffuseColor;
uniform float reflection;
uniform float transparency;

out vec4 oFragColor;

void main() {
  if(textureScale > 1.0) {
    vec2 imageSize = vec2(textureSize(colorTexture, 0));
    vec4 textureColor = texture(colorTexture, vec2(vTexCoords) / (imageSize.x / textureScale));
    oFragColor = textureColor * vec4(diffuseColor, 1.0 - transparency);
  } else {
    oFragColor = vec4(diffuseColor, 1.0 - transparency);
  }

  if(reflection > 0.0) {
    oFragColor = vec4(diffuseColor, 1.0 - transparency);
  }
}
