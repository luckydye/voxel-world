import '../lib/gl-matrix.js';
import { Scene } from './Scene.js';
import DefaultShader from './shader/DefaultShader.js';
import TestShader from './shader/TestShader.js';
import { Grid } from './geo/Grid.js';
import { Cube } from './geo/Cube.js';
import { GLContext } from './GL.js';

let gl,
 	nextFrame,
	currFrame,
	lastFrame;

const statistics = {};
window.statistics = statistics;

export class Renderer extends GLContext {

    constructor(canvas) {
		super(canvas);

		gl = this.gl;

		this.renderpasses = [
			// new RenderPass("depth"),
		]

		this.shaders = [
			new DefaultShader(),
			new TestShader(),
		];

		this.statistics = {
			vertecies: 0,
			elements: 0,
		}

		this.canvas = canvas;

		this.defaultShader = this.shaders[0];

		this.setScene(new Scene());
		
		window.addEventListener("resize", () => {
			this.resize();
		});
		this.resize();
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

	resize() {
		gl.canvas.width = window.innerWidth;
		gl.canvas.height = window.innerHeight;
		this.scene.camera.update();
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	}

	draw() {
		if(!this.scene) return;

		const gl = this.gl;

		if(nextFrame) {
			cancelAnimationFrame(nextFrame);
		}

		nextFrame = requestAnimationFrame((ms) => {
			this.time = ms;
			this.draw();
		});
		currFrame = performance.now();
		
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		gl.useProgram(this.shaders[1].program);
		this.shaders[1].setUniforms(gl);
		this.drawScene(this.scene, this.shaders[1]);

		// draw scene grid
		const objects = this.scene.objects;
		for(let obj of objects) {
			if(obj instanceof Grid) {
				// TODO: Duplication
				const shader = this.defaultShader;
				const camera = this.scene.camera;

				if(shader.initialized) {
					gl.useProgram(shader.program);
					if(!shader.done) {
						this.setModelUniforms(shader.uniforms);
					}
					gl.uniformMatrix4fv(shader.uniforms.uProjMatrix, false, camera.projMatrix);
					gl.uniformMatrix4fv(shader.uniforms.uViewMatrix, false, camera.viewMatrix);

					const buffer = obj.buffer;
					this.setBuffersAndAttributes(shader.attributes, buffer);
					gl.drawArrays(gl.LINES, 0, buffer.vertecies.length / buffer.elements);
					shader.done = true;

					statistics.vertecies += buffer.vertecies.length;
				}
			}
		}

		lastFrame = currFrame;
	}

	drawScene(scene, shader) {

		const gl = this.gl;

		statistics.vertecies = 0;

		const camera = scene.camera;
		const objects = scene.objects;

		const vertxBuffer = scene.vertexBuffer;
		const vertArray = [];

		if(!camera.updated) {
			camera.updated = true;

			if(shader.initialized) {
				gl.uniformMatrix4fv(shader.uniforms.uProjMatrix, false, camera.projMatrix);
				gl.uniformMatrix4fv(shader.uniforms.uViewMatrix, false, camera.viewMatrix);
			}
		}

		for(let obj of objects) {
			if(obj instanceof Cube) {
				if(shader.initialized && !scene.cached && !obj.invisible) {
					vertArray.push(...obj.buffer.vertArray);
					statistics.elements += 1;
				}
			}
		}

		if(!scene.texturemap) {
			const obj = [...objects].find(o => o instanceof Cube);
			if(obj && obj.mat) {
				const img = obj.mat.texture;
				scene.texturemap = this.createTexture(img, 0);
			}
		} else {
			this.setModelUniforms(shader.uniforms);
		}

		if(!scene.cached && vertArray.length > 0) {
			vertxBuffer.vertecies = new Float32Array(vertArray);
			scene.cached = true;
		}

		if(scene.cached && shader.initialized) {
			this.setBuffersAndAttributes(shader.attributes, vertxBuffer);
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, scene.texturemap);
			gl.uniform1i(shader.uniforms.uTextureArray, 0);
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