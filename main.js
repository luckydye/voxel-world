import VoxelWorld from './VoxelWorld.js';
import { Toolbar, IconButton } from './Toolbar.js';

let voxelWorld;

window.addEventListener("load", () => {
	voxelWorld = new VoxelWorld({ canvas: world });
	init();
});

function init() {
	const toolbar = new Toolbar({ theme: "dark" });

	const toolbarButtons = {
		zoomIn: IconButton({
			icon: "+",
			onclick() {
				voxelWorld.scene.camera.zoom(1);
			}
		}),
		zoomOut: IconButton({
			icon: "-",
			onclick() {
				voxelWorld.scene.camera.zoom(-1);
			}
		}),
		regen: IconButton({
			icon: "?",
			onclick() {
				voxelWorld.regen();
			}
		})
	}

	for(let btn in toolbarButtons) {
		toolbar.appendChild(toolbarButtons[btn]);
	}

	document.getElementsByTagName("main")[0].appendChild(toolbar);
}