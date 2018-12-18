import { Geometry } from "../scene/Geometry.js";
import { VertexBuffer } from "../scene/VertexBuffer.js";

export class Grid extends Geometry {

	constructor(size) {
		super();
		this.size = size;
	}

	createBuffer() {
		const vertArray = this.generate(this.size, this.size);
		const vertxBuffer = VertexBuffer.create(vertArray);
		vertxBuffer.type = "LINES";
		vertxBuffer.attributes = [
			{ size: 3, attribute: "aPosition" },
			{ size: 3, attribute: "aColor" }
		]
		return vertxBuffer;
	}
	
	generate(w = 600, h = 600, s = 15) {
		const dataArray = [];

		for(let x = 0; x < s-1; x++) {
			for(let y = 0; y < s-1; y++) {
				dataArray.push(...[
					x * w, 0, y * h, 0.2, 0.2, 0.2,
					x * w, 0, y * -h, 0.2, 0.2, 0.2,
					x * w, 0, y * -h, 0.2, 0.2, 0.2,
					x * -w, 0, y * -h, 0.2, 0.2, 0.2,
					x * -w, 0, y * -h, 0.2, 0.2, 0.2,
					x * -w, 0, y * h, 0.2, 0.2, 0.2,
					x * -w, 0, y * h, 0.2, 0.2, 0.2,
					x * w, 0, y * h, 0.2, 0.2, 0.2,
				])
			}
		}

		return dataArray;
	}
}
