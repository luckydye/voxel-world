import { Camera } from './Camera.js';
import { VertexBuffer } from '../graphics/VertexBuffer.js';

let lastTick = 0;

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

	update() {
		const time = performance.now();
		if(options.turntable) {
			this.camera.rotation.y += 0.02 * (time - lastTick);
			this.camera.update();
		}
		lastTick = time;
	}

}
