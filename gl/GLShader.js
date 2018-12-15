import { GL } from "./Renderer.js";

window.shaderCache = window.shaderCache || new Map();

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
		this.program = null;
		this.src = null;
		this.name = name;

		this.initialized = false;

		this.load(this.name);
	}

    setUniforms(gl) {
		const uniforms = this.uniforms;
		if(uniforms) {
			for(let opt in this.uniform) {
				gl.uniform1f(uniforms[opt], this.uniform[opt]);
			}
		}
    }

	load(shaderName) {
		return new Promise((resolve, reject) => {
			if(shaderCache.has(shaderName)) {
				shaderCache.get(shaderName).then(data => {
					this.src = data;
				});
			} else {
				// load shaders
				const getting = Promise.all([
					fetch(`./gl/shader/${shaderName}.vertex.shader`).then(res => res.text()),
					fetch(`./gl/shader/${shaderName}.fragment.shader`).then(res => res.text()),
				]).then(data => {
					this.src = data;
					return data;
				})
				shaderCache.set(shaderName, getting);
			}
		})
	}

	cache(gl) {
		if(!this.program) {
			this.recompile(gl);
			if(this.program) {
				this._uniforms = GL.getUniforms(gl, this.program);
				this._attributes = GL.getAttributes(gl, this.program);
			}
		}
		return this.program;
	}

	recompile(gl) {
		if(this.src) {
			this._vertShader = GL.compileShader(gl, this.src[0], gl.VERTEX_SHADER);
			this._fragShader = GL.compileShader(gl, this.src[1], gl.FRAGMENT_SHADER);
			this.program = GL.createProgram(gl, this._vertShader, this._fragShader);
			this.initialized = true;
		}
	}
}
