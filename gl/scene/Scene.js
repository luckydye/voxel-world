import { Camera } from './Camera.js';
import { Vec } from '../Math.js';
import { Grid } from '../geo/Grid.js';
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
			{ size: 2, attribute: "aTextCords" }
		]
		this.objects.clear();
		this.add(new Grid(800));
	}

}