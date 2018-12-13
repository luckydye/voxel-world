import noise from './perlin.js';

class Tile {
	constructor(size, height) {
		this.tileData = new Array(size);

		for(let i = 0; i < this.tileData.length; i++) {
			this.tileData[i] = new Array(height);
			for(let j = 0; j < this.tileData[i].length; j++) {
				this.tileData[i][j] = new Array(size);
			}
		}
	}
}

export class WorldGenerator {

	constructor({ 
		tileSize = 16, 
		tileHeight = 10,
		seed = 0,
		resolution = 15,
		threshold = 0.2,
	} = {}) {
		this.tileSize = tileSize;
		this.tileHeight = tileHeight;
		this.seed = seed;
		this.resolution = resolution;
		this.threshold = threshold;

		noise.seed(this.seed);
	}

	generateTile() {
		const tile = new Tile(this.tileSize, this.tileHeight);
		const tileData = tile.tileData;
		const res = this.resolution;

		for(let x = 0; x < tileData.length; x++) {
            for(let y = 0; y < tileData[x].length; y++) {
                for(let z = 0; z < tileData[x][y].length; z++) {
					var value = noise.perlin3(x / res, y / res, z / res);
                    if(Math.abs(value) < this.threshold) {
						tileData[x][y][z] = 1;
                    }
                }
            }
        }

		return tile;
	}

}