import World from './src/World.js';
import { Toolbar, IconButton } from './components/Toolbar.js';
import { Statistics } from './src/gl/Statistics.js';
import Icons from './Icons.js';

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
				world.createTerrainScene();
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
