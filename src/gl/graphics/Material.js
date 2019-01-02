export class Material {

    static create({ name, texture }) {
        Material[name] = new Material({ texture });
        return Material[name];
    }

    constructor({ texture } = {}) {
        this.texture = null;
        this.gltexture = null;
        this.defuseColor = [1, 1, 1, 1];
        
        this.setTexture(texture);
    }

    setTexture(img) {
        this.texture = img;
    }

}
