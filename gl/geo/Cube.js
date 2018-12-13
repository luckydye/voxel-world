import { Geometry } from "../Geometry.js";
import { VertexBuffer } from "../VertexBuffer.js";

export class Cube extends Geometry {
	createBuffer() {
		return VertexBuffer.CUBE(this.size, this.size);
	}
}
