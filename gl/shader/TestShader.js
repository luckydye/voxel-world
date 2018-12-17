import { GLShader } from "../GLShader.js";

export default class TestShader extends GLShader {

    constructor() {
        super({ name: "test" });

		this.load(this.name);
    }

    get uniform() {
        return {
            ambient: 1.0,
            ligthIntesity: 40.0
        }
    }

}