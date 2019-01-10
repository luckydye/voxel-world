import { Camera } from "./Camera.js";

export class DirectionalLight extends Camera {
	
	get isLight() { return true; }

}
