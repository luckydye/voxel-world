import { Vec, Transform } from '../Math.js';

export class Camera extends Transform {

	constructor(args = {}) {
		const {
			fov = 50,
			scale = 0.004,
			farplane = 350,
			nearplane = 0.025,
			controller = null,
		} = args;
		super(args);
		
		this.scale = scale;
		this.fov = fov;
		this.farplane = farplane;
		this.nearplane = nearplane;
		this.lookAt = new Vec(0, 0, 0);

		this.projMatrix = mat4.create();
		this.viewMatrix = mat4.create();

		this.updated = false;

		if(controller) {
			this.controller = new controller(this);
		}

		this.update();
	}

	zoom(dir) {
		this.position.z += -100 * Math.sign(dir);
		this.update();
	}

	update() {
		const projMatrix = this.projMatrix;
		const viewMatrix = this.viewMatrix;
		const camera = this;

		const ar = window.innerWidth / window.innerHeight;
		mat4.perspective(projMatrix, Math.PI / 180 * camera.fov, ar, camera.nearplane, camera.farplane);
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

		if(this.controller)
			this.controller.update();
	}
}
