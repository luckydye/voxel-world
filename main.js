import VoxelWorld from './world/VoxelWorld.js';
import { Toolbar, IconButton } from './components/Toolbar.js';

let voxelWorld;

window.addEventListener("contextmenu", e => e.preventDefault());

window.addEventListener("load", () => {
	voxelWorld = new VoxelWorld({ canvas: world });

	const hud = document.querySelector('hud #statistics');
	setInterval(() => {
		hud.innerText = JSON.stringify(statistics);
	}, 100);

	createToolbar();
});

function createToolbar() {
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
		}),
		turntable: IconButton({
			icon: "O",
			activeIcon: "X",
			activeDefault: false,
			onclick(btn) {
				voxelWorld.turntable = btn.active;
			}
		})
	}

	for(let btn in toolbarButtons) {
		toolbar.appendChild(toolbarButtons[btn]);
	}

	document.getElementsByTagName("main")[0].appendChild(toolbar);
}