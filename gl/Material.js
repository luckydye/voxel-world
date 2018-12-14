const mats = {
    "DIRT": {
        "texture": "./images/dirt.png"
    },
    "STONE": {
        "texture": "./images/stone.png"
    },
    "LAVA": {
        "texture": "./images/lava.png"
    },
    "GRASS": {
        "texture": "./images/grass.png"
    }
}

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

for(let key in mats) {
    Material[key] = new Material(mats[key]);
}
