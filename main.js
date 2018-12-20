import VoxelWorld from './src/VoxelWorld.js';
import { Toolbar, IconButton } from './components/Toolbar.js';
import { Statistics } from './src/Statistics.js';

window.addEventListener("load", () => onPageLod());
window.addEventListener("contextmenu", e => e.preventDefault());

window.options = {};

function onPageLod() {
	const voxelWorld = new VoxelWorld();
	voxelWorld.render(world);

	displayHud();

	createToolbar({
		zoomIn: IconButton({
			icon: "+",
			onclick() {
				voxelWorld.scene.camera.zoom(-1);
			}
		}),
		zoomOut: IconButton({
			icon: "-",
			onclick() {
				voxelWorld.scene.camera.zoom(1);
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
		}),
		splitView: IconButton({
			icon: "S",
			activeIcon: "C",
			activeDefault: false,
			onclick(btn) {
				window.options.splitView = btn.active;
			}
		})
	});
}

function displayHud() {
	const hud = document.querySelector('hud #stats');
	setInterval(() => {
		hud.innerHTML = Statistics.toText();
	}, 250);
}

function createToolbar(buttonConfig) {
	const toolbar = new Toolbar({ theme: "dark" });
	for(let btn in buttonConfig) {
		toolbar.appendChild(buttonConfig[btn]);
	}
	document.getElementsByTagName("main")[0].appendChild(toolbar);
}