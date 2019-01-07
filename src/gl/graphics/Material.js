export class Material {

    static create(name) {
        Material[name] = new Material();
        Material[name].name = name;
        return Material[name];
    }

    constructor() {
        this.texture = null;
        this.diffuseColor = [1, 1, 1];
    }

}
