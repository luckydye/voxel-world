window.resources = window.resources || {};
const global = window.resources;

global.initLoaded = false;
global.resourceTypes = {
	JSON: [".json"],
	TEXT: [".txt"],
	IMAGE: [".png", ".jpg"],
	SHADER: [".shader", ".fs", ".vs"],
};

global.queue = new Set();
global.map = new Map();

/* @DOCS
	Resource.add({ name, path }: arr, startLoading: bool): startLoading ? Promise : null
		# add resource to queue

	Resource.load(): Promise
		# initiate loading of queue

	Resource.map(void)
		# return resource map

	Resource.get(name: str)
		# return resource data by name

	Resource.finished: bool
		# returns if queue is finished
*/

export class Resources {

	static get Types() {
		return global.resourceTypes;
	}

	static get finished() {
		return global.queue.size === 0;
	}

	static add(obj, startLoad) {
		for(let key in obj) {
			global.queue.add({ name: key, path: obj[key] });
		}
		if(startLoad === true) {
			return Resources.load();
		}
	}

	static map() {
		return global.map;
	}

	static get(name) {
		return global.map.get(name);
	}

	static load() {
		let loads = [];

		for(let res of global.queue) {
			const loading = Resources._fetch(res.path).then(dataObj => {
				const resource = res;
				global.map.set(resource.name, dataObj);
			});
			loads.push(loading);
		}

		return Promise.all(loads).then(() => {
			global.queue.clear();

			if(!global.initLoaded && Resources.finished) {
				global.initLoaded = true;
			}
		})
	}

	static _fetch(path) {
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
				
			case Resources.Types.TEXT:
				return fetch(path).then(res => res.text());
				
			case Resources.Types.SHADER:
				return fetch(path).then(res => res.text());

			default:
				throw `Err: not a valid resource type: "${path}"`;
		}
	}

}
