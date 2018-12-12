export class Buffer {

	static CUBE(w = 300, h = 300, s = 1) {
		return {
			type: "TRIANGLES",
			elements: 5,
			vertecies: new Float32Array([
			 // x      y      z          u  v //
				s * w, 0 + s * w, s * h, 1, 1,
				s * w, 0 + s * w, -s * h, 1, 0,
				-s * w, 0 + s * w, -s * h, 0, 0,
				s * w, 0 + s * w, s * h, 1, 1,
				-s * w, 0 + s * w, -s * h, 0, 0,
				-s * w, 0 + s * w, s * h, 0, 1,
	
				s * w, 0 - s * w, s * h, 1, 1,
				s * w, 0 - s * w, -s * h, 1, 0,
				-s * w, 0 - s * w, -s * h, 0, 0,
				s * w, 0 - s * w, s * h, 1, 1,
				-s * w, 0 - s * w, -s * h, 0, 0,
				-s * w, 0 - s * w, s * h, 0, 1,
	
				s * w, s * h, 0 + s * w, 1, 1,
				s * w, -s * h, 0 + s * w, 1, 0,
				-s * w, -s * h, 0 + s * w, 0, 0,
				s * w, s * h, 0 + s * w, 1, 1,
				-s * w, -s * h, 0 + s * w, 0, 0,
				-s * w, s * h, 0 + s * w, 0, 1,
	
				s * w, s * h, 0 - s * w, 1, 1,
				s * w, -s * h, 0 - s * w, 1, 0,
				-s * w, -s * h, 0 - s * w, 0, 0,
				s * w, s * h, 0 - s * w, 1, 1,
				-s * w, -s * h, 0 - s * w, 0, 0,
				-s * w, s * h, 0 - s * w, 0, 1,
	
				0 + s * w, s * w, s * h, 1, 1,
				0 + s * w, s * w, -s * h, 1, 0,
				0 + s * w, -s * w, -s * h, 0, 0,
				0 + s * w, s * w, s * h, 1, 1,
				0 + s * w, -s * w, -s * h, 0, 0,
				0 + s * w, -s * w, s * h, 0, 1,
	
				0 - s * w, s * w, s * h, 1, 1,
				0 - s * w, s * w, -s * h, 1, 0,
				0 - s * w, -s * w, -s * h, 0, 0,
				0 - s * w, s * w, s * h, 1, 1,
				0 - s * w, -s * w, -s * h, 0, 0,
				0 - s * w, -s * w, s * h, 0, 1,
			]),
			attributes: [
				{ size: 3, attribute: "aPosition" },
				{ size: 2, attribute: "aTextCords" }
			]
		}
	}
	
	static GRID(s = 15) {
		const dataArray = [];

		for(let x = 0; x < s-1; x++) {
			for(let y = 0; y < s-1; y++) {
				const w = 600;
				const h = 600;
		
				dataArray.push(...[
					x * w, 0, y * h, 0.25, 0.25, 0.25,
					x * w, 0, y * -h, 0.25, 0.25, 0.25,
					x * w, 0, y * -h, 0.25, 0.25, 0.25,
					x * -w, 0, y * -h, 0.25, 0.25, 0.25,
					x * -w, 0, y * -h, 0.25, 0.25, 0.25,
					x * -w, 0, y * h, 0.25, 0.25, 0.25,
					x * -w, 0, y * h, 0.25, 0.25, 0.25,
					x * w, 0, y * h, 0.25, 0.25, 0.25,
				])
			}
		}

		return {
			type: "LINES",
			elements: 6,
			vertecies: new Float32Array(dataArray),
			attributes: [
				{ size: 3, attribute: "aPosition" },
				{ size: 3, attribute: "aColor" }
			]
		}
	}

}