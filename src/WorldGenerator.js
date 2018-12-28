import noise from '../lib/perlin.js';
import { Statistics } from './Statistics.js';

class Tile {
	constructor(x, y, size, height) {
		this.tileData = new Array(size);
		this.height = height;
		this.pos = { x, y };

		for(let i = 0; i < this.tileData.length; i++) {
			this.tileData[i] = new Array(this.height);
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
		tileHeight = 40,
		seed = 0,
		resolution = 15,
		threshold = 0.2,
		terrainheight = 15,
	} = {}) {
		this.tileSize = tileSize;
		this.tileHeight = tileHeight;
		this.resolution = resolution;
		this.threshold = threshold;
		this.terrainheight = terrainheight;
		this.setSeed(seed);
	}
	
	setSeed(n) {
		this.seed = n;
		noise.seed(n);
		Statistics.data.seed = n;
	}

	generateTile(x, y) {
        const tileHeight = this.tileHeight;
        const tileSize = this.tileSize;
		const tile = new Tile(x * tileSize, y * tileHeight, tileSize, tileHeight);
		const tileData = tile.tileData;
		const res = this.resolution;

		// generate terrain
		const material = (yvalue, x, y, z, value) => {
			let mats = [ UV.STONE ];

			if(tileData[x][y-1] && tileData[x][y-1][z] == null) {
				mats = [ UV.GRASS ];
			}
			
			if(y > tileHeight-2 && !tileData[x][y-1][z]) {
				mats = [ UV.WATER ];
			}
			if (y < tileHeight-1 && y > tileHeight-3) {
				mats = [ UV.SAND ];
			}

			return mats[Math.floor(value * mats.length)];
		}

		for(let x = 0; x < tileData.length; x++) {
            for(let y = 0; y < tileData[x].length; y++) {
                for(let z = 0; z < tileData[x][y].length; z++) {

					// gen height map
					const noiseV = noise.perlin2((x + tile.pos.x) / res, (z + tile.pos.y) / res) * this.terrainheight;
					const yvalue = tileHeight - noiseV;

					const mat = material(yvalue, x, y, z, Math.random());

					if(y > yvalue) {
						tileData[x][y][z] = mat;
					} else if(y > tileHeight-2) {
						tileData[x][y][z] = mat;
					}

					if(tileHeight > 30) {
						if(y < noiseV) {
							tileData[x][y][z] = mat;
						} else if(y == 0) {
							tileData[x][y][z] = mat;
						}
					}

					if (y < tileHeight && y > 0 &&
						x < this.tileSize && x >= 0 &&
						z < this.tileSize && z >= 0) {

						const value = noise.perlin3((x + tile.pos.x) / res, y / res, (z + tile.pos.y) / res);

						if(value > this.threshold) {
							tileData[x][y][z] = mat;
						} else if(y > tileHeight-2) {
							tileData[x][y][z] = mat;
						}
					} else if(y > tileHeight-2) {
						tileData[x][y][z] = mat;
					}
                }
            }
		}
		
		// generate features
		// return tile;

		const treeDensity = 0.7;

		for(let x = 0; x < tileData.length; x++) {
            for(let y = 0; y < tileData[x].length; y++) {
                for(let z = 0; z < tileData[x][y].length; z++) {
					// decide if destination is valid for a tree

					const treeHeight = Math.random() * 10 + 10;

					if (x+10 < tileSize && x-10 > 0 &&
						y-treeHeight > 0 &&
						z+10 < tileSize && z-10 > 0) {

						if (tileData[x][y+1] && 
							tileData[x][y-1] && 
							tileData[x][y+1][z] && 
							!tileData[x][y-1][z] &&
							tileData[x][y+1][z] == UV.GRASS) {

							let yvalue = noise.perlin2(x * treeDensity, z * treeDensity) + 0.1;

							if(yvalue >= treeDensity) {
								this.makeTree(tileData, x, y, z, treeHeight);
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

		const width = 5;
		const bevel = 0.2;

		if(y + height < tileHeight)

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