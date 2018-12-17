import './libs/gl-matrix.js';
import { Scene } from './Scene.js';
import DefaultShader from './shader/DefaultShader.js';
import DepthShader from './shader/DepthShader.js';
import TestShader from './shader/TestShader.js';
import { Grid } from './geo/Grid.js';
import { Cube } from './geo/Cube.js';
import { Vec } from './Math.js';

let nextFrame, 
	currFrame,
	gl, 
	lastFrame;

const shaders = [
    new DefaultShader(),
    new DepthShader(),
    new TestShader(),
];

class RenderPass {

	constructor(id) {
		this.id = id;
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

export class Renderer {

	setScene(scene) {
		this.scene = scene;
		this.scene.camera.controls(this.canvas);
		this.scene.clear();
		this.draw(gl);
	}

    constructor(canvas) {
		if(!canvas) throw "Err: no canvas";

		this.renderpasses = [
			// new RenderPass("depth"),
		]

		this.statistics = {
			vertecies: 0,
			elements: 0,
		}

		window.statistics = this.statistics;

		this.canvas = canvas;

		const ctxtOpts = {
			premultipliedAlpha: false
		}

		gl = this.canvas.getContext("webgl2", ctxtOpts) || 
			 this.canvas.getContext("webgl", ctxtOpts);

		this.initGl(gl);
	}

	initGl(gl) {
		gl.clearColor(0.1, 0.1, 0.1, 1);
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
		gl.canvas.width = window.innerWidth;
		gl.canvas.height = window.innerHeight;
		this.scene.camera.update();
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	}

	draw(gl) {
		if(!this.scene) return;

		if(nextFrame) {
			cancelAnimationFrame(nextFrame);
		}

		nextFrame = requestAnimationFrame((ms) => {
			this.time = ms;
			this.draw(gl)
		});
		currFrame = performance.now();
		
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		gl.useProgram(shaders[2].program);
		shaders[2].setUniforms(gl);
		this.drawScene(gl, this.scene, shaders[2]);

		// render passes
		// for(let pass of this.renderpasses) {
		// 	gl.useProgram(shaders[1].program);
		// 	shaders[1].setUniforms(gl);
		// 	const bufferTexture = pass.colorBuffer(gl);
		// 	this.drawScene(gl, this.scene, shaders[1]);
		// 	pass.clear(gl);
		// }

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
						GL.setModelUniforms(gl, shader.uniforms);
					}
					gl.uniformMatrix4fv(shader.uniforms.uProjMatrix, false, camera.projMatrix);
					gl.uniformMatrix4fv(shader.uniforms.uViewMatrix, false, camera.viewMatrix);

					const buffer = obj.buffer;
					GL.setBuffersAndAttributes(gl, shader.attributes, buffer);
					gl.drawArrays(gl.LINES, 0, buffer.vertecies.length / buffer.elements);
					shader.done = true;

					statistics.vertecies += buffer.vertecies.length;
				} else {
					shader.cache(gl);
				}
			}
		}

		lastFrame = currFrame;
	}

	drawScene(gl, scene, shader) {

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
			} else {
				shader.cache(gl);
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
				// scene.texturemap = GL.createTextureArray(gl, 4, img, 64, 64, 0);
				scene.texturemap = GL.createTexture(gl, img, 0);
			}
		} else {
			GL.setModelUniforms(gl, shader.uniforms);
		}

		if(!scene.cached && vertArray.length > 0) {
			vertxBuffer.vertecies = new Float32Array(vertArray);
			scene.cached = true;
		}

		if(scene.cached && shader.initialized) {
			GL.setBuffersAndAttributes(gl, shader.attributes, vertxBuffer);
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, scene.texturemap);
			gl.uniform1i(shader.uniforms.uTextureArray, 0);
			gl.drawArrays(gl.TRIANGLES, 0, vertxBuffer.vertsPerElement);
			statistics.vertecies += vertxBuffer.vertecies.length;
		}
	}
}

export class GL {

	static setModelUniforms(gl, uniforms, geo, transform) {
		let modelMatrix = mat4.create();
		if(transform) {
			transform = {
				position: transform.position ||new Vec(),
				rotation: transform.rotation ||new Vec()
			}
			
			mat4.identity(modelMatrix);
			
			mat4.translate(modelMatrix, modelMatrix, vec3.fromValues(
				transform.position.x,
				- transform.position.y,
				transform.position.z,
			));
			mat4.rotateX(modelMatrix, modelMatrix, Math.PI / 180 * transform.rotation.x);
			mat4.rotateY(modelMatrix, modelMatrix, Math.PI / 180 * transform.rotation.y);
			mat4.rotateZ(modelMatrix, modelMatrix, Math.PI / 180 * transform.rotation.z);
		}
		gl.uniformMatrix4fv(uniforms["uModelMatrix"], false, modelMatrix);

		if(geo && geo.mat) {
			const defuseColor = geo.mat.defuseColor;
			gl.uniform4fv(uniforms.dcolor, defuseColor);
		}
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

	static createTexture(gl, image, slot) {
		const texture = gl.createTexture();
		gl.activeTexture(gl["TEXTURE" + slot]);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, image.width, image.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, image);
		gl.bindTexture(gl.TEXTURE_2D, null);
		return texture;
	}

	static createTextureArray(gl, textureCount, image, w, h, slot) {
		const texture = gl.createTexture();
		gl.activeTexture(gl["TEXTURE" + slot]);
		gl.bindTexture(gl.TEXTURE_2D_ARRAY, texture);
		gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texImage3D(
			gl.TEXTURE_2D_ARRAY,
			0,
			gl.RGBA,
			w,
			h,
			textureCount,
			0,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			image
		);
		gl.bindTexture(gl.TEXTURE_2D_ARRAY, null);
		return texture;
	}
}
