export class Geometry {

    get buffer() {
		return null;
	}

	constructor({
		position = {x: 0, y: -300, z: 0},
		rotation = {x: 0, y: 0, z: 0},
		scale = 1,
		texture = "../empty.png"
	} = {}) {
		this.position = position;
		this.rotation = rotation;
		this.scale = scale;
		this.size = 300;
		this.textureimage = texture;

		this.shader = null;
		this.texture = null;
	}

	assignShader(shader) {
		this.shader = shader;
	}
}
