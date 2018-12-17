import { GLShader } from "../GLShader.js";

export default class DepthShader extends GLShader {

    constructor() {
        super({ name: "depth" });

		this.load(this.name);
    }

}