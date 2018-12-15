import { Geometry } from "../Geometry.js";
import { VertexBuffer } from "../VertexBuffer.js";

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
			RIGHT: false,
			FRONT: true,
			BACK: false,
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

		const sw = s * w;
		const sh = s * h;

		const u = 0;
		const v = 0;

		const x = this.position.x;
		const y = -this.position.y;
		const z = this.position.z;
		
		return {
			TOP: [
				sw +x, sw +y, sh +z, u + 1, v + 1,
				sw +x, sw +y, -sh +z, u + 1, v + 0,
				-sw +x, sw +y, -sh +z, u + 0, v + 0,
				sw +x, sw +y, sh +z, u + 1, v + 1,
				-sw +x, sw +y, -sh +z, u + 0, v + 0,
				-sw +x, sw +y, sh +z, u + 0, v + 1,
			],
			BOTTOM: [
				sw +x, sw +y, sh +z, u + 1, v + 1,
				sw +x, sw +y, -sh +z, u + 1, v + 0,
				-sw +x, sw +y, -sh +z, u + 0, v + 0,
				sw +x, sw +y, sh +z, u + 1, v + 1,
				-sw +x, sw +y, -sh +z, u + 0, v + 0,
				-sw +x, sw +y, sh +z, u + 0, v + 1,
			],
			LEFT: [
				sw +x, sh +y, sw +z, u + 1, v + 1,
				sw +x, -sh +y, sw +z, u + 1, v + 0,
				-sw +x, -sh +y, sw +z, u + 0, v + 0,
				sw +x, sh +y, sw +z, u + 1, v + 1,
				-sw +x, -sh +y, sw +z, u + 0, v + 0,
				-sw +x, sh +y, sw +z, u + 0, v + 1,
			],
			RIGHT: [
				sw +x, sh +y, sw +z, u + 1, v + 1,
				sw +x, -sh +y, sw +z, u + 1, v + 0,
				-sw +x, -sh +y, sw +z, u + 0, v + 0,
				sw +x, sh +y, sw +z, u + 1, v + 1,
				-sw +x, -sh +y, sw +z, u + 0, v + 0,
				-sw +x, sh +y, sw +z, u + 0, v + 1,
			],
			FRONT: [
				sw +x, sw +y, sh +z, u + 1, v + 1,
				sw +x, sw +y, -sh +z, u + 1, v + 0,
				sw +x, -sw +y, -sh +z, u + 0, v + 0,
				sw +x, sw +y, sh +z, u + 1, v + 1,
				sw +x, -sw +y, -sh +z, u + 0, v + 0,
				sw +x, -sw +y, sh +z, u + 0, v + 1,
			],
			BACK: [
				sw +x, sw +y, sh +z, u + 1, v + 1,
				sw +x, sw +y, -sh +z, u + 1, v + 0,
				sw +x, -sw +y, -sh +z, u + 0, v + 0,
				sw +x, sw +y, sh +z, u + 1, v + 1,
				sw +x, -sw +y, -sh +z, u + 0, v + 0,
				sw +x, -sw +y, sh +z, u + 0, v + 1,
			]
		}
	}
}
