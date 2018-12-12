import { Geometry } from "../Geometry.js";
import { Buffer } from "../Buffer.js";

export class Cube extends Geometry {
	createBuffer() {
		return Buffer.CUBE(this.size, this.size);
	}
}
