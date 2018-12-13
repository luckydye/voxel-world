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

Material.DIRT = new Material({ texture: "./images/dirt.png" });
Material.STONE = new Material({ texture: "./images/stone.png" });
Material.LAVA = new Material({ texture: "./images/lava.png" });
Material.GRASS = new Material({ texture: "./images/grass.png" });
