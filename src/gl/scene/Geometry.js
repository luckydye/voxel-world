import { Material } from "./Material.js";
import { Transform } from "../Math.js";

export class Geometry extends Transform {

    get buffer() {
		this._buffer = this._buffer || this.createBuffer();
		return this._buffer;
	}

	constructor(args = {}) {
		const {
			material = Material.DIRT,
			uv = [0, 0],
			size = 100
		} = args;
		super(args);
		
		this.size = size;
		this.mat = material;
		this.uv = uv;
	}

	createBuffer() { }
}
