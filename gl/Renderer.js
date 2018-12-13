import './libs/gl-matrix.js';
import { Scene } from './Scene.js';
import DefaultShader from './shader/DefaultShader.js';
import { VertexBuffer } from './VertexBuffer.js';
import TestShader from './shader/TestShader.js';

let nextFrame, 
	currFrame,
	gl, 
	lastFrame;

let shaderPrograms = [];
let shaderTextures = new Map();

const shaders = [
    new TestShader({ texturesrc: "./images/dirt.png" }),
    // new TestShader({ texturesrc: "./images/stone.png" }),
    // new TestShader({ texturesrc: "./images/grass.png" }),
    // new TestShader({ texturesrc: "./images/lava.png" }),
];

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

		gl = this.canvas.getContext("webgl2") || this.canvas.getContext("webgl");
		this.initGl(gl);

		this.gridBuffer = VertexBuffer.GRID();
	}

	initGl(gl) {
		gl.clearColor(...this.clearColor);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.enable(gl.DEPTH_TEST);

		this.defaultShader = new DefaultShader();
		this.setScene(new Scene());
		
		window.addEventListener("resize", () => {
			this.resize();
		});
		this.resize();
	}

	resize() {
		gl.canvas.width = window.innerWidth;
		gl.canvas.height = window.innerHeight;
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	}

	draw(gl) {
		if(!this.scene) return;

		/*
		Pipeline:
			1. Collect vertecies data
			2. upload verts when needed! (chunk based?)
			3. draw for every shader on framebuffer
			4. draw buffers on canvas
		*/

		const objects = this.scene.objects;
		const camera = this.scene.camera;

		if(nextFrame) {
			cancelAnimationFrame(nextFrame);
		}

		nextFrame = requestAnimationFrame(() => this.draw(gl));
		currFrame = performance.now();

		if(!camera.updated) {
			camera.updated = true;

			for(let s of shaderStore) {
				const shader = s[1];
				if(shader.initialized) {
					gl.useProgram(shader.program);
					GL.updatePerspective(gl, shader.uniforms, camera);
				} else if(shader) {
					shader.cache(gl);
				}
			}
		}

		gl.clear(gl.DEPTH_BUFFER_BIT);

		// draw grid
		{
			const shader = this.defaultShader;
			if(shader.initialized) {
				gl.useProgram(shader.program);
				if(!shader.done) {
					GL.setProgramUniforms(gl, shader.uniforms);
				}
				GL.setBuffersAndAttributes(gl, shader.attributes, this.gridBuffer);
				gl.drawArrays(gl.LINES, 0, this.gridBuffer.vertecies.length / this.gridBuffer.elements);
				shader.done = true;
			} else {
				shader.cache(gl);
			}
		}

		const shader = shaders[0];
		if(shader && shader.initialized) {
		
			gl.useProgram(shader.program);
			if(!shader.done) {
				shader.setUniforms(gl);
			}
		
			for(let obj of objects) {
				if(shader.initialized && obj.buffer) {
					GL.setProgramUniforms(gl, shader.uniforms, {
						translate: { x: obj.position.x, y: obj.position.y, z: obj.position.z },
						rotation: { x: obj.rotation.x, y: obj.rotation.y, z: obj.rotation.z }
					});
					if(obj.mat.texture && !obj.mat.gltexture) {
						obj.mat.gltexture = GL.createTexture(gl, obj.mat.texture);
					}
					gl.bindTexture(gl.TEXTURE_2D, obj.mat.gltexture);
					GL.setBuffersAndAttributes(gl, shader.attributes, obj.buffer);
					gl.drawArrays(gl.TRIANGLES, 0, obj.buffer.vertsPerElement);
				}
			}

			shader.done = true;
		}
		

		lastFrame = currFrame;
	}
}

export class GL {

	static updatePerspective(gl, uniforms, camera) {
		gl.uniformMatrix4fv(uniforms.uProjMatrix, false, camera.projMatrix);
		gl.uniformMatrix4fv(uniforms.uViewMatrix, false, camera.viewMatrix);
	}

	static setProgramUniforms(gl, uniforms, {
		translate = { x: 0, y: 0, z: 0, },
		rotation = { x: 0, y: 0, z: 0, }
	} = {}) {
		
		const modelMatrix = mat4.create();

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
	}

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
}
