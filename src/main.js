import './VoxelWorld.js';

window.addEventListener("DOMContentLoaded", () => onPageLod());

function onPageLod() {
	const world = document.querySelector('#viewport');

	world.onReady = () => {
		world.createVoxelScene();
	}
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
