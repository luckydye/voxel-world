import { Geometry } from "../scene/Geometry.js";
import { VertexBuffer } from "../graphics/VertexBuffer.js";

export class Terrain extends Geometry {

	createBuffer() {
		const vertArray = this.generate();
		const vertxBuffer = VertexBuffer.create(vertArray);
		vertxBuffer.type = "TRIANGLES";
		vertxBuffer.attributes = [
			{ size: 3, attribute: "aPosition" },
			{ size: 2, attribute: "aTexCoords" }
		]
		return vertxBuffer;
	}

	generate() {
		const s = 100;
		const vertArray = [
			s, 0, s, 	1, 1,
			s, 0, -s, 	1, 0, 
			-s, 0, -s, 	0, 0,

			-s, 0, -s, 	0, 0,
			-s, 0, s, 	0, 1, 
			s, 0, s, 	1, 1,
		]
		return vertArray;
	}

}