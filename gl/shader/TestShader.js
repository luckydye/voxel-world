import { GLShader } from "../GLShader.js";

export default class TestShader extends GLShader {

    constructor() {
        super({ name: "test" });
    }

    get uniform() {
        return {
            ambient: 0.8
        }
    }

}