import { GLShader } from "../GLShader.js";

export default class TestShader extends GLShader {

    constructor({ texturesrc } = {}) {
        super({ name: "test", texturesrc });
    }

    get uniform() {
        return {
            ambient: 0.8,
            time: performance.now()
        }
    }

}