import { Camera } from './Camera.js';
import { VertexBuffer } from './VertexBuffer.js';

export class Scene {

	constructor({ camera } = {}) {
		this.objects = new Set();
		
		this.camera = camera || new Camera({
			fov: 90
		});

		this.clear();
	}

	add(obj) {
		this.objects.add(obj);
	}

	clear() {
		this.cached = false;
		this.vertexBuffer = new VertexBuffer([]);
		this.vertexBuffer.type = "TRIANGLES";
		this.vertexBuffer.attributes = [
			{ size: 3, attribute: "aPosition" },
			{ size: 2, attribute: "aTexCoords" },
			{ size: 3, attribute: "aNormal" },
		]
		this.objects.clear();
	}

}