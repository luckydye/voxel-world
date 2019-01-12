import { Texture } from "./Texture.js";
import { Resources } from "../Resources.js";

export class Material {

    static createFromJson(name, json) {
        const mat = Material.create(name);
            
        const texImage = Resources.get(json.texture);
        const texture = new Texture(texImage);
        mat.texture = texture;

        mat.diffuseColor = json.diffuseColor || [1, 1, 1];

        const reflectionImage = Resources.get(json.reflectionMap);
        const reflectionTexture = new Texture(reflectionImage);
        mat.reflectionMap = reflectionTexture;

        mat.receiveShadows = json.receiveShadows;
        mat.castShadows = json.castShadows;

        return mat;
    }

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
        
        this.receiveShadows = true;
        this.castShadows = true;
    }

}
