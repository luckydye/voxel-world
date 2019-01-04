import noise from '../../../lib/perlin.js';
import { Geometry } from "../scene/Geometry.js";
import { VertexBuffer } from "../graphics/VertexBuffer.js";

export class Terrain extends Geometry {

	constructor({ drawtype }) {
		super();

		this.drawtype = drawtype;
	}

	createBuffer() {
		const vertArray = this.generate();
		const vertxBuffer = VertexBuffer.create(vertArray);
		vertxBuffer.type = this.drawtype || "TRIANGLES";
		vertxBuffer.attributes = [
			{ size: 3, attribute: "aPosition" },
			{ size: 2, attribute: "aTexCoords" }
		]
		return vertxBuffer;
	}

	generate() {
		const size = 32;
		const vertArray = [];

		const heightmap = this.heightMap(size, size);

		for(let x = 0; x < heightmap.length; x++) {
			for(let z = 0; z < heightmap[x].length; z++) {
				if(this.drawtype == "TRIANGLES") {
					try {
						const s = 25;
						const dz = 25 + (50 * z) - (50 * heightmap.length / 2);
						const dx = 25 + (50 * x) - (50 * heightmap[x].length / 2);
						const yval = heightmap[x][z];
						const topl = yval + ((yval - heightmap[x+1][z+1]) / 2);
						const topr = yval - ((yval - heightmap[x+1][z+1]) / 2);
						const botr = yval - ((yval - heightmap[x-1][z-1]) / 2);
						const botl = yval;
						const verts = [
							s + dx, botr, s + dz, 1, 1, // bot r
							s + dx, topr, -s + dz, 1, 0, // top r
							-s + dx, topl, -s + dz, 0, 0, // top l
		
							// -s + dx, heightmap[x][z], -s + dz, 0, 0,
							// -s + dx, heightmap[x-1][z], s + dz, 0, 1, 
							// s + dx, heightmap[x][z] - 100, s + dz, 1, 1,
						]
						vertArray.push(...verts);
					} catch(err) {}
				} else {
					const s = 25;
					const dz = (50 * z) - (50 * heightmap.length / 2);
					const dx = (50 * x) - (50 * heightmap[x].length / 2);
					const yval = heightmap[x][z];
					const verts = [
						s + dx, yval, s + dz, 1, 1
					]
					vertArray.push(...verts);
				}
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