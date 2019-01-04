import { Material } from "../graphics/Material.js";
import { Transform } from "../Math.js";

export class Geometry extends Transform {

    get buffer() {
		this._buffer = this._buffer || this.createBuffer();
		return this._buffer;
	}

	constructor(args = {}) {
		const {
			material = Material.DEFAULT,
			uv = [0, 0],
		} = args;
		super(args);

		this.mat = material;
		this.uv = uv;

		this.onCreate(args);
	}

	onCreate(arsg) { }

	createBuffer() { }
}
