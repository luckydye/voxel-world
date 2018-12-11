import { Renderer } from "./Renderer.js";

window.shaderStore = window.shaderStore || new Map();

export class GLShader {

	get vertexShader() {
		return this._vertShader;
	}

	get fragementShader() {
		return this._fragShader;
	}

	constructor(name) {
		this.program = null;
		this.src = null;
		this.name = name;

		this.load(this.name);
	}

	load(shaderName) {
		return new Promise((resolve, reject) => {
			if(shaderStore.has(shaderName)) {
				shaderStore.get(shaderName).then(data => {
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
				shaderStore.set(shaderName, getting);
			}
		})
	}

	cache(gl) {
		if(!this.program) {
			this.recompile(gl);
		}
		return this.program;
	}

	recompile(gl) {
		if(this.src) {
			this._vertShader = Renderer.compileShader(gl, this.src[0], gl.VERTEX_SHADER);
			this._fragShader = Renderer.compileShader(gl, this.src[1], gl.FRAGMENT_SHADER);
			this.program = Renderer.createProgram(gl, this._vertShader, this._fragShader);
		}
	}

	setUniforms(gl) {
		
	}
}
