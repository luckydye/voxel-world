import { GLShader } from "../GLShader.js";

export default class TestShader extends GLShader {

    constructor({ texturesrc } = {}) {
        super({ name: "test", texturesrc });
    }

    setUniforms(gl) {
        gl.uniform3fv(this.uniforms.lightPos, [1, 1, 1]);
    }

}