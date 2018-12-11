import { GLShader } from "../GLShader.js";

export default class DefaultShader extends GLShader {

    constructor({ texturesrc } = {}) {
        super({ name: "default", texturesrc });
    }

}