import { Camera } from './Camera.js';

export class Scene {

	constructor() {
		this.objects = new Set();
		
		this.camera = new Camera({
			fov: 65
		});
	}

	add(obj) {
		this.objects.add(obj);
	}

	clear() {
		this.objects.clear();
	}

}
