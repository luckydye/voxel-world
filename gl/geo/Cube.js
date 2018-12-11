import { Geometry } from "../Geometry.js";

export class Cube extends Geometry {
	get buffer() {
		return cubebufferdata(this.size, this.size);
	}
}

function cubebufferdata(w = 300, h = 300, s = 1) {
	return {
		type: "TRIANGLES",
		elements: 5,
		vertecies: new Float32Array([
		 // x      y      z          u  v //
			s * w, 0 + s * w, s * h, 1, 1,
			s * w, 0 + s * w, -s * h, 1, 0,
			-s * w, 0 + s * w, -s * h, 0, 0,
			s * w, 0 + s * w, s * h, 1, 1,
			-s * w, 0 + s * w, -s * h, 0, 0,
			-s * w, 0 + s * w, s * h, 0, 1,

			s * w, 0 - s * w, s * h, 1, 1,
			s * w, 0 - s * w, -s * h, 1, 0,
			-s * w, 0 - s * w, -s * h, 0, 0,
			s * w, 0 - s * w, s * h, 1, 1,
			-s * w, 0 - s * w, -s * h, 0, 0,
			-s * w, 0 - s * w, s * h, 0, 1,

			s * w, s * h, 0 + s * w, 1, 1,
			s * w, -s * h, 0 + s * w, 1, 0,
			-s * w, -s * h, 0 + s * w, 0, 0,
			s * w, s * h, 0 + s * w, 1, 1,
			-s * w, -s * h, 0 + s * w, 0, 0,
			-s * w, s * h, 0 + s * w, 0, 1,

			s * w, s * h, 0 - s * w, 1, 1,
			s * w, -s * h, 0 - s * w, 1, 0,
			-s * w, -s * h, 0 - s * w, 0, 0,
			s * w, s * h, 0 - s * w, 1, 1,
			-s * w, -s * h, 0 - s * w, 0, 0,
			-s * w, s * h, 0 - s * w, 0, 1,

			0 + s * w, s * w, s * h, 1, 1,
			0 + s * w, s * w, -s * h, 1, 0,
			0 + s * w, -s * w, -s * h, 0, 0,
			0 + s * w, s * w, s * h, 1, 1,
			0 + s * w, -s * w, -s * h, 0, 0,
			0 + s * w, -s * w, s * h, 0, 1,

			0 - s * w, s * w, s * h, 1, 1,
			0 - s * w, s * w, -s * h, 1, 0,
			0 - s * w, -s * w, -s * h, 0, 0,
			0 - s * w, s * w, s * h, 1, 1,
			0 - s * w, -s * w, -s * h, 0, 0,
			0 - s * w, -s * w, s * h, 0, 1,
		]),
		attributes: [
			{ size: 3, attribute: "aPosition" },
			{ size: 2, attribute: "aTextCords" }
		]
	}
}
