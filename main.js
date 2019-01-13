import World from './src/World.js';
import { Toolbar, IconButton } from './components/Toolbar.js';
import { Statistics } from './src/gl/Statistics.js';
import Icons from './Icons.js';
import { DialogBox } from './components/Dialog.js';

window.addEventListener("DOMContentLoaded", () => onPageLod());
window.addEventListener("contextmenu", e => e.preventDefault());

window.options = {
	// turntable: true,
	// splitView: true
};

function onPageLod() {
	const world = new World();
	world.render(document.querySelector("#world"));

	world.onloaded = () => {
		const hud = document.querySelector('hud #stats');
		hud.innerHTML = Statistics.toText();
	}

	let lastTerrainSettings = {};

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
		turntable: IconButton({
			icon: Icons.rotateOn,
			activeIcon: Icons.rotateOff,
			activeDefault: false,
			onclick(btn) {
				options.turntable = btn.active;
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
