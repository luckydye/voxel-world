import { GLShader } from "../GLShader.js";

export default class DefaultShader extends GLShader {

    constructor() {
        super({ name: "default" });

		this.load(this.name);
    }

}