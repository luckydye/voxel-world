import { Camera } from './Camera.js';
import { Vec } from '../Math.js';
import { DirectionalLight } from './DirectionalLight.js';

let lastTick = 0;

export class Scene {

	constructor({ camera } = {}) {
		this.objects = new Set();
		
		this.lightSources = new DirectionalLight({ 
            fov: 90,
            position: new Vec(0, 700, -3000),
			rotation: new Vec(50, 50, 0),
		});
		
		this.camera = camera || new Camera({
			fov: 90,
		});

		this.clear();
	}

	add(obj) {
		this.objects.add(obj);
	}

	clear() {
		this.objects.clear();
	}

	update() {
		const time = performance.now();
		if(options.turntable) {
			this.camera.rotation.y += 0.02 * (time - lastTick);
			this.camera.update();
		}
		if(this.lightSources) {
			this.lightSources.rotation.y += 0.02 * (time - lastTick);
			this.lightSources.update();
		}
		lastTick = time;
	}

}
