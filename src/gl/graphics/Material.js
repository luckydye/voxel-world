export class Material {

    static create(name) {
        Material[name] = new Material();
        return Material[name];
    }

    constructor({ texture } = {}) {
        this.texture = texture;
        this.gltexture = null;
        this.textureSize = 0;
        this.diffuseColor = [1, 1, 1];
        this.animated = false;
    }

}
