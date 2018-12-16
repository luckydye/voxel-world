import { Resources } from "../lib/Resources.js";

const materials = {
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
    },
    "TEXTUREMAP": {
        "texture": "./images/blocks.png"
    }
}

export class Material {

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

for(let key in materials) {
    Material[key] = new Material(materials[key]);
}
