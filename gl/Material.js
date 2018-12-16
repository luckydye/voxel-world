export class Material {

    static create({ name, texture }) {
        Material[name] = new Material({ texture });
        return Material[name];
    }

    constructor() {
        this.texture = null;
        this.gltexture = null;
    }

    setTexture(img) {
        this.texture = img;
    }

}
