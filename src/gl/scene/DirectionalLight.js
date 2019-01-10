import { Camera } from "./Camera.js";

export class DirectionalLight extends Camera {
	
	get isLight() { return true; }

	constructor(...args) {
		super(...args);

		this.projViewMatrix = mat4.create();

		mat4.multiply(this.projViewMatrix, this.projMatrix, this.viewMatrix);
	}

}
