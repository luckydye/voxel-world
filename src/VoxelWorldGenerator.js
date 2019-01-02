import noise from '../lib/perlin.js';
import { Statistics } from './gl/Statistics.js';
import { Material } from './gl/graphics/Material.js';
import { Voxel } from './gl/geo/Voxel.js';
import { Vec } from './gl/Math.js';
import { Resources } from './gl/Resources.js';

let world = 'default';

if(document.location.search) {
    world = document.location.search.substr(1);
}

let wtexture = './resources/textures/blocks_solid.png';

if(document.location.hash == "#mc") {
    wtexture = './resources/textures/blocks.png';
}

Resources.add({
    'worldtextures': wtexture,
    'world': './resources/worlds/' + world + '.json',
}, false);

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

export class VoxelWorldGenerator {

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
		this.treeDensity = 0.65;
		this.tiles = [];

		this.scene = null;

		this.setSeed(seed);
	}
	
	setSeed(n) {
		this.seed = n;
		noise.seed(n);
		Statistics.data.seed = n;
	}

    voxel(tileData, x, y, z) {
        const tileSize = this.tileSize;
        const tileHeight = this.tileHeight;
        const cube = new Voxel({
            material: Material.WORLD,
            uv: tileData[x][y][z],
            position: new Vec(
                ((x * 20) + 10) - ((tileSize/2) * 20),
                ((y * 20) + 10) - ((tileHeight) * 20) - 0.5,
                ((z * 20) + 10) - ((tileSize/2) * 20),
            )
        });

        if((y-1 > 0 && y-1 < tileHeight) && tileData[x][y-1][z]) {
            cube.visible.TOP = false;
        }
        if((y+1 > 0 && y+1 < tileHeight) && tileData[x][y+1][z]) {
            cube.visible.BOTTOM = false;
        }
        if((z-1 > 0 && z-1 < tileSize) && tileData[x][y][z-1]) {
            cube.visible.RIGHT = false;
        }
        if((z+1 > 0 && z+1 < tileSize) && tileData[x][y][z+1]) {
            cube.visible.LEFT = false;
        }
        if((x-1 > 0 && x-1 < tileSize) && tileData[x-1][y][z]) {
            cube.visible.BACK = false;
        }
        if((x+1 > 0 && x+1 < tileSize) && tileData[x+1][y][z]) {
            cube.visible.FRONT = false;
        }

        if(!cube.invisible) {
            Statistics.data.voxels++;
            this.scene.add(cube);
        }
    }

    regen(seed) {
        seed = seed || Math.random();
        this.setSeed(seed);
        this.tiles = [
            this.generateTile(0, 0),
        ]
        this.buildTiles(this.tiles);
    }

    buildTiles(tiles) {
        Statistics.data.voxels = 0;

        for(let tile of tiles) {
            const tileData = tile.tileData;
            for(let x = 0; x < tileData.length; x++) {
                for(let y = 0; y < tileData[x].length; y++) {
                    for(let z = 0; z < tileData[x][y].length; z++) {
                        if(tileData[x][y][z]) {
                            this.voxel(tileData, x + tile.pos.x, y, z + tile.pos.y);
                        }
                    }
                }
            }
        }
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

			const dirtLayer = Math.floor(Math.random() * 2 + 2);

			if (tileData[x][y-1] && tileData[x][y-1][z] == UV.GRASS ||
				tileData[x][y-dirtLayer] && tileData[x][y-dirtLayer][z] == UV.GRASS) {
				mats = [ UV.DIRT ];
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

		const treeDensity = this.treeDensity;

		for(let x = 0; x < tileData.length; x++) {
            for(let y = 0; y < tileData[x].length; y++) {
                for(let z = 0; z < tileData[x][y].length; z++) {
					// decide if destination is valid for a tree

					const treeHeight = Math.floor(Math.random() * 10 + 10);

					if (x+5 < tileSize && x-5 > 0 &&
						y > treeHeight &&
						z+5 < tileSize && z-5 > 0) {

						if (tileData[x][y+1] && 
							tileData[x][y-1] && 
							tileData[x][y+1][z] && 
							!tileData[x][y-1][z] &&
							tileData[x][y+1][z] == UV.GRASS) {

							let yvalue = noise.perlin2(x * treeDensity, z * treeDensity) + 0.1;
							
							if(yvalue < 0.5 && yvalue > 0.45) {
								this.makeThing(tileData, x, y, z);
							} else

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

		if(y - height < tileHeight) {

			if(tileData[x][y - height] && !tileData[x][y - height][z])

			for(let i = 0; i < height; i++) {
				// make log
				if(tileData[x][y-i]) {
					if(i <= height-1) {
						tileData[x][y-i][z] = UV.LOG;
					}
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

	makeThing(tileData, x, y, z) {
		// tileData[x][y][z] = UV.LAVA;
	}

}