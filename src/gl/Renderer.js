import { Scene } from './scene/Scene.js';
import { Grid } from './geo/Grid.js';
import { Cube } from './geo/Cube.js';
import { GLContext } from './GL.js';
import TestShader from './shader/TestShader.js';
import DepthShader from './shader/DepthShader.js';

let nextFrame,
	lastFrame;

const statistics = {
	vertecies: 0,
	voxels: 0,
};
window.statistics = statistics;

export class Renderer extends GLContext {

    constructor(canvas) {
		super(canvas);

		this.shaders = [
			new DepthShader(),
			new TestShader(),
		];

		this.renderTargets = [
			'depth'
		]

		this.setScene(new Scene());
		
		window.addEventListener("resize", () => {
			this.setResolution(window.innerWidth, window.innerHeight);
		});
		this.setResolution(window.innerWidth, window.innerHeight);
	}

	setResolution(w, h) {
		this.gl.canvas.width = w;
		this.gl.canvas.height = h;
		this.gl.viewport(0, 0, w, h);
		this.scene.camera.update();
	}

	setScene(scene) {
		for(let shader of this.shaders) {
			this.prepareShader(shader);
		}

		for(let t in this.renderTargets) {
			const target = this.renderTargets[t];
			this.createFramebuffer(target);
		}

		this.scene = scene;
		this.scene.camera.controls(this.canvas);
		this.scene.clear();
		if(nextFrame) {
			cancelAnimationFrame(nextFrame);
		}

		this.draw();
	}

	draw() {
		if(!this.scene) return;
		
		nextFrame = requestAnimationFrame((ms) => {
			this.time = ms;
			statistics.fps = Math.floor(1000 / (this.time - lastFrame));
			statistics.passes = 0;
			this.draw();
		});

		for(let t in this.renderTargets) {
			const target = this.renderTargets[t];
			this.useFramebuffer(target);

			this.clear();

			this.useShader(this.shaders[t]);
			this.drawScene(this.scene);

			this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
			this.gl.bindTexture(this.gl.TEXTURE_2D, null);
		}
		
		this.clear();
		this.useShader(this.shaders[1]);

		for(let t in this.renderTargets) {
			const target = this.renderTargets[t];
			const tex = this.getBufferTexture(target);
			this.useTexture(tex, target + "Texture", 1);
		}

		this.drawScene(this.scene);

		lastFrame = this.time;
	}

	drawScene(scene) {
		const camera = scene.camera;
		const objects = scene.objects;
		const shader = this.currentShader;

		const vertxBuffer = scene.vertexBuffer;
		const vertArray = [];

		statistics.vertecies = 0;

		this.gl.uniformMatrix4fv(shader.uniforms.uProjMatrix, false, camera.projMatrix);
		this.gl.uniformMatrix4fv(shader.uniforms.uViewMatrix, false, camera.viewMatrix);

		for(let obj of objects) {
			if(obj instanceof Cube) {
				if(!scene.cached && !obj.invisible) {
					vertArray.push(...obj.buffer.vertArray);
					statistics.voxels += 1;
				}
			}

			if(!scene.texturemap) {
				if(obj && obj.mat) {
					const img = obj.mat.texture;
					scene.texturemap = this.createTexture(img);
				}
			}
		}

		if(!scene.cached && vertArray.length > 0) {
			vertxBuffer.vertecies = new Float32Array(vertArray);
			scene.cached = true;
		}

		if(scene.cached) {
			this.setBuffersAndAttributes(shader.attributes, vertxBuffer);
			this.setTransformUniforms(shader.uniforms);

			this.useTexture(scene.texturemap, "uTexture", 0);

			this.gl.drawArrays(this.gl.TRIANGLES, 0, vertxBuffer.vertsPerElement);
			
			statistics.passes++;
			statistics.vertecies += vertxBuffer.vertecies.length;
		}
	}

	drawGrid() {
		for(let obj of this.scene.objects) {
			if(obj instanceof Grid) {
				this.useShader(this.shaders[1]);

				const gl = this.gl;
				const shader = this.currentShader;
				const camera = this.scene.camera;

				const buffer = obj.buffer;
				gl.uniformMatrix4fv(shader.uniforms.uProjMatrix, false, camera.projMatrix);
				gl.uniformMatrix4fv(shader.uniforms.uViewMatrix, false, camera.viewMatrix);

				this.setBuffersAndAttributes(shader.attributes, buffer);
				gl.drawArrays(gl.LINES, 0, buffer.vertecies.length / buffer.elements);

				statistics.gridVerts = buffer.vertecies.length;

				statistics.vertecies += buffer.vertecies.length;
			}
		}
	}
}
