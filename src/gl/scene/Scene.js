import { Camera } from './Camera.js';
import { Vec } from '../Math.js';
import { Light } from './Light.js';

let lastTick = 0;

export class Scene {

	constructor({ camera } = {}) {
		this.objects = new Set();
		
		this.lightSources = new Light({ 
            fov: 120,
            position: new Vec(0, 500, -2000),
            rotation: new Vec(55, 33, 0) 
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
		lastTick = time;
	}

}
