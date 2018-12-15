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
		nearplane = 0.25,
		position = new Vec(),
		rotation = new Vec(),
	} = {}) {
		
		this.scale = scale;
		this.fov = fov;
		this.farplane = farplane;
		this.nearplane = nearplane;

		this.position = position;
		this.rotation = rotation;
		this.lookAt = new Vec(0, 0, 0);

		this.updated = false;

		this.projMatrix = mat4.create();
		this.viewMatrix = mat4.create();

		this.update();
	}

	zoom(dir) {
		this.position.z += 1200 * dir;
	}

	update() {
		const projMatrix = this.projMatrix;
		const viewMatrix = this.viewMatrix;
		const camera = this;

		mat4.perspective(projMatrix, Math.PI / 180 * camera.fov, 1, camera.nearplane, camera.farplane);
		mat4.lookAt(
			viewMatrix, 
			vec3.fromValues(0, 0, 0),
			vec3.fromValues(camera.lookAt.x, camera.lookAt.y, camera.lookAt.z), 
			vec3.fromValues(0, 1, 0)
		);

		mat4.scale(viewMatrix, viewMatrix, vec3.fromValues(
			camera.scale, 
			camera.scale, 
			camera.scale,
		));

		mat4.translate(viewMatrix, viewMatrix, vec3.fromValues(
			camera.position.x,
			-camera.position.y,
			camera.position.z,
		));

		mat4.rotateX(viewMatrix, viewMatrix, Math.PI / 180 * camera.rotation.x);
		mat4.rotateY(viewMatrix, viewMatrix, Math.PI / 180 * camera.rotation.y);

		this.updated = false;
	}

	controls(element) {
		let moving = false;
		let lastEvent = null;
		const viewport = document.body;

		element.addEventListener("mousedown", e => {
			moving = true;
			this.update();
		})

		window.addEventListener("mouseup", e => {
			moving = false;
			viewport.style.cursor = "default";
			this.update();
		})

		element.addEventListener("wheel", e => {
			this.position.z += -e.deltaY * 5;
			this.update();
		})

		window.addEventListener("mousemove", e => {
			if(moving && lastEvent) {
				if(isMouseButton(e) == 2) {
					this.position.x += (e.x - lastEvent.x) / element.width * Math.abs(this.position.z);
					this.position.y += (e.y - lastEvent.y) / element.width * Math.abs(this.position.z);
					viewport.style.cursor = "move";
				} else if(isMouseButton(e) == 1) {
					this.rotation.y += (e.x - lastEvent.x) / element.width * 100;
					this.rotation.x += (e.y - lastEvent.y) / element.width * 100;
					viewport.style.cursor = "grabbing";
				}
				this.update();
			}
			lastEvent = e;
		})
	}
}
