import { Toolbar, IconButton } from './components/Toolbar.js';
import { DialogBox } from './components/Dialog.js';

window.addEventListener("DOMContentLoaded", () => onPageLod());
window.addEventListener("contextmenu", e => e.preventDefault());

function onPageLod() {
	const world = document.querySelector('#viewport');

	world.onReady = () => {
		world.createVoxelScene();
	}

	createToolbar({
		zoomIn: IconButton({
			icon: Icons.zoomin,
			onclick() {
				world.scene.camera.zoom(-1);
			}
		}),
		zoomOut: IconButton({
			icon: Icons.zoomout,
			onclick() {
				world.scene.camera.zoom(1);
			}
		}),

		spacer: "spacer",
		
		voxel: IconButton({
			icon: Icons.voxel,
			onclick() {
				openVoxelDialog(world);
			}
		}),
		
		terrain: IconButton({
			icon: Icons.terrain,
			onclick() {
				openTerrainDialog(world);
			}
		}),
	});
}

function openTerrainDialog(world) {
	const dialog = new DialogBox('Terrain');

	[
		{ name: "Smoothness", id: "smoothness", default: 0.025, steps: 0.001, type: "number" },
		{ name: "Resolution", id: "resolution", default: 50, steps: 5, type: "number" },
		{ name: "Height", id: "height", default: 1000, steps: 100, type: "number" },
		{ name: "Size", id: "size", default: 100, steps: 1, type: "number" }
	].forEach(row => {
		dialog.addField(row);
	})

	dialog.addEventListener('submit', e => {
		world.createTerrainScene(e.detail);
	});
	dialog.addEventListener('change', e => {
		const data = e.detail;
		if(world.terrain) {
			data.seed = world.terrain.seed;
		}
		if(data.size > 0) {
			world.createTerrainScene(data);
		}
	});
	document.body.appendChild(dialog);
}

function openVoxelDialog(world) {
	const dialog = new DialogBox('Voxel');
	[
		{ name: "worldSize", id: "tileSize", default: 2, steps: 1, type: "number" },
		{ name: "tileHeight", id: "tileHeight", default: 32, steps: 1, type: "number" },
		{ name: "threshold", id: "threshold", default: 0.33, steps: 0.05, type: "number" },
		{ name: "resolution", id: "resolution", default: 42, steps: 1, type: "number" },
		{ name: "terrainheight", id: "terrainheight", default: 16, steps: 1, type: "number" },
	].forEach(row => {
		dialog.addField(row);
	})

	dialog.addEventListener('submit', e => {
		const data = e.detail;
		world.createVoxelScene(data);
	});
	document.body.appendChild(dialog);
}

function createToolbar(buttonConfig) {
	const toolbar = new Toolbar({ theme: "dark" });
	for(let btn in buttonConfig) {
		if(buttonConfig[btn] == "spacer") {
			const spacer = document.createElement("div");
			spacer.style.margin = "5px";
			toolbar.appendChild(spacer);
		} else {
			toolbar.appendChild(buttonConfig[btn]);
		}
	}
	document.getElementsByTagName("main")[0].appendChild(toolbar);
}

const Icons = {
	voxel: `
		<svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 308.222 326.679">
			<defs><style>.a{fill:#d1d1d1;}.b{fill:#eee;}.c{fill:#fff;}</style></defs><g transform="translate(-653.357 -297.764)"><path class="a" d="M756.713,426.959V624.442L933.9,562.306,961.58,373.435Z"/><path class="b" d="M653.357,334.677l103.356,92.282V623.827L658.894,505.091Z"/><path class="c" d="M832.385,297.764l128.58,76.287L756.713,427.574,653.476,334.7Z"/></g>
		</svg>
	`,
	terrain: `
		<svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 583.222 375.496">
			<defs><style>.a{fill:#cecece;}.b{fill:#e8e8e8;}</style></defs><g transform="translate(-239.318 -145.002)"><path class="a" d="M246.7,280.537c28.408,57.088,157.806,115.624,273.77,118.121s166.235-18.819,205.408-44.82,37.789-61.888-48.715-59.184S566.331,158.14,566.331,158.14s-86.5-36.494-159.492,12.165S367.283,241.164,246.7,280.537Z"/><path class="b" d="M275.123,271.124c23.979-4.85,125.565-51.186,174.351-11.2S469.469,364.7,572.64,347.9s70.38-48.786,152.757-49.586c28.854,8.059,66.382,19.133,97.143,45.587C764.1,375.9,754.867,375.9,699.5,424.5s-95.973,75.671-146.421,95.973c-79.978,1.23-66-38.129-113.2-52.908-26.7-8.518-117.875,33.222-164.754-25.839s9.105-56.6-35.805-164.262C243.19,276.793,251.144,275.975,275.123,271.124Z"/></g>
		</svg>
	`,
	zoomin: `
		<svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 294.969 282.728"><defs><style>.a{fill:#e3e3e3;}.b{fill:rgba(0,0,0,0);stroke-width:25px;}.b,.c{stroke:#e3e3e3;}.c,.e{fill:none;}.c{stroke-width:14px;}.d{stroke:none;}</style></defs><g transform="translate(-128.031 37)"><rect class="a" width="138" height="44" rx="22" transform="translate(128.031 213.03) rotate(-42)"/><g class="b" transform="translate(201 -37)"><circle class="e" cx="111" cy="111" r="98.5"/></g><g transform="translate(-19.539 -20.19)"><line class="c" x2="95.077" transform="translate(284.5 93.341)"/><line class="c" y2="93.379" transform="translate(332.039 47.5)"/></g></g></svg>
	`,
	zoomout: `
		<svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 294.969 282.728"><defs><style>.a{fill:#e3e3e3;}.b{fill:rgba(0,0,0,0);stroke-width:25px;}.b,.c{stroke:#e3e3e3;}.c,.e{fill:none;}.c{stroke-width:14px;}.d{stroke:none;}</style></defs><g transform="translate(-128.031 37)"><rect class="a" width="138" height="44" rx="22" transform="translate(128.031 213.03) rotate(-42)"/><g class="b" transform="translate(201 -37)"><circle class="e" cx="111" cy="111" r="98.5"/></g><g transform="translate(-19.539 -20.19)"><line class="c" x2="95.077" transform="translate(284.5 93.341)"/></g></g></svg>
	`,
	rotateOn: `
		<svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 660 284"><defs><style>.a{fill:#f8f8f8;}.b{fill:#d6d6d6;}</style></defs><g transform="translate(66 -18)"><ellipse class="a" cx="330" cy="142" rx="330" ry="142" transform="translate(-66 18)"/><ellipse class="b" cx="101" cy="44" rx="101" ry="44" transform="translate(163 104)"/></g></svg>
	`,
	rotateOff: `
		<svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 660 284"><defs><style>.a{fill:#f8f8f8;}.b{fill:#d6d6d6;}</style></defs><g transform="translate(66 -18)"><ellipse class="a" cx="330" cy="142" rx="330" ry="142" transform="translate(-66 18)"/><ellipse class="b" cx="101" cy="44" rx="101" ry="44" transform="translate(163 104)"/></g></svg>
	`,
}
