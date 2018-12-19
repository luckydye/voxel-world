#version 300 es

in vec3 aPosition;
in vec2 aTexCoord;

out vec2 texCoord;

void main () {
  gl_Position = vec4(aPosition * 0.1, 0.0);
  texCoord = aTexCoord;
}