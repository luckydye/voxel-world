import World from './src/World.js';
import { Toolbar, IconButton } from './components/Toolbar.js';
import { Statistics } from './src/gl/Statistics.js';
import Icons from './Icons.js';
import { DialogBox } from './components/Dialog.js';

window.addEventListener("load", () => onPageLod());
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
				world.createVoxelScene();
			}
		}),
		
		terrain: IconButton({
			icon: Icons.terrain,
			onclick() {
				const dialog = new DialogBox('Dialog Box');

				dialog.addField({ name: "Smoothness", id: "smoothness", default: 0.025, steps: 0.001, type: "number" });
				dialog.addField({ name: "Resolution", id: "resolution", default: 50, steps: 5, type: "number" });
				dialog.addField({ name: "Height", id: "height", default: 1000, steps: 100, type: "number" });
				dialog.addField({ name: "Size", id: "size", default: 100, steps: 1, type: "number" });

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
		}),
	});
}

function createToolbar(buttonConfig) {
	const toolbar = new Toolbar({ theme: "dark" });
	for(let btn in buttonConfig) {
		if(buttonConfig[btn] == "spacer") {
			const spacer = document.createElement("div");
			spacer.style.marginTop = "10px";
			toolbar.appendChild(spacer);
		} else {
			toolbar.appendChild(buttonConfig[btn]);
		}
	}
	document.getElementsByTagName("main")[0].appendChild(toolbar);
}
