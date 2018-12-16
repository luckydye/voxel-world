import { GLShader } from "../GLShader.js";

export default class TestShader extends GLShader {

    constructor() {
        super({ name: "test" });
    }

    get uniform() {
        return {
            ambient: 1.0,
            ligthIntesity: 30.0
        }
    }

}