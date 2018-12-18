import VoxelWorld from './src/VoxelWorld.js';
import { Toolbar, IconButton } from './components/Toolbar.js';

window.addEventListener("load", () => onPageLod());
window.addEventListener("contextmenu", e => e.preventDefault());

function onPageLod() {
	const voxelWorld = new VoxelWorld();
	voxelWorld.render(world);

	displayHud();

	createToolbar({
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
	});
}

function displayHud() {
	const hud = document.querySelector('hud #statistics');
	setInterval(() => {
		hud.innerText = JSON.stringify(statistics);
	}, 100);
}

function createToolbar(buttonConfig) {
	const toolbar = new Toolbar({ theme: "dark" });
	for(let btn in buttonConfig) {
		toolbar.appendChild(buttonConfig[btn]);
	}
	document.getElementsByTagName("main")[0].appendChild(toolbar);
}