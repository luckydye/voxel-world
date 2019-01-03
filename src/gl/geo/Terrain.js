import noise from '../../../lib/perlin.js';
import { Geometry } from "../scene/Geometry.js";
import { VertexBuffer } from "../graphics/VertexBuffer.js";

export class Terrain extends Geometry {

	createBuffer() {
		const vertArray = this.generate();
		const vertxBuffer = VertexBuffer.create(vertArray);
		vertxBuffer.type = "POINTS";
		vertxBuffer.attributes = [
			{ size: 3, attribute: "aPosition" },
			{ size: 2, attribute: "aTexCoords" }
		]
		return vertxBuffer;
	}

	generate() {
		const size = 50;
		const vertArray = [];

		const heightmap = this.heightMap(size, size);

		for(let x = 0; x < heightmap.length; x++) {
			for(let y = 0; y < heightmap[x].length; y++) {
				let yvalue = heightmap[x][y];
				 vertArray.push(size * (x - (size/2)), yvalue, size * (y - (size/2)), 1, 1);
			}
		}

		return vertArray;
	}

	heightMap(width, height) {
		const verts = new Array(width);
		const res = 0.025;
		const terrainheight = 1000;
		
		for(let x = 0; x <= width; x++) {
			if(!verts[x]) {
				verts[x] = new Array(height);
			}
			for(let y = 0; y <= height; y++) {
				const noiseValue = noise.perlin2(x * res, y * res) * terrainheight;
				verts[x][y] = -noiseValue;
			}
		}
		return verts;
	}

}