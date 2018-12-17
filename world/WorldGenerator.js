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
        const tileHeight = this.tileHeight;
        const tileSize = this.tileSize;
		const tileData = tile.tileData;
		const res = this.resolution;

		// generate terrain

		for(let x = 0; x < tileData.length; x++) {
            for(let y = 0; y < tileData[x].length; y++) {
                for(let z = 0; z < tileData[x][y].length; z++) {

					const mat = (() => {
						let mats = [ [3,0], [3,0], [0,0] ];
						if(tileSize - y >= tileHeight - 3) {
							mats = [ [0,0] ];
						}
						if(tileSize - y >= tileHeight - 1) {
							mats = [ [1,0] ];
						}
						if(y > tileSize-2 && !tileData[x][y-1][z]) {
							mats = [ [0,1] ];
						}
						return mats[Math.floor(Math.random() * mats.length)];
					})();

					if(y > this.tileSize - this.tileHeight) {
						const value = noise.perlin3((x + tile.pos.x) / res, y / res, (z + tile.pos.y) / res);
						let threshold = this.threshold;
						if(Math.abs(value) < threshold) {
							tileData[x][y][z] = mat;
						} else if(y > this.tileSize-2) {
							tileData[x][y][z] = mat;
						}
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

					if (Math.random() < 0.095 &&
						x+2 < tileSize && x-2 > 0 &&
						z+2 < tileSize && z-2 > 0) {

						if (tileData[x][y+1] && 
							tileData[x][y+1][z] && 
							tileData[x][y+1][z][0] == 1) {
								
							if(x === dx && z === dz) {
								this.makeTree(tileData, x, y, z, 7);
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
						tileData[x][y-i][z] = [1,1];
					} else {
						tileData[x][y-i][z] = [2,1];
					}
				}
				// make crown
				if(i >= 3 && i != height-1) {
					tileData[x][y-i][z+1] = [2,1];
					tileData[x+1][y-i][z] = [2,1];

					tileData[x][y-i][z-1] = [2,1];
					tileData[x-1][y-i][z] = [2,1];
				}
			}
		}

	}

}