import './libs/gl-matrix.js';
import { Scene } from './Scene.js';
import DefaultShader from './shader/DefaultShader.js';
import DepthShader from './shader/DepthShader.js';
import TestShader from './shader/TestShader.js';
import { Grid } from './geo/Grid.js';
import { Cube } from './geo/Cube.js';
import { VertexBuffer } from './VertexBuffer.js';

let nextFrame, 
	currFrame,
	gl, 
	lastFrame;

const shaders = [
    new DefaultShader(),
    new DepthShader(),
    new TestShader(),
];

export class Renderer {

	setScene(scene) {
		this.scene = scene;
		this.scene.camera.controls(this.canvas);
		this.draw(gl);
	}

    constructor(canvas) {
		if(!canvas) throw "Err: no canvas";

		this.settings = {
			shadowsEnabled: false
		}

		this.statistics = {
			vertecies: 0,
			elements: 0,
		}

		this.canvas = canvas;
		this.clearColor = [0, 0, 0, 1.0];
		
		this.modelMatrix = mat4.create();
		this.projMatrix = mat4.create();
		this.viewMatrix = mat4.create();

		window.statistics = this.statistics;

		gl = this.canvas.getContext("webgl2") || this.canvas.getContext("webgl");
		this.initGl(gl);
	}

	initGl(gl) {
		gl.clearColor(...this.clearColor);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.enable(gl.DEPTH_TEST);

		this.defaultShader = shaders[0];
		this.setScene(new Scene());
		
		window.addEventListener("resize", () => {
			this.resize();
		});
		this.resize();
	}

	resize() {
		gl.canvas.width = 1280;
		gl.canvas.height = 1280;
		gl.viewport(0, 0, 1280, 1280);
	}

	drawDepthTexture() {
		const fb = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

		// create texture
		const h = 480;
		const w = 480;
		const texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);

		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 
			0, gl.RGBA, gl.UNSIGNED_BYTE, null);
		
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		const renderBuffer = gl.createRenderbuffer()
		gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuffer)
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, w, h)
		
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderBuffer);

		return texture;
	}

	draw(gl) {
		if(!this.scene) return;

		statistics.vertecies = 0;
		statistics.elements = 0;

		/*
		Pipeline:
			1. Collect vertecies data
			2. upload verts when needed! (chunk based?)
			3. draw for every shader on framebuffer
			4. draw buffers on canvas
		*/

		const camera = this.scene.camera;

		if(nextFrame) {
			cancelAnimationFrame(nextFrame);
		}

		nextFrame = requestAnimationFrame(() => this.draw(gl));
		currFrame = performance.now();

		if(!camera.updated) {
			camera.updated = true;

			for(let shader of shaders) {
				if(shader.initialized) {
					gl.useProgram(shader.program);
					GL.updatePerspective(gl, shader.uniforms, camera);
				} else {
					shader.cache(gl);
				}
			}
		}

		gl.clear(gl.DEPTH_BUFFER_BIT);

		const enableShadows = this.settings.shadowsEnabled;

		let depthtexture;

		const objects = this.scene.objects;

		if(enableShadows) {
			// draw depth/shadow pass
			const shader = shaders[1];
			depthtexture = this.drawDepthTexture(gl);
			if(shader && shader.initialized) {
			
				gl.useProgram(shader.program);
				shader.setUniforms(gl);

				const lightSource = this.scene.light;

				GL.updatePerspective(gl, shader.uniforms, this.scene.camera);
				
				gl.uniformMatrix4fv(shader.uniforms.uLightProjMatrix, false, lightSource.projMatrix);
				gl.uniformMatrix4fv(shader.uniforms.uLightViewMatrix, false, lightSource.viewMatrix);
			
				const vertxBuffer = this.scene.vertexBuffer;
				if(this.scene.cached) {
					GL.setModelUniforms(gl, shader.uniforms);
					GL.setBuffersAndAttributes(gl, shader.attributes, vertxBuffer);
					gl.drawArrays(gl.TRIANGLES, 0, vertxBuffer.vertsPerElement);
				}

				shader.done = true;
			}
			
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);


			const u_colorTexLoc = gl.getUniformLocation(shader.program, "uColorTexture");
			const u_depthTexLoc = gl.getUniformLocation(shader.program, "uDepthTexture");
			gl.uniform1i(u_colorTexLoc, 0);
			gl.uniform1i(u_depthTexLoc, 1);

			gl.activeTexture(gl.TEXTURE1);
			gl.bindTexture(gl.TEXTURE_2D, depthtexture);

			const lightSource = this.scene.light;
			gl.uniformMatrix4fv(shader.uniforms.uLightProjMatrix, false, lightSource.projMatrix);
			gl.uniformMatrix4fv(shader.uniforms.uLightViewMatrix, false, lightSource.viewMatrix);
			
			gl.activeTexture(gl.TEXTURE0);
		}

		for(let obj of objects) {
			if(obj instanceof Grid) {
				const shader = this.defaultShader;
				if(shader.initialized) {
					gl.useProgram(shader.program);
					if(!shader.done) {
						GL.setModelUniforms(gl, shader.uniforms);
					}

					const buffer = obj.buffer;
					GL.setBuffersAndAttributes(gl, shader.attributes, buffer);
					gl.drawArrays(gl.LINES, 0, buffer.vertecies.length / buffer.elements);
					shader.done = true;

					statistics.vertecies += buffer.vertecies.length;
					statistics.elements += 1;
				}
			}
		}
		
		const shader = shaders[2];
		gl.useProgram(shader.program);
		shader.setUniforms(gl);

		const vertxBuffer = this.scene.vertexBuffer;
		const vertArray = [];

		for(let obj of objects) {

			if(obj instanceof Cube) {
				if(shader.initialized && !this.scene.cached && !obj.invisible) {
					if(obj.mat.texture && !obj.mat.gltexture) {
						obj.mat.gltexture = GL.createTexture(gl, obj.mat.texture);
						gl.bindTexture(gl.TEXTURE_2D, obj.mat.gltexture);
					}

					if(!this.scene.cached) {
						vertArray.push(...obj.buffer.vertArray);
					}

					statistics.elements += 1;
				}
			}

		}

		if(!this.scene.cached && vertArray.length > 0) {
			vertxBuffer.vertecies = new Float32Array(vertArray);
			this.scene.cached = true;
		}

		if(this.scene.cached) {
			GL.setModelUniforms(gl, shader.uniforms);
			GL.setBuffersAndAttributes(gl, shader.attributes, vertxBuffer);
			gl.drawArrays(gl.TRIANGLES, 0, vertxBuffer.vertsPerElement);
			statistics.vertecies += vertxBuffer.vertecies.length;
		}

		lastFrame = currFrame;
	}
}

export class GL {

	static updatePerspective(gl, uniforms, camera) {
		gl.uniformMatrix4fv(uniforms.uProjMatrix, false, camera.projMatrix);
		gl.uniformMatrix4fv(uniforms.uViewMatrix, false, camera.viewMatrix);
	}

	static setModelUniforms(gl, uniforms, obj, prefix = "uModelMatrix") {
		obj = obj || {
			position: { x: 0, y: 0, z: 0 },
			rotation: { x: 0, y: 0, z: 0 }
		}

		let modelMatrix;

		if(!obj.modelMatrix) {
			obj.modelMatrix = mat4.create();

			modelMatrix = obj.modelMatrix;
			
			mat4.identity(modelMatrix);
			
			mat4.translate(modelMatrix, modelMatrix, vec3.fromValues(
				obj.position.x,
				- obj.position.y,
				obj.position.z,
			));
			mat4.rotateX(modelMatrix, modelMatrix, Math.PI / 180 * obj.rotation.x);
			mat4.rotateY(modelMatrix, modelMatrix, Math.PI / 180 * obj.rotation.y);
			mat4.rotateZ(modelMatrix, modelMatrix, Math.PI / 180 * obj.rotation.z);
		}

		modelMatrix = obj.modelMatrix;

		gl.uniformMatrix4fv(uniforms[prefix], false, modelMatrix);
	}

	static setBuffersAndAttributes(gl, attributes, bufferInfo) {
		const elements = bufferInfo.elements;
		const bpe = bufferInfo.vertecies.BYTES_PER_ELEMENT;
		let newbuffer = false;

		if(bufferInfo.vertecies.length < 1) {
			return;
		}

		if(!('buffer' in bufferInfo)) {
			bufferInfo.buffer = gl.createBuffer();
			newbuffer = true;
		}
		const buffer = bufferInfo.buffer;
	
		if (!buffer) throw new Error('Failed to create buffer.');
	
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		if(newbuffer) {
			gl.bufferData(gl.ARRAY_BUFFER, bufferInfo.vertecies, gl.STATIC_DRAW);
		}
	
		let lastElementSize = 0;
	
		for(let i = 0; i < bufferInfo.attributes.length; i++) {

			gl.vertexAttribPointer(
				attributes[bufferInfo.attributes[i].attribute], 
				bufferInfo.attributes[i].size, 
				gl.FLOAT, 
				false, 
				elements * bpe, 
				lastElementSize * bpe
			);
			gl.enableVertexAttribArray(attributes[bufferInfo.attributes[i].attribute]);
	
			lastElementSize = bufferInfo.attributes[i].size;
		}
	}
	
	static getAttributes(gl, program) {
		const attributes = {};
	
		const numAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
		for (let i = 0; i < numAttributes; ++i) {
			const name = gl.getActiveAttrib(program, i).name;
			attributes[name] = gl.getAttribLocation(program, name);
		}
	
		return attributes;
	}
	
	static getUniforms(gl, program) {
		const uniforms = {};
		const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
		for (let i = 0; i < numUniforms; ++i) {
			const name = gl.getActiveUniform(program, i).name;
			uniforms[name] = gl.getUniformLocation(program, name);
		}
		return uniforms;
	}

	static compileShader(gl, src, type) {
		const shader = gl.createShader(type);
		gl.shaderSource(shader, src);
		gl.compileShader(shader);

		if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			throw new Error(gl.getShaderInfoLog(shader));
		}

		return shader;
	}

	static createProgram(gl, vertShader, fragShader) {
		const program = gl.createProgram();
		gl.attachShader(program, vertShader);
		gl.attachShader(program, fragShader);
		gl.linkProgram(program);
	
		if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			throw new Error(gl.getProgramInfoLog(program));
		}
	
		return program;
	}

	static createTexture(gl, image) {
		const texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, image.width, image.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, image);
		
		function isPowerOf2(value) {
			return (value & (value - 1)) == 0;
		}

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_LEVEL, 7);

		return texture;
	}
}
