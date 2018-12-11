export class Vec {

	constructor(x = 0, y = 0, z = 0) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	add(vec) {
		if(arguments.length > 1) {
			this.x += arguments[0];
			this.y += arguments[1];
			this.z += arguments[2];
			return this;
		}

		this.x += vec.x;
		this.y += vec.y;
		this.z += vec.z;
		return this;
	}

	multiply(vec) {
		switch(typeof vec) {
			case "object":
				this.x *= vec.x;
				this.y *= vec.y;
				this.z *= vec.z;
				return this;
				
			case "number":
				this.x *= vec;
				this.y *= vec;
				this.z *= vec;
				return this;
		}
	}

	subtract(vec) {
		this.x -= vec.x;
		this.y -= vec.y;
		this.z -= vec.z;
		return this;
	}

}
