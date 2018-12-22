import { Statistics } from "../Statistics.js";

export class GLContext {

	get resolution() {
		return {
			width: this._reolution[0],
			height: this._reolution[1]
		};
	}
	set resolution(vecArr) {
		this._reolution = [ w, h ] = vecArr;
	}

	constructor(canvas) {
		if(!canvas) throw "GLContext: Err: no canvas";

		this.currentShader = null;

		this.vertexArrayObjects = new Map();
		this.framebuffers = new Map();
		this.bufferTextures = new Map();

		this.fBufferResFactor = 1.0;

		this.getContext(canvas);
	}

	setResolution(res) {
		res = res || this.resolution.width;
		this._reolution = [res, res];

		Statistics.data.resolution = this._reolution;

		this.gl.canvas.width = res;
		this.gl.canvas.height = res;
		this.gl.viewport(0, 0, res, res);
	}

	clear() {
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
	}

	getContext(canvas) {
		this.canvas = canvas;

		const ctxtOpts = { alpha: false };
		this.gl = canvas.getContext("webgl2", ctxtOpts) || 
				  canvas.getContext("webgl", ctxtOpts);

		const nativeRes = Math.max(window.innerWidth, window.innerHeight);
		this.setResolution(nativeRes);

		this.gl.clearColor(0.09, 0.09, 0.09, 1);
		this.gl.enable(this.gl.DEPTH_TEST);
	}

	useShader(shader) {
		this.gl.useProgram(shader.program);
		shader.setUniforms(this.gl);
		this.currentShader = shader;
	}

	useTexture(texture, uniformStr, slot) {
		if(uniformStr && slot != null) {
			this.gl.activeTexture(this.gl["TEXTURE" + slot]);
			this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
			this.gl.uniform1i(this.currentShader.uniforms[uniformStr], slot);
		} else {
			this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
		}
	}

	useFramebuffer(name) {
		if(this.framebuffers.has(name)) {
			this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffers.get(name));
		} else {
			console.error("Err:", name, "framebuffer not found");
		}
	}

	clearFramebuffer() {
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
		this.gl.bindTexture(this.gl.TEXTURE_2D, null);
	}

	getBufferTexture(name) {
		return this.bufferTextures.get(name);
	}

	prepareShader(shader) {
		const gl = this.gl;
		if(shader instanceof GLShader) {

			if(shader.src) {
				shader._vertShader = this.compileShader(shader.src[0], gl.VERTEX_SHADER);
				shader._fragShader = this.compileShader(shader.src[1], gl.FRAGMENT_SHADER);
				shader.program = this.createProgram(shader._vertShader, shader._fragShader);

				shader._uniforms = this.getUniforms(shader.program);
				shader._attributes = this.getAttributes(shader.program);
				
				shader.initialized = true;
			}

			return shader.program;
		}
	}

	getAttributes(program) {
		const gl = this.gl;
		const attributes = {};
	
		const numAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
		for (let i = 0; i < numAttributes; ++i) {
			const name = gl.getActiveAttrib(program, i).name;
			attributes[name] = gl.getAttribLocation(program, name);
		}
	
		return attributes;
	}

	getUniforms(program) {
		const gl = this.gl;
		const uniforms = {};
		const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
		for (let i = 0; i < numUniforms; ++i) {
			const name = gl.getActiveUniform(program, i).name;
			uniforms[name] = gl.getUniformLocation(program, name);
		}
		return uniforms;
	}

	compileShader(src, type) {
		const gl = this.gl;
		const shader = gl.createShader(type);
		gl.shaderSource(shader, src);
		gl.compileShader(shader);

		if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			console.error(src);
			throw new Error(gl.getShaderInfoLog(shader));
		}

		return shader;
	}

	useVAO(name) {
		const VAO = this.vertexArrayObjects.get(name);
		if(VAO) {
			this.gl.bindVertexArray(VAO);
		} else {
			console.log("Err", "VAO not found");
		}
	}

	createVAO(name) {
		const VAO = this.gl.createVertexArray();
		this.vertexArrayObjects.set(name, VAO);
		this.gl.bindVertexArray(VAO);
	}

	createFramebuffer(name) {
		const gl = this.gl;

		const fbo = this.gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

		const renderTraget = this.createBufferTexture(this.resolution.width, this.resolution.height);
		this.useTexture(renderTraget);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, renderTraget, 0);

		const depthTexture = this.createDepthTexture(this.resolution.width, this.resolution.height);
		this.useTexture(depthTexture);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture, 0);
		
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);

		this.bufferTextures.set('depth', depthTexture);
		this.bufferTextures.set(name, renderTraget);
		this.framebuffers.set(name, fbo);
		return fbo;
	}

	createProgram(vertShader, fragShader) {
		const gl = this.gl;
		const program = gl.createProgram();
		gl.attachShader(program, vertShader);
		gl.attachShader(program, fragShader);
		gl.linkProgram(program);

		if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			throw new Error(gl.getProgramInfoLog(program));
		}
	
		return program;
	}

	createDepthTexture(w, h) {
		const gl = this.gl;

		w *= this.fBufferResFactor;
		h *= this.fBufferResFactor;

		const texture = gl.createTexture();

		gl.bindTexture(gl.TEXTURE_2D, texture);

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

		gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT24, w, h, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);

		gl.bindTexture(gl.TEXTURE_2D, null);

		return texture;
	}

	createBufferTexture(w, h) {
		const gl = this.gl;

		w *= this.fBufferResFactor;
		h *= this.fBufferResFactor;

		const texture = gl.createTexture();

		gl.bindTexture(gl.TEXTURE_2D, texture);

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

		gl.bindTexture(gl.TEXTURE_2D, null);

		return texture;
	}

	createTexture(image, w, h) {
		const gl = this.gl;

		const texture = gl.createTexture();

		gl.bindTexture(gl.TEXTURE_2D, texture);

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

		if(image) {
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, image.width, image.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, image);
		} else {
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
		}

		gl.bindTexture(gl.TEXTURE_2D, null);

		return texture;
	}

	setTransformUniforms(uniforms, geo, transform) {
		const gl = this.gl;
		let modelMatrix = mat4.create();
		this.modelMatrix = modelMatrix;
		if(transform) {
			transform = {
				position: transform.position || new Vec(),
				rotation: transform.rotation || new Vec()
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
	}

	setBuffersAndAttributes(attributes, bufferInfo) {
		const gl = this.gl;
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
	
		let lastAttrSize = 0;
	
		for(let i = 0; i < bufferInfo.attributes.length; i++) {

			gl.vertexAttribPointer(
				attributes[bufferInfo.attributes[i].attribute], 
				bufferInfo.attributes[i].size, 
				gl.FLOAT, 
				false, 
				elements * bpe, 
				lastAttrSize * bpe
			);
			gl.enableVertexAttribArray(attributes[bufferInfo.attributes[i].attribute]);
	
			lastAttrSize += bufferInfo.attributes[i].size;
		}
	}
	
}

export class GLShader {

	get vertexShader() {
		return this._vertShader;
	}

	get fragementShader() {
		return this._fragShader;
	}

	get uniforms() {
		return this._uniforms;
	}

	get attributes() {
		return this._attributes;
	}

	get uniform() {
		return {};
	}

	get src() {
		return this.constructor.source;
	}

	constructor({ name } = {}) {
		this.name = name;
		
		this.program = null;
		this.initialized = false;
	}

    setUniforms(gl) {
		const uniforms = this.uniforms;
		if(uniforms) {
			for(let opt in this.uniform) {
				const value = this.uniform[opt];
				if(opt === "integer") {
					for(let opt in this.uniform.integer) {
						gl.uniform1i(uniforms[opt], this.uniform.integer[opt]);
					}
				}
				if(Array.isArray(value)) {
					gl.uniform3fv(uniforms[opt], value);
				} else {
					gl.uniform1f(uniforms[opt], value);
				}
			}
		}
    }
}