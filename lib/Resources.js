window.resources = window.resources || {};
const global = window.resources;

global.listeners = {};
global.queue = new Set();
global.map = new Map();
global.Types = {
	JSON: [".json"],
	TEXT: [".txt"],
	IMAGE: [".png"]
}

export class Resources {

	static get Types() {
		return global.Types;
	}

	static get finished() {
		return global.queue.size === 0;
	}

	static onDone() {
		Resources.emit('all', global.map);
	}

	static add(name, path) {
		global.queue.add({ name, path });
	}

	static get(name) {
		return global.map[name];
	}

	static wait(resourceName, callback) {
		const listeners = global.listeners;
		if(!(resourceName in listeners)) {
			listeners[resourceName] = [];
		}
		listeners[resourceName].push(callback);
	}

	static emit(name, data) {
		const listeners = global.listeners;

		if(name in listeners) {
			 for(let f of listeners[name]) {
				global.map.set(name, data);
				f(data);
			 }
		}
	}

	static load() {
		for(let res of global.queue) {
			return Resources.fetch(res.path).then(dataObj => {
				global.queue.delete(res);

				Resources.emit(res.name, dataObj);

				if(Resources.finished) {
					Resources.onDone();
				}
			});
		}

		if(Resources.finished) {
			Resources.onDone();
		}
	}

	static fetch(path) {
		let type = null;

		for(let t in Resources.Types) {
			for(let ending of Resources.Types[t]) {
				if(path.match(ending)) {
					type = Resources.Types[t];
				}
			}
		}

		switch(type) {
			case Resources.Types.JSON:
				return fetch(path).then(res => res.json());

			case Resources.Types.IMAGE:
				return new Promise((resolve, reject) => {
					const img = new Image();
					img.onload = () => {
						resolve(img);
					}
					img.src = path;
				});
				
			default:
				return fetch(path).then(res => res.text());
		}
	}

}
