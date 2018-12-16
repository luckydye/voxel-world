import noise from '../lib/perlin.js';

class Tile {
	constructor(x, y, size) {
		this.tileData = new Array(size);
		this.pos = { x, y };

		for(let i = 0; i < this.tileData.length; i++) {
			this.tileData[i] = new Array(size);
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
		this.resolution = resolution;
		this.threshold = threshold;
		this.setSeed(seed);
	}
	
	setSeed(n) {
		this.seed = n;
		noise.seed(n);
		statistics.seed = n;
	}

	generateTile(x, y) {
		const tile = new Tile(x * this.tileSize, y * this.tileSize, this.tileSize);
		const tileData = tile.tileData;
		const res = this.resolution;

		for(let x = 0; x < tileData.length; x++) {
            for(let y = 0; y < tileData[x].length; y++) {
                for(let z = 0; z < tileData[x][y].length; z++) {
					if(y > this.tileSize - this.tileHeight) {
						const value = noise.perlin3((x + tile.pos.x) / res, y / res, (z + tile.pos.y) / res);
						let threshold = this.threshold;
						if(Math.abs(value) < threshold) {
							tileData[x][y][z] = 1;
						} else if(y > this.tileSize-2) {
							tileData[x][y][z] = 1;
						}
					} else {
						// above ground
					}
                }
            }
        }

		return tile;
	}

	makeTree(x, y, z) {
		
	}

}