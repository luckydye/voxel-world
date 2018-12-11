import { Vec } from './Math.js';

function isMouseButton(e) {
	let mbutton;
	if(e.button != null) {
		if(e.buttons == 4) {
			mbutton = 2;
		} else {
			mbutton = e.buttons;
		}
	} else {
		mbutton = e.which;
	}
	return mbutton;
}

export class Camera {

	constructor({
		fov = 50,
		scale = 0.004,
		farplane = 200,
		nearplane = 0.25
	} = {}) {
		this.scale = scale;
		this.fov = fov;
		this.farplane = farplane;
		this.nearplane = nearplane;

		this.position = new Vec(0, 3000, -10000);
		this.rotation = new Vec(15, 0, 0);
		this.lookAt = new Vec(0, 0, 0);
	}

	zoom(dir) {
		this.position.z += 1200 * dir;
	}

	controls(element) {
		let moving = false;
		let lastEvent = null;
		const viewport = document.body;

		element.addEventListener("mousedown", e => {
			moving = true;
		})

		window.addEventListener("mouseup", e => {
			moving = false;
			viewport.style.cursor = "default";
		})

		element.addEventListener("wheel", e => {
			this.position.z += -e.deltaY * 5;
		})

		window.addEventListener("mousemove", e => {
			if(moving && lastEvent) {
				if(isMouseButton(e) == 2) {
					this.position.x += (e.x - lastEvent.x) / element.height * Math.abs(this.position.z);
					this.position.y += (e.y - lastEvent.y) / element.height * Math.abs(this.position.z);
					viewport.style.cursor = "move";
				} else if(isMouseButton(e) == 1) {
					this.rotation.y += (e.x - lastEvent.x) / element.width * 100;
					this.rotation.x += (e.y - lastEvent.y) / element.width * 100;
					viewport.style.cursor = "grabbing";
				}
			}
			lastEvent = e;
		})
	}
}
