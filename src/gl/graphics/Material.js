import { Texture } from "./Texture.js";

export class Material {

    static create(name) {
        Material[name] = new Material();
        Material[name].name = name;
        return Material[name];
    }

    constructor() {
        this.texture = new Texture();
        this.reflectionMap = new Texture();
        
        this.diffuseColor = [1, 1, 1];
        this.transparency = 0;
        this.reflection = 0;
    }

}
