export class Geometry {

    get buffer() {
		this._buffer = this._buffer || this.createBuffer();
		return this._buffer;
	}

	constructor({
		position = {x: 0, y: -300, z: 0},
		rotation = {x: 0, y: 0, z: 0},
		scale = 1,
		shader = null
	} = {}) {
		this.position = position;
		this.rotation = rotation;
		this.scale = scale;
		this.size = 300;
		this.shader = shader;
	}

	createBuffer() { }

	assignShader(shader) {
		this.shader = shader;
	}
}
