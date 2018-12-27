import noise from '../lib/perlin.js';
import { Statistics } from './Statistics.js';

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
		Statistics.data.seed = n;
	}

	generateTile(x, y) {
		const tile = new Tile(x * this.tileSize, y * this.tileSize, this.tileSize);
        const tileHeight = this.tileHeight;
        const tileSize = this.tileSize;
		const tileData = tile.tileData;
		const res = this.resolution;

		// generate terrain
		const material = (x, y, z, value) => {
			let mats = [ UV.STONE ];
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
			return mats[Math.floor(value * mats.length)];
		}

		const height = 6;

		for(let x = 0; x < tileData.length; x++) {
            for(let y = 0; y < tileData[x].length; y++) {
                for(let z = 0; z < tileData[x][y].length; z++) {

					const mat = material(x, y, z, Math.random());

					// gen height map
					const yvalue = this.tileHeight + noise.perlin2((x + tile.pos.x) / res, (z + tile.pos.y) / res) * height;

					if (y > this.tileSize - yvalue &&
						x < this.tileSize && x >= 0 &&
						z < this.tileSize && z >= 0) {

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
		// return tile;

		const treeDensity = 0.6;

		for(let x = 0; x < tileData.length; x++) {
            for(let y = 0; y < tileData[x].length; y++) {
                for(let z = 0; z < tileData[x][y].length; z++) {
					// decide if destination is valid for a tree

					if (x+6 < tileSize && x-6 > 0 &&
						z+6 < tileSize && z-6 > 0) {

						if (tileData[x][y+1] && 
							tileData[x][y+1][z] && 
							!tileData[x][y-1][z] &&
							tileData[x][y+1][z] == UV.GRASS) {

							let yvalue = noise.perlin2(x * treeDensity, z * treeDensity) + 0.1;

							if(yvalue >= 0.7) {
								this.makeTree(tileData, x, y, z);
							}
						}
					}

                }
            }
        }

		return tile;
	}

	makeTree(tileData, x, y, z) {
		const height = 20;
        const tileHeight = this.tileHeight;
		const tileSize = this.tileSize;

		const width = 5;
		const bevel = 0.2;

		if(y > tileSize - (tileHeight + height))

		for(let i = 0; i < height; i++) {
			// make log
			if(tileData[x][y-i]) {
				if(i < height-1)
				
				tileData[x][y-i][z] = UV.LOG;
			}

			// make crown
			if(i >= 2) {
				let diff = -i * 0.22;

				if(i % 2 == 0) {
					diff -= 2;
				}

				for(let tx = -width; tx <= width; tx++) {
					for(let ty = -width; ty <= width; ty++) {

						if(x - tx != x || y - ty != y || i > height-2) {

							const p1 = [ x, y ];
							const p2 = [ x - tx, y - ty ];

							const a = p1[0] - p2[0];
							const b = p1[1] - p2[1];

							const dist = Math.sqrt( a*a + b*b );

							if(dist <= width + bevel + diff) {
								tileData[x - tx][y-i][z - ty] = UV.LEAVES;
							}
								
						}
					}
				}
			}
		}

	}

}