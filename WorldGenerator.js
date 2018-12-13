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

	constructor({ tileSize = 16, tileHeight = 10 } = {}) {
		this.tileSize = tileSize;
		this.tileHeight = tileHeight;
	}

	generateTile() {
		const tile = new Tile(this.tileSize, this.tileHeight);
		const tileData = tile.tileData;

		for(let x = 0; x < tileData.length; x++) {
            for(let y = 0; y < tileData[x].length; y++) {
                for(let z = 0; z < tileData[x][y].length; z++) {
                    if(Math.random() > 0.33) {
						tileData[x][y][z] = 1;
                    }
                }
            }
        }

		return tile;
	}

}