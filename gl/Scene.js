import { Camera } from './Camera.js';
import { Vec } from './Math.js';

export class Scene {

	constructor({ camera } = {}) {
		this.objects = new Set();
		
		this.camera = camera || new Camera({
			fov: 65
		});
		
		this.light = new Camera({
			fov: 50, 
			position: new Vec(0, 1500, -7000),
			rotation: new Vec(10, 23, 0),
		});

		setInterval(() => {
            this.camera.rotation.y -= 0.25;
			this.camera.update();
			
            this.light.rotation.y -= 2;
            this.light.update();
		}, 16);
	}

	add(obj) {
		this.objects.add(obj);
	}

	clear() {
		this.objects.clear();
	}

}
