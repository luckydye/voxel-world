#version 300 es
precision mediump float;

in vec2 texCoord;

uniform sampler2D diffuseBuffer;
uniform sampler2D lightBuffer;
uniform sampler2D reflectionBuffer;

out vec4 oFragColor;

void main(void) {

	vec2 texCoords = texCoord;
	
	vec4 color = texture(diffuseBuffer, texCoords);
	vec4 light = texture(lightBuffer, texCoords);
	vec4 reflection = texture(reflectionBuffer, texCoords);

	oFragColor = color * light;

	if(color.g == 1.0 && color.r == 0.0 && color.b == 0.0) {
		oFragColor = vec4(reflection.rgb * vec3(0.2, 0.2, 1.0) + vec3(0.15, 0.15, 0.8), 1.0);
	}
}
