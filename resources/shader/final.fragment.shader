#version 300 es
precision mediump float;

in vec2 texCoord;

uniform sampler2D normalBuffer;
uniform sampler2D colorBuffer;
uniform sampler2D lightBuffer;
uniform sampler2D aoBuffer;

out vec4 oFragColor;

void main(void)
{
	vec4 normal = texture(normalBuffer, texCoord);
	vec4 color = texture(colorBuffer, texCoord);
	vec4 light = texture(lightBuffer, texCoord);
	vec4 ao = texture(aoBuffer, texCoord);

	oFragColor = color * light;
}