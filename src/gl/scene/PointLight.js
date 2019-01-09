import { Geometry } from "../scene/Geometry.js";
import { VertexBuffer } from "../graphics/VertexBuffer.js";

export class PointLight extends Geometry {

	createBuffer() {
		const vertArray = [
			this.position.x,
			this.position.y,
			this.position.z,
			this.color[0],
			this.color[1],
			this.color[2],
		]
		const vertxBuffer = VertexBuffer.create(vertArray);
		vertxBuffer.type = "POINTS";
		vertxBuffer.attributes = [
			{ size: 3, attribute: "aPosition" },
			{ size: 3, attribute: "aColor" },
		]
		return vertxBuffer;
	}

	onCreate({
		intensity = 10,
		color = [1, 1, 1]
	}) {
		this.intensity = intensity;
		this.color = color;

		this.position.y = -500;

		setInterval(() => {
			const time = performance.now();
			this.position.x = Math.sin(time / 1000) * 400;
			this.position.z = Math.cos(time / 1000) * 400;
		}, 16);
	}

}