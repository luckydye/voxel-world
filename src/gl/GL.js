export class GLContext {

	constructor(canvas) {
		if(!canvas) throw "GLContext: Err: no canvas";

		this.cache = {
			textures: []
		}

		this.currentShader = null;

		this.getContext(canvas);
	}

	clear() {
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
	}

	getContext(canvas) {
		const ctxtOpts = { alpha: false };
		
		this.canvas = canvas;
		this.gl = canvas.getContext("webgl2", ctxtOpts) || 
				  canvas.getContext("webgl", ctxtOpts);

		this.gl.clearColor(0.15, 0.15, 0.15, 1);
		this.gl.enable(this.gl.DEPTH_TEST);
		this.gl.enable(this.gl.DITHER);
		// this.gl.enable(this.gl.BLEND);
		// this.gl.enable(this.gl.STENCIL_TEST);
		// this.gl.stencilFunc(this.gl.LESS, 0, 1);
	}

	useShader(shader) {
		const gl = this.gl;
		gl.useProgram(shader.program);
		shader.setUniforms(gl);
		this.currentShader = shader;
	}

	useTexture(uniformStr, type, slot) {
		this.gl.activeTexture(this.gl["TEXTURE" + slot]);
		const texture = this.cache.textures[slot];
		this.gl.bindTexture(type, texture);
		this.gl.uniform1i(this.currentShader.uniforms[uniformStr], slot);
	}

	prepareShader(shader) {
		const gl = this.gl;
		if(shader instanceof GLShader) {

			if(shader.src) {
				shader._vertShader = this.compileShader(shader.src[0], gl.VERTEX_SHADER);
				shader._fragShader = this.compileShader(shader.src[1], gl.FRAGMENT_SHADER);
				shader.program = this.createProgram(shader._vertShader, shader._fragShader);
				shader.initialized = true;

				if(shader.program) {
					shader._uniforms = this.getUniforms(shader.program);
					shader._attributes = this.getAttributes(shader.program);
				}
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
			throw new Error(gl.getShaderInfoLog(shader));
		}

		return shader;
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

	createTexture(image, slot) {
		const gl = this.gl;

		const texture = gl.createTexture();
		gl.activeTexture(gl["TEXTURE" + slot]);
		this.cache.textures[slot] = texture;
		gl.bindTexture(gl.TEXTURE_2D, texture);

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, image.width, image.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, image);
		gl.bindTexture(gl.TEXTURE_2D, null);
		return texture;
	}

	createTextureArray(image, slot, w, h, textureCount) {
		const gl = this.gl;
		const texture = gl.createTexture();
		gl.activeTexture(gl["TEXTURE" + slot]);
		this.cache.textures[slot] = texture;
		gl.bindTexture(gl.TEXTURE_2D_ARRAY, texture);
		gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
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

	setTransformUniforms(uniforms, geo, transform) {
		const gl = this.gl;
		let modelMatrix = mat4.create();
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

	constructor({ name } = {}) {
		this.name = name;
		this.src = [];
		
		this.program = null;
		this.initialized = false;
	}

    setUniforms(gl) {
		const uniforms = this.uniforms;
		if(uniforms) {
			for(let opt in this.uniform) {
				gl.uniform1f(uniforms[opt], this.uniform[opt]);
			}
		}
    }
}