import { GLShader } from "../GLShader.js";

export default class TestShader extends GLShader {

    constructor({ texturesrc } = {}) {
        super({ name: "test", texturesrc });
    }

    setUniforms(gl) {
        gl.uniform1f(this.uniforms.ambient, 1.0);
    }

}