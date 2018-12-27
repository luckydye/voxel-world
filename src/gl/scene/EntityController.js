
function isMouseButton(e) {
	let mbutton;
	if(e.button != null) {
		if(e.buttons == 4) {
			mbutton = 2;
		} else {
			mbutton = e.buttons;
		}
	} else {
		mbutton = e.which;
	}
	return mbutton;
}

export class EntityController {

	static get sensivity() {
		return 200;
	}

	constructor(entity) {
		if(!entity) throw "No controllable entity";

		let moving = false;
		let lastEvent = null;
		const viewport = document.body;

		const down = e => {
			moving = true;
			entity.update();
		}

		const up = e => {
			moving = false;
			viewport.style.cursor = "default";
			lastEvent = null;
			entity.update();
		}

		const move = e => {
			if(moving && lastEvent) {
				if(isMouseButton(e) == 2 || e.touches && e.touches.length > 1) {
					entity.position.x += (e.x - lastEvent.x) / window.innerWidth * Math.abs(entity.position.z);
					entity.position.y += (e.y - lastEvent.y) / window.innerWidth * Math.abs(entity.position.z);
					viewport.style.cursor = "move";
				} else if(isMouseButton(e) == 1 || e.type == "touchmove") {
					entity.rotation.y += (e.x - lastEvent.x) / window.innerWidth * this.constructor.sensivity;
					entity.rotation.x += (e.y - lastEvent.y) / window.innerWidth * this.constructor.sensivity;
					viewport.style.cursor = "grabbing";
				}
				entity.update();
			}
			lastEvent = e;
		}

		window.addEventListener("mousedown", down);
		window.addEventListener("mouseup", up);
		window.addEventListener("mousemove", move);

		window.addEventListener("touchstart", down);
		window.addEventListener("touchend", up);
		window.addEventListener("touchmove", e => {
			e.x = e.touches[0].clientX;
			e.y = e.touches[0].clientY;
			move(e);
		});

		window.addEventListener("wheel", e => {
			entity.zoom(e.deltaY);
			entity.update();
		})
	}

	update() {
		// interface update method
	}

}