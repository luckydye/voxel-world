import './libs/gl-matrix.js';
import { Scene } from './Scene.js';
import DefaultShader from './shader/DefaultShader.js';

let nextFrame, 
	currFrame,
	gl, 
	lastFrame;

let shaderPrograms = [];
let shaderTextures = new Map();

function gridbufferdata(s = 15) {
	const dataArray = [];

	for(let x = 0; x < s-1; x++) {
		for(let y = 0; y < s-1; y++) {
			const w = 600;
			const h = 600;
	
			dataArray.push(...[
				x * w, 0, y * h, 0.25, 0.25, 0.25,
				x * w, 0, y * -h, 0.25, 0.25, 0.25,
				x * w, 0, y * -h, 0.25, 0.25, 0.25,
				x * -w, 0, y * -h, 0.25, 0.25, 0.25,
				x * -w, 0, y * -h, 0.25, 0.25, 0.25,
				x * -w, 0, y * h, 0.25, 0.25, 0.25,
				x * -w, 0, y * h, 0.25, 0.25, 0.25,
				x * w, 0, y * h, 0.25, 0.25, 0.25,
			])
		}
	}

	return {
		type: "LINES",
		elements: 6,
		vertecies: new Float32Array(dataArray),
		attributes: [
			{ size: 3, attribute: "aPosition" },
			{ size: 3, attribute: "aColor" }
		]
	}
}

export class Renderer {

	setScene(scene) {
		this.scene = scene;
		this.scene.camera.controls(this.canvas);
		this.draw(gl);
	}

    constructor(canvas) {
		if(!canvas) throw "Err: no canvas";

		this.canvas = canvas;
		this.clearColor = [0, 0, 0, 1.0];
		
		this.modelMatrix = mat4.create();
		this.projMatrix = mat4.create();
		this.viewMatrix = mat4.create();

		this.updated = false;

		this.initGl();

		this.gridBuffer = gridbufferdata();
	}

	initGl() {
		gl = this.canvas.getContext("webgl2") || this.canvas.getContext("webgl");
		gl.clearColor(...this.clearColor);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.enable(gl.DEPTH_TEST);

		this.defaultShader = new DefaultShader();
		this.setScene(new Scene());
	}

	draw(gl) {
		if(!this.scene) return;

		const objects = this.scene.objects;
		const camera = this.scene.camera;
		const renderer = this;

		if(nextFrame) {
			cancelAnimationFrame(nextFrame);
		}

		function drawGrid() {
			const shader = renderer.defaultShader;
			if(shader.initialized) {
				gl.useProgram(shader.program);
				const count = Renderer.setBuffersAndAttributes(gl, shader.attributes, renderer.gridBuffer);
				renderer.setProgramUniforms(gl, shader.uniforms, camera);
				gl.drawArrays(gl.LINES, 0, count);
			} else {
				shader.cache(gl);
			}
		}

		function drawScene() {
			nextFrame = requestAnimationFrame(drawScene);
			currFrame = performance.now();

			gl.clear(gl.DEPTH_BUFFER_BIT);

			drawGrid();

			for(let obj of objects) {
				renderer.drawGeo(obj, camera);
			}

			lastFrame = currFrame;
		}
		drawScene();
	}

	drawGeo(obj, camera) {
		const buffer = obj.buffer;
		if(buffer) {
			const shader = obj.shader;

			let currentProgram = null;

			if(shader.initialized) {
				currentProgram = shader.program;
				gl.useProgram(currentProgram);
			} else if(shader) {
				shader.cache(gl);
			}

			if(currentProgram && shader.texture) {
				const bufferinfo = Renderer.setBuffersAndAttributes(gl, shader.attributes, buffer);

				shader.setUniforms(gl);
				this.setProgramUniforms(gl, shader.uniforms, camera, {
					translate: { x: obj.position.x, y: obj.position.y, z: obj.position.z },
					rotation: { x: obj.rotation.x, y: obj.rotation.y, z: obj.rotation.z }
				});
				
				gl.bindTexture(gl.TEXTURE_2D, shader.texture);

				gl.drawArrays(gl[buffer.type], 0, bufferinfo);
			}
		}
	}

	updatePerspective(camera, translate, rotation) {
		const modelMatrix = this.modelMatrix;
		const projMatrix = this.projMatrix;
		const viewMatrix = this.viewMatrix;
	
		mat4.perspective(projMatrix, Math.PI / 180 * camera.fov, gl.canvas.width / gl.canvas.height, camera.nearplane, camera.farplane);
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
		
		mat4.identity(modelMatrix);
		
		mat4.translate(modelMatrix, modelMatrix, vec3.fromValues(
			translate.x,
			- translate.y,
			translate.z,
		));
		mat4.rotateX(modelMatrix, modelMatrix, Math.PI / 180 * rotation.x);
		mat4.rotateY(modelMatrix, modelMatrix, Math.PI / 180 * rotation.y);
		mat4.rotateZ(modelMatrix, modelMatrix, Math.PI / 180 * rotation.z);
	}

	setProgramUniforms(gl, uniforms, camera, {
		translate = { x: 0, y: 0, z: 0, },
		rotation = { x: 0, y: 0, z: 0, }
	} = {}) {
		this.updatePerspective(camera, translate, rotation);

		gl.uniformMatrix4fv(uniforms.uModelMatrix, false, this.modelMatrix);
		gl.uniformMatrix4fv(uniforms.uProjMatrix, false, this.projMatrix);
		gl.uniformMatrix4fv(uniforms.uViewMatrix, false, this.viewMatrix);
	}

	// static webgl functions
	
	static setBuffersAndAttributes(gl, attributes, bufferInfo) {
		const elements = bufferInfo.elements;
		const bpe = bufferInfo.vertecies.BYTES_PER_ELEMENT;
		let newbuffer = false;
		
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
	
		return bufferInfo.vertecies.length / elements;
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

	static createTexture(gl, image) {
		const texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, image.width, image.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, image);
		
		function isPowerOf2(value) {
			return (value & (value - 1)) == 0;
		}

		if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
			gl.generateMipmap(gl.TEXTURE_2D);
		} else {
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		}

		// cache textures and reuse them?
		shaderTextures.set(image.src, texture);

		return texture;
	}

	static createProgram(gl, vertShader, fragShader) {
		const program = gl.createProgram();
		gl.attachShader(program, vertShader);
		gl.attachShader(program, fragShader);
		gl.linkProgram(program);
	
		if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			throw new Error(gl.getProgramInfoLog(program));
		}

		shaderPrograms.push(program);
	
		return program;
	}
}
