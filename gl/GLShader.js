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
