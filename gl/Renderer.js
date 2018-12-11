import './libs/gl-matrix.js';
import { Scene } from './Scene.js';
import DefaultShader from './shader/DefaultShader.js';

let nextFrame, 
	currFrame,
	gl, 
	lastFrame;

function gridbufferdata(s = 8) {
	const dataArray = [];

	for(let x = 0; x < s-1; x++) {
		for(let y = 0; y < s-1; y++) {
			const w = 50;
			const h = 50;
	
			dataArray.push(...[
				x * s * w, 0, y * s * h, 0.25, 0.25, 0.25,
				x * s * w, 0, y * -s * h, 0.25, 0.25, 0.25,
				x * s * w, 0, y * -s * h, 0.25, 0.25, 0.25,
				x * -s * w, 0, y * -s * h, 0.25, 0.25, 0.25,
				x * -s * w, 0, y * -s * h, 0.25, 0.25, 0.25,
				x * -s * w, 0, y * s * h, 0.25, 0.25, 0.25,
				x * -s * w, 0, y * s * h, 0.25, 0.25, 0.25,
				x * s * w, 0, y * s * h, 0.25, 0.25, 0.25,
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

		this.initGl();

		this.defaultShader = new DefaultShader();
		
		this.setScene(new Scene());
	}

	initGl() {
		gl = this.canvas.getContext("webgl2") || this.canvas.getContext("webgl");
		gl.clearColor(...this.clearColor);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.enable(gl.DEPTH_TEST);
	}

	drawGeo(obj, camera) {
		if(obj.buffer) {
			const shader = obj.shader;
			const texture = obj.texture;

			if(!obj.texture && obj.textureimage) {
				const image = new Image();
				image.src = obj.textureimage;
				image.onload = () => {
					const texture = Renderer.createTexture(gl, image);
					obj.texture = texture;
				}
			} else {
				gl.bindTexture(gl.TEXTURE_2D, texture);
			}

			let currentProgram = null;

			if(shader && shader.program) {
				currentProgram = shader.program;
				shader.setUniforms(gl);
				gl.useProgram(currentProgram);
			} else if(shader) {
				shader.cache(gl);
			}

			if(currentProgram) {
				this.setProgramUniforms(gl, currentProgram, camera, {
					translate: { x: obj.position.x, y: obj.position.y, z: obj.position.z },
					rotation: { x: obj.rotation.x, y: obj.rotation.y, z: obj.rotation.z }
				});

				const elements = Renderer.setBuffersAndAttributes(gl, currentProgram, obj.buffer);
				gl.drawArrays(gl[obj.buffer.type], 0, elements);
			}
		}
	}

	draw(gl) {
		if(!this.scene) return;

		const objects = this.scene.objects;
		const camera = this.scene.camera;
		const renderer = this;

		if(nextFrame) {
			cancelAnimationFrame(nextFrame);
		}

		function draw() {
			nextFrame = requestAnimationFrame(draw);
			currFrame = performance.now();

			const defaultShader = renderer.defaultShader;

			if(!defaultShader) return;

			gl.clear(gl.DEPTH_BUFFER_BIT);
			let currentProgram = defaultShader.program;

			if(currentProgram) {
				gl.useProgram(currentProgram);
				renderer.setProgramUniforms(gl, currentProgram, camera);
				gl.drawArrays(gl.LINES, 0, Renderer.setBuffersAndAttributes(gl, 
					currentProgram, 
					gridbufferdata()
				));
				
				for(let obj of objects) {
					renderer.drawGeo(obj, camera);
				}
			} else {
				defaultShader.cache(gl);
			}

			lastFrame = currFrame;
		}
		draw();
	}

	setProgramUniforms(gl, program, camera, {
		translate = { x: 0, y: 0, z: 0, },
		rotation = { x: 0, y: 0, z: 0, }
	} = {}) {
		const uniforms = Renderer.getUniforms(gl, program);
	
		const modelMatrix = mat4.create();
		const projMatrix = mat4.create();
		const viewMatrix = mat4.create();
	
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

		gl.uniformMatrix4fv(uniforms.uModelMatrix, false, modelMatrix);
		gl.uniformMatrix4fv(uniforms.uViewMatrix, false, viewMatrix);
		gl.uniformMatrix4fv(uniforms.uProjMatrix, false, projMatrix);
	}

	static createTexture(gl, image) {
		const texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, image.width, image.height, 0,
			gl.RGBA, gl.UNSIGNED_BYTE, image);

		gl.generateMipmap(gl.TEXTURE_2D);

		return texture;
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
	
	static setBuffersAndAttributes(gl, program, bufferInfo) {
		const attributes = Renderer.getAttributes(gl, program);
	
		const elements = bufferInfo.elements;
		const bpe = bufferInfo.vertecies.BYTES_PER_ELEMENT;
		const buffer = gl.createBuffer();
	
		if (!buffer) throw new Error('Failed to create buffer.');
	
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, bufferInfo.vertecies, gl.STATIC_DRAW);
	
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
}
