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

const UV = {
	LOG: [0,0],
	GRASS: [1,0],
	LAVA: [2,0],
	STONE: [3,0],

	LEAVES: [0,1],
	DIRT: [1,1],
	WATER: [2,1],
	SAND: [3,1],
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
        const tileHeight = this.tileHeight;
        const tileSize = this.tileSize;
		const tileData = tile.tileData;
		const res = this.resolution;

		// generate terrain

		for(let x = 0; x < tileData.length; x++) {
            for(let y = 0; y < tileData[x].length; y++) {
                for(let z = 0; z < tileData[x][y].length; z++) {

					const mat = (() => {
						let mats = [ UV.STONE, UV.STONE, UV.DIRT ];
						if(tileSize - y >= tileHeight - 3) {
							mats = [ UV.DIRT ];
						}
						if(tileSize - y >= tileHeight - 1) {
							mats = [ UV.GRASS ];
						}
						if(y > tileSize-2 && !tileData[x][y-1][z]) {
							mats = [ UV.WATER ];
						}
						if (y < tileSize-1 && y > tileSize-5) {
							mats = [ UV.SAND ];
						}
						return mats[Math.floor(Math.random() * mats.length)];
					})();


					const yvalue = this.tileHeight + (noise.perlin2((x + tile.pos.x) / res, (x + tile.pos.y) / res) * 2);

					if (y > this.tileSize - yvalue &&
						x+1 < this.tileSize && x > 0 &&
						z+1 < this.tileSize && z > 0) {

						const value = noise.perlin3((x + tile.pos.x) / res, y / res, (z + tile.pos.y) / res);
						let threshold = this.threshold;
						if(Math.abs(value) < threshold) {
							tileData[x][y][z] = mat;
						} else if(y > this.tileSize-2) {
							tileData[x][y][z] = mat;
						}
					} else if(y > this.tileSize-2) {
						tileData[x][y][z] = mat;
					}
                }
            }
		}
		
		// generate features

		for(let x = 0; x < tileData.length; x++) {
            for(let y = 0; y < tileData[x].length; y++) {
                for(let z = 0; z < tileData[x][y].length; z++) {
					// decide if destination is valid for a tree
					const dx = x;
					const dz = z;

					if (Math.random() < 0.05 &&
						x+2 < tileSize && x-2 > 0 &&
						z+2 < tileSize && z-2 > 0) {

						if (tileData[x][y+1] && 
							tileData[x][y+1][z] && 
							tileData[x][y+1][z] == UV.GRASS) {
								
							if(x === dx && z === dz) {
								this.makeTree(tileData, x, y, z, 3 + Math.random() * (7 - 3));
							}
						}
					}

                }
            }
        }

		return tile;
	}

	makeTree(tileData, x, y, z, height) {
        const tileHeight = this.tileHeight;
		const tileSize = this.tileSize;
		
		if(y > tileSize - (tileHeight + height)) {
			for(let i = 0; i < height; i++) {
				// make log
				if(tileData[x][y-i]) {
					if(i < height-1) {
						tileData[x][y-i][z] = UV.LOG;
					} else {
						tileData[x][y-i][z] = UV.LEAVES;
					}
				}
				// make crown
				if(i >= 2 && i < height-1) {
					tileData[x][y-i][z+1] = UV.LEAVES;
					tileData[x+1][y-i][z] = UV.LEAVES;

					tileData[x][y-i][z-1] = UV.LEAVES;
					tileData[x-1][y-i][z] = UV.LEAVES;
				}
			}
		}

	}

}