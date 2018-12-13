let mats;

export class Material {

    static get geo() {
        return mats;
    }
    
    constructor({ texture } = {}) {
        this.texture = null;
        this.gltexture = null;

        if(texture) {
            this.loadTexture(texture);
        }
    }

    loadTexture(src) {
		if(!this.texture && src) {
			const image = new Image();
			image.onload = () => {
				this.texture = image;
			}
            image.src = src;
		}
    }

}

mats = { 
    DIRT: new Material({ texture: "../images/dirt.png" }),
    STONE: new Material({ texture: "../images/stone.png" }),
    LAVA: new Material({ texture: "../images/lava.png" }),
    GRASS: new Material({ texture: "../images/grass.png" }),
}
