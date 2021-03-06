import noise from '../lib/perlin.js';
import { Group } from '@uncut/viewport/src/geo/Group';
import { Voxel } from '@uncut/viewport/src/geo/Voxel';

class Tile {
    constructor(x, y, size, height) {
        this.tileData = new Array(size);
        this.height = height;
        this.pos = { x: x * size, y: y * size };

        this.group = new Group();

        this.group.position.x = this.pos.x * 2;
        this.group.position.z = this.pos.y * 2;

        for (let i = 0; i < this.tileData.length; i++) {
            this.tileData[i] = new Array(this.height);
            for (let j = 0; j < this.tileData[i].length; j++) {
                this.tileData[i][j] = new Array(size);
            }
        }
    }
}

const UV = {
    LOG: [0, 0],
    GRASS: [1, 0],
    LAVA: [2, 0],
    STONE: [3, 0],

    LEAVES: [0, 1],
    DIRT: [1, 1],
    WATER: [2, 1],
    SAND: [3, 1],
}

const generatedTiles = [];

export class VoxelWorldGenerator {

    setSeed(n) {
        this.seed = n;
        noise.seed(n);
    }

    setOptions({
        view_distance = 4,
        world_height = 64,
        tile_size = 32,
        seed = 0,
        resolution = 15,
        threshold = 0.2,
        terrainheight = 15,
    } = {}, startPos = [0, 0]) {
        this.worldSize = view_distance;
        this.tileHeight = world_height;
        this.resolution = resolution;
        this.threshold = threshold;
        this.terrainheight = terrainheight;
        this.treeDensity = 0.65;
        this.tileSize = tile_size;

        this.startPos = startPos;

        this.setSeed(seed);
    }

    constructor(args) {
        this.setOptions(args);
    }

    generate(startpoint, TILECOUNT, put) {
        let tileCount = 0;
        let openSet = new Set();
        let closedSet = createSet(TILECOUNT * 2);
        const self = this;

        tick(startpoint, TILECOUNT);

        function tick(tile, maxCount) {
            if (tileCount > maxCount) return;

            const [x, y] = tile;

            function valid(tile) {
                const [x, y] = tile;
                return !(closedSet[x] ? closedSet[x][y] : null);
            }

            function getNeighbors() {
                for (let n of [
                    [x + 1, y],
                    [x - 1, y],
                    [x, y - 1],
                    [x, y + 1],

                    [x + 1, y - 1],
                    [x + 1, y + 1],
                    [x - 1, y - 1],
                    [x - 1, y + 1],
                ]) {
                    if (valid(n)) openSet.add(n);
                }
            }

            if (generatedTiles.indexOf(`${x},${y}`) === -1) {
                generatedTiles.push(`${x},${y}`);
                put(self.generateTile(x, y));
            }

            tileCount++;

            closedSet[x][y] = tile;
            openSet.delete(tile);

            getNeighbors(tile);

            for (let tile of openSet) {
                if (valid(tile)) {
                    tick(tile, maxCount);
                }
            }
        }

        function createSet(size) {
            const arr = new Array(size);
            for (let x = -size / 2; x < size / 2; x++) {
                arr[x] = new Array(size);
            }
            return arr;
        }
    }

    regen(seed, callback) {
        seed = seed || Math.random();
        this.setSeed(seed);

        return new Promise((resolve, reject) => {
            const size = this.worldSize;

            this.generate(this.startPos, size * size + 4, (newtile) => {
                callback(this.buildTile(newtile));
            });

            resolve();
        });
    }

    buildTile(tile) {
        const tileData = tile.tileData;
        for (let x = 0; x < tileData.length; x++) {
            for (let y = 0; y < tileData[x].length; y++) {
                for (let z = 0; z < tileData[x][y].length; z++) {
                    if (tileData[x][y][z]) {
                        this.voxel(tile, x, y, z, tile.pos.x, tile.pos.y);
                    }
                }
            }
        }
        return tile;
    }

    generateTile(x, y) {
        const tileHeight = this.tileHeight;
        const tileSize = this.tileSize;
        const tile = new Tile(x, y, tileSize, tileHeight);
        const tileData = tile.tileData;
        const res = this.resolution;

        // generate terrain
        const material = (yvalue, x, y, z, value) => {
            let mats = [UV.STONE];

            if (tileData[x][y - 1] && tileData[x][y - 1][z] == null) {
                mats = [UV.GRASS];
            }

            const dirtLayer = Math.floor(Math.random() * 2 + 2);

            if (tileData[x][y - 1] && tileData[x][y - 1][z] == UV.GRASS ||
                tileData[x][y - dirtLayer] && tileData[x][y - dirtLayer][z] == UV.GRASS) {
                mats = [UV.DIRT];
            }

            if (y > tileHeight - 2 && !tileData[x][y - 1][z]) {
                mats = [UV.WATER];
            }
            if (y < tileHeight - 1 && y > tileHeight - 3) {
                mats = [UV.SAND];
            }

            return mats[Math.floor(value * mats.length)];
        }

        for (let x = 0; x < tileData.length; x++) {
            for (let y = 0; y < tileData[x].length; y++) {
                for (let z = 0; z < tileData[x][y].length; z++) {

                    // gen height map
                    const noiseV = noise.perlin2((x + tile.pos.x) / res, (z + tile.pos.y) / res) * this.terrainheight;
                    const yvalue = tileHeight - noiseV;

                    const mat = material(yvalue, x, y, z, Math.random());

                    if (y > yvalue - 5.5) {
                        tileData[x][y][z] = mat;
                    } else if (y > tileHeight - 2) {
                        tileData[x][y][z] = mat;
                    }

                    if (y < tileHeight && y > 0 &&
                        x < this.tileSize && x >= 0 &&
                        z < this.tileSize && z >= 0) {

                        if (noise.perlin3((x + tile.pos.x) / res, y / res, (z + tile.pos.y) / res) > this.threshold) {
                            tileData[x][y][z] = mat;
                        } else if (y > tileHeight - 2) {
                            tileData[x][y][z] = mat;
                        }
                    } else if (y > tileHeight - 2) {
                        tileData[x][y][z] = mat;
                    }
                }
            }
        }

        const treeDensity = this.treeDensity;

        for (let x = 0; x < tileData.length; x++) {
            for (let y = 0; y < tileData[x].length; y++) {
                for (let z = 0; z < tileData[x][y].length; z++) {
                    // decide if destination is valid for a tree

                    const treeHeight = Math.floor(Math.random() * 10 + 10);

                    if (x + 4 < tileSize && x - 4 > 0 &&
                        y > treeHeight &&
                        z + 4 < tileSize && z - 4 > 0) {

                        if (tileData[x][y + 1] &&
                            tileData[x][y - 1] &&
                            tileData[x][y + 1][z] &&
                            !tileData[x][y - 1][z] &&
                            tileData[x][y + 1][z] == UV.GRASS) {

                            let yvalue = noise.perlin2(x * treeDensity + tile.pos.y, z * treeDensity + tile.pos.y) + 0.1;

                            if (yvalue >= treeDensity) {
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

        if (y - height < tileHeight) {

            if (tileData[x][y - height] && !tileData[x][y - height][z])

                for (let i = 0; i < height; i++) {
                    // make log
                    if (tileData[x][y - i]) {
                        if (i <= height - 1) {
                            tileData[x][y - i][z] = UV.LOG;
                        }
                    }

                    // make crown
                    if (i >= 2) {
                        let diff = -i * 0.22;

                        if (i % 2 == 0) {
                            diff -= 2;
                        }

                        for (let tx = -width; tx <= width; tx++) {
                            for (let ty = -width; ty <= width; ty++) {

                                if (x - tx != x || y - ty != y || i > height - 2) {

                                    const a = x - (x - tx);
                                    const b = y - (y - ty);

                                    const dist = Math.sqrt(a * a + b * b);

                                    if (dist <= width + bevel + diff) {
                                        tileData[x - tx][y - i][z - ty] = UV.LEAVES;
                                    }

                                }
                            }
                        }
                    }
                }
        }

    }

    voxel(tile, x, y, z, offsetX = 0, offsetY = 0) {

        const uv = tile.tileData[x][y][z];
        const cube = new Voxel({
            uv: [
                -4 + uv[0],
                -1 - uv[1],
                1 / 4,
                1 / 4,
            ],
            position: [
                ((x * 2) + 1) - ((this.tileSize / 2) * 2),
                ((y * 2) + 1) - ((this.tileHeight) * 2) - 0.5,
                ((z * 2) + 1) - ((this.tileSize / 2) * 2),
            ]
        });

        if ((y - 1 > 0 && y - 1 < this.tileHeight) && tile.tileData[x][y - 1][z]) {
            cube.visible.TOP = false;
        }
        if ((y + 1 > 0 && y + 1 < this.tileHeight) && tile.tileData[x][y + 1][z]) {
            cube.visible.BOTTOM = false;
        }
        if ((z - 1 > 0 && z - 1 < this.tileSize) && tile.tileData[x][y][z - 1]) {
            cube.visible.RIGHT = false;
        }
        if ((z + 1 > 0 && z + 1 < this.tileSize) && tile.tileData[x][y][z + 1]) {
            cube.visible.LEFT = false;
        }
        if ((x - 1 > 0 && x - 1 < this.tileSize) && tile.tileData[x - 1][y][z]) {
            cube.visible.BACK = false;
        }
        if ((x + 1 > 0 && x + 1 < this.tileSize) && tile.tileData[x + 1][y][z]) {
            cube.visible.FRONT = false;
        }

        if (!cube.invisible) {
            tile.group.add(cube);
        }
    }

}

const worldGen = new VoxelWorldGenerator();

onmessage = (e) => {
    switch (e.data.type) {

        case 'regen':
            worldGen.setOptions(e.data.settings, e.data.offset);
            const startTime = performance.now();
            worldGen.regen(0, tile => {
                self.postMessage({
                    type: 'tile',
                    tileData: tile.tileData,
                    buffer: tile.group.createBuffer(),
                    position: tile.group.position
                });
            })
            break;

    }
}
