import { Geometry } from "../scene/Geometry.js";
import { VertexBuffer } from "../scene/VertexBuffer.js";

export class Cube extends Geometry {

	get invisible() {
		return  !this.visible.TOP && 
				!this.visible.BOTTOM &&
				!this.visible.LEFT &&
				!this.visible.RIGHT &&
				!this.visible.FRONT &&
				!this.visible.BACK;
	}

	constructor(...args) {
		super(...args);

		this.vertsPerFace = 6;

		this.cached = null;

		this.visible = {
			TOP: true,
			BOTTOM: true,
			LEFT: true,
			RIGHT: true,
			FRONT: true,
			BACK: true,
		}
	}

	createBuffer() {
		let vertArray = [];
		const faces = this.faces;

		let visibleFaces = [];

		for(let key in this.visible) {
			if(this.visible[key]) {
				visibleFaces.push(key);
			}
		}

		visibleFaces.forEach(face => {
			vertArray = vertArray.concat(faces[face]);
		})

		const vertxBuffer = VertexBuffer.create(vertArray);
		vertxBuffer.type = "TRIANGLES";
		vertxBuffer.attributes = [
			{ size: 3, attribute: "aPosition" },
			{ size: 2, attribute: "aTextCords" }
		]

		return vertxBuffer;
	}

	get faces() {
		const s = 1;
		const w = 100;
		const h = 100;

		const u = this.uv[0];
		const v = this.uv[1];

		const x = this.position.x;
		const y = -this.position.y;
		const z = this.position.z;
		
		return {
			TOP: [
				s * w + x, s * w + y, s * h + z, 1 + u, 1 + v,
				s * w + x, s * w + y, -s * h + z, 1 + u, 0 + v,
				-s * w + x, s * w + y, -s * h + z, 0 + u, 0 + v,
				s * w + x, s * w + y, s * h + z, 1 + u, 1 + v,
				-s * w + x, s * w + y, -s * h + z, 0 + u, 0 + v,
				-s * w + x, s * w + y, s * h + z, 0 + u, 1 + v,
			],
			BOTTOM: [
				s * w + x, -s * w + y, s * h + z, 1 + u, 1 + v,
				s * w + x, -s * w + y, -s * h + z, 1 + u, 0 + v,
				-s * w + x, -s * w + y, -s * h + z, 0 + u, 0 + v,
				s * w + x, -s * w + y, s * h + z, 1 + u, 1 + v,
				-s * w + x, -s * w + y, -s * h + z, 0 + u, 0 + v,
				-s * w + x, -s * w + y, s * h + z, 0 + u, 1 + v,
			],
			LEFT: [
				s * w + x, s * h + y, s * w + z, 1 + u, 1 + v,
				s * w + x, -s * h + y, s * w + z, 1 + u, 0 + v,
				-s * w + x, -s * h + y, s * w + z, 0 + u, 0 + v,
				s * w + x, s * h + y, s * w + z, 1 + u, 1 + v,
				-s * w + x, -s * h + y, s * w + z, 0 + u, 0 + v,
				-s * w + x, s * h + y, s * w + z, 0 + u, 1 + v,
			],
			RIGHT: [
				s * w + x, s * h + y, -s * w + z, 1 + u, 1 + v,
				s * w + x, -s * h + y, -s * w + z, 1 + u, 0 + v,
				-s * w + x, -s * h + y, -s * w + z, 0 + u, 0 + v,
				s * w + x, s * h + y, -s * w + z, 1 + u, 1 + v,
				-s * w + x, -s * h + y, -s * w + z, 0 + u, 0 + v,
				-s * w + x, s * h + y, -s * w + z, 0 + u, 1 + v,
			],
			FRONT: [
				s * w + x, s * w + y, s * h + z, 1 + u, 1 + v,
				s * w + x, s * w + y, -s * h + z, 1 + u, 0 + v,
				s * w + x, -s * w + y, -s * h + z, 0 + u, 0 + v,
				s * w + x, s * w + y, s * h + z, 1 + u, 1 + v,
				s * w + x, -s * w + y, -s * h + z, 0 + u, 0 + v,
				s * w + x, -s * w + y, s * h + z, 0 + u, 1 + v,
			],
			BACK: [
				-s * w + x, s * w + y, s * h + z, 1 + u, 1 + v,
				-s * w + x, s * w + y, -s * h + z, 1 + u, 0 + v,
				-s * w + x, -s * w + y, -s * h + z, 0 + u, 0 + v,
				-s * w + x, s * w + y, s * h + z, 1 + u, 1 + v,
				-s * w + x, -s * w + y, -s * h + z, 0 + u, 0 + v,
				-s * w + x, -s * w + y, s * h + z, 0 + u, 1 + v,
			]
		}
	}
}
