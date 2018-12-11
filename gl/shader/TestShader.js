import { GLShader } from "../GLShader.js";

export default class TestShader extends GLShader {

    constructor({ texturesrc } = {}) {
        super({ name: "test", texturesrc });
    }

}