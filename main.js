import World from './src/World.js';
import { Toolbar, IconButton } from './components/Toolbar.js';
import { Statistics } from './src/gl/Statistics.js';

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
			icon: "+",
			onclick() {
				world.scene.camera.zoom(-1);
			}
		}),
		zoomOut: IconButton({
			icon: "-",
			onclick() {
				world.scene.camera.zoom(1);
			}
		}),
		regen: IconButton({
			icon: "?",
			onclick() {
				world.scene.clear();
				world.worldgen.regen();
			}
		}),
		turntable: IconButton({
			icon: "O",
			activeIcon: "X",
			activeDefault: false,
			onclick(btn) {
				options.turntable = btn.active;
			}
		})
	});
}

function createToolbar(buttonConfig) {
	const toolbar = new Toolbar({ theme: "dark" });
	for(let btn in buttonConfig) {
		toolbar.appendChild(buttonConfig[btn]);
	}
	document.getElementsByTagName("main")[0].appendChild(toolbar);
}
