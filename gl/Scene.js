import { Camera } from './Camera.js';
import { Vec } from './Math.js';
import { Grid } from './geo/Grid.js';
import { VertexBuffer } from './VertexBuffer.js';

export class Scene {

	constructor({ camera } = {}) {
		this.objects = new Set();
		
		this.camera = camera || new Camera({
			fov: 90
		});
		
		this.light = new Camera({
			fov: 65, 
			position: new Vec(0, 4500, -10000),
			rotation: new Vec(10, 23, 0),
		});

		this.clear();

		setInterval(() => {
            // this.camera.rotation.y -= 0.25;
			// this.camera.update();
			
            this.light.rotation.y -= 2;
            this.light.update();
		}, 16);
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
		this.add(new Grid(600));
	}

}
