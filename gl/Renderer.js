import '../lib/gl-matrix.js';
import { Scene } from './scene/Scene.js';
import { Grid } from './geo/Grid.js';
import { Cube } from './geo/Cube.js';
import { GLContext } from './GL.js';
import DefaultShader from './shader/DefaultShader.js';
import TestShader from './shader/TestShader.js';

let nextFrame,
	currFrame,
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
			new DefaultShader(),
			new TestShader(),
		];

		this.renderpasses = [
			// new RenderPass("depth"),
		];

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

		this.scene = scene;
		this.scene.camera.controls(this.canvas);
		this.scene.clear();
		this.draw();
	}

	draw() {
		if(!this.scene) return;

		if(nextFrame) {
			cancelAnimationFrame(nextFrame);
		}
		
		nextFrame = requestAnimationFrame((ms) => {
			this.time = ms;
			this.draw();
		});

		currFrame = this.time;
		statistics.fps = Math.floor(1000 / (currFrame - lastFrame));
		
		this.clear();

		this.useShader(this.shaders[1]);
		this.drawScene(this.scene, this.shaders[1]);

		this.useShader(this.shaders[0]);
		this.drawGrid();
		
		lastFrame = currFrame;
	}

	drawGrid() {
		for(let obj of this.scene.objects) {
			if(obj instanceof Grid) {
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

	drawScene(scene, shader) {
		const gl = this.gl;

		const camera = scene.camera;
		const objects = scene.objects;

		const vertxBuffer = scene.vertexBuffer;
		const vertArray = [];

		statistics.vertecies = 0;

		if(!camera.updated) {
			camera.updated = true;

			gl.uniformMatrix4fv(shader.uniforms.uProjMatrix, false, camera.projMatrix);
			gl.uniformMatrix4fv(shader.uniforms.uViewMatrix, false, camera.viewMatrix);
		}

		for(let obj of objects) {
			if(obj instanceof Cube) {
				if(shader.initialized && !scene.cached && !obj.invisible) {
					vertArray.push(...obj.buffer.vertArray);
					statistics.voxels += 1;
				}
			}
		}

		if(!scene.texturemap) {
			const obj = [...objects].find(o => o instanceof Cube);
			if(obj && obj.mat) {
				const img = obj.mat.texture;
				scene.texturemap = this.createTexture(img, 0);
			}
		}

		if(!scene.cached && vertArray.length > 0) {
			vertxBuffer.vertecies = new Float32Array(vertArray);
			scene.cached = true;
		}

		if(scene.cached) {
			this.setBuffersAndAttributes(shader.attributes, vertxBuffer);
			this.setTransformUniforms(shader.uniforms);
			
			this.useTexture("uTextureArray", gl.TEXTURE_2D, 0);

			gl.drawArrays(gl.TRIANGLES, 0, vertxBuffer.vertsPerElement);
			statistics.vertecies += vertxBuffer.vertecies.length;
		}

	}
}

class RenderPass {

	constructor(id) {
		this.id = id;

		// render passes
		// 	gl.useProgram(shaders[1].program);
		// 	shaders[1].setUniforms(gl);
		// 	const bufferTexture = pass.colorBuffer(gl);
		// 	this.drawScene(gl, this.scene, shaders[1]);
		// 	pass.clear(gl);
	}

	depthBuffer(gl) {
		
	}

	colorBuffer(gl) {
		// create texture
		const h = gl.canvas.height;
		const w = gl.canvas.width;
		const texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
		
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		// assign to a framebuffer
		const fb = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

		return texture;
	}

	clear(gl) {
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.bindTexture(gl.TEXTURE_2D, null);
	}
}