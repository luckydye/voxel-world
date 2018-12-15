window.resources = window.resources || {};
const global = window.resources;

global.listeners = {};
global.queue = new Set();
global.map = new Map();

const resourceTypes = {
	JSON: 0,
	TEXT: 1,
	IMAGE: 2,
}

function fetchResource(path) {
	return fetch(path).then(res => {
		return res;
	})
}

function fetchMedia(path) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => {
			resolve(img);
		}
		img.src = path;
	});
}

export class Resources {

	static get(name) {
		return global.map[name];
	}

	static get finished() {
		return global.queue.size === 0;
	}

	static subscribe(resourceName, callback) {
		const listeners = global.listeners;
		if(!(resourceName in listeners)) {
			listeners[resourceName] = [];
		}
		listeners[resourceName].push(callback);
	}

	static emit(queueItem, data) {
		const listeners = global.listeners;
		const name = queueItem.name;

		// delete from queue
		global.queue.delete(queueItem);
		// emit listener
		if(name in listeners) {
			 for(let f of listeners[name]) {
				global.map.set(name, data);
				f(data);
			 }
		}

		// fire event for empty queue
		if(Resources.finished) {
			if('all' in listeners) {
				for(let f of listeners['all']) f(global.map);
		   }
		}
	}

	static add(name, type, path) {
		global.queue.add({ name, type, path });
	}

	static load() {
		for(let res of global.queue) {
			switch(res.type) {
				case Resources.JSON:
					return fetchResource(res.path)
						.then(d => d.json()
						.then(json => {
							Resources.emit(res, json);
						}))

				case Resources.TEXT:
					return fetchResource(res.path)
							.then(d => d.text()
							.then(text => {
								Resources.emit(res, text);
							}))

				case Resources.IMAGE:
					return fetchMedia(res.path)
							.then(img => {
								Resources.emit(res, img);
							});
			}
		}
	}

}

Object.assign(Resources, resourceTypes);
