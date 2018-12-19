import { Scene } from './scene/Scene.js';
import { Cube } from './geo/Cube.js';
import { GLContext } from './GL.js';
import FinalShader from './shader/FinalShader.js';
import ColorShader from './shader/ColorShader.js';
import DepthShader from './shader/DepthShader.js';
import NormalShader from './shader/NormalShader.js';
import { VertexBuffer } from './scene/VertexBuffer.js';
import { Grid } from './geo/Grid.js';
import GridShader from './shader/GridShader.js';
import { Material } from './scene/Material.js';
import { Vec } from './Math.js';

let nextFrame,
	lastFrame;

window.statistics = {
	voxels: 0,
};

class RenderPass {

	get buffer() {
		return this.renderer.getBufferTexture(this.id);
	}

	constructor(renderer, id, shader) {
		this.id = id;
		this.shader = shader;
		this.renderer = renderer;

		this.prepare();
	}

	prepare() {
		this.renderer.createFramebuffer(this.id);
	}

	use() {
		this.renderer.useFramebuffer(this.id);
		this.renderer.clear();
		this.renderer.useShader(this.shader);
	}

	clear() {
		this.renderer.clearFramebuffer();
	}
}

export class Renderer extends GLContext {

    constructor(canvas) {
		super(canvas);

		this.shaders = [];
		this.renderPasses = [];
		this.screenVertexBuffer = null;
		
		window.addEventListener("resize", () => {
			this.setResolution(window.innerWidth, window.innerHeight);
		});
	}

	setScene(scene) {
		if(nextFrame) {
			cancelAnimationFrame(nextFrame);
		}

		this.scene = scene;
		this.scene.camera.controls(this.canvas);
		this.scene.clear();

		this.setResolution(window.innerWidth, window.innerHeight);

		this.shaders = [
			new GridShader(),
			new FinalShader(),
			new ColorShader(),
			new DepthShader(),
			new NormalShader(),
		];
		
		for(let shader of this.shaders) {
			this.prepareShader(shader);
		}

		this.renderPasses = [
			new RenderPass(this, 'color', this.shaders[2]),
			new RenderPass(this, 'depth', this.shaders[3]),
			new RenderPass(this, 'normal', this.shaders[4]),
		]

		this.grid = new Grid(200);

		this.draw();
	}

	createScreenVertexBuffer() {
		const vertxBuffer = VertexBuffer.create([
			0, 0, 		0.5, 1.0,
			-1, -1, 	0.5, 0.0,
			0, -1, 		1.0, 1.0,
		]);
		vertxBuffer.type = "TRIANGLES";
		vertxBuffer.attributes = [
			{ size: 2, attribute: "aPosition" },
			{ size: 2, attribute: "aTexCoord" },
		]
		this.screenVertexBuffer = vertxBuffer;
	}

	setResolution(w, h) {
		this.gl.canvas.width = w || window.innerWidth;
		this.gl.canvas.height = h || window.innerHeight;
		this.gl.viewport(0, 0, w, h);
		this.scene.camera.update();
	}

	draw() {
		if(!this.scene) return;
		
		nextFrame = requestAnimationFrame((ms) => {
			this.time = ms;
			statistics.fps = Math.floor(1000 / (this.time - lastFrame));
			statistics.passes = 0;
			this.draw();
		});

		// for(let pass of this.renderPasses) {
		// 	pass.use();
		// 	this.drawScene(this.scene, pass.shader);
		// 	pass.clear();
		// }

		// this.clear();

		this.clear();

		// this.clearFramebuffer();

		// for(let i in this.renderPasses) {
		// 	const pass = this.renderPasses[i];
		// 	this.useTexture(pass.buffer, pass.id + "Buffer", i);
		// }

		// statistics.passes = finalShader.uniforms;

		// const vertexBuffer = this.screenVertexBuffer;
		// this.setBuffersAndAttributes(finalShader.attributes, vertexBuffer);
		// this.gl.drawArrays(this.gl.TRIANGLES, 0, vertexBuffer.vertsPerElement);

		this.useShader(this.shaders[2]);
		this.drawScene(this.scene);

		this.useShader(this.shaders[0]);
		this.drawGeo(this.grid);

		lastFrame = this.time;
	}

	drawScene(scene) {
		const camera = scene.camera;
		const objects = scene.objects;
		const shader = this.currentShader;

		const vertxBuffer = scene.vertexBuffer;
		const vertArray = [];

		this.gl.uniformMatrix4fv(shader.uniforms.uProjMatrix, false, camera.projMatrix);
		this.gl.uniformMatrix4fv(shader.uniforms.uViewMatrix, false, camera.viewMatrix);

		for(let obj of objects) {
			if(obj instanceof Cube) {
				if(!scene.cached && !obj.invisible) {
					vertArray.push(...obj.buffer.vertArray);
					statistics.voxels += 1;
				}
			}

			if(!scene.texturemap) {
				if(obj && obj.mat) {
					const img = obj.mat.texture;
					scene.texturemap = this.createTexture(img);
				}
			}
		}

		if(!scene.cached && vertArray.length > 0) {
			vertxBuffer.vertecies = new Float32Array(vertArray);
			scene.cached = true;
		}

		if(scene.cached) {
			this.setBuffersAndAttributes(shader.attributes, vertxBuffer);
			this.setTransformUniforms(shader.uniforms);

			this.useTexture(scene.texturemap, "uTexture", 0);

			this.gl.drawArrays(this.gl.TRIANGLES, 0, vertxBuffer.vertsPerElement);
		}
	}

	drawGeo(geo) {
		const shader = this.currentShader;

		const camera = this.scene.camera;
		this.gl.uniformMatrix4fv(shader.uniforms.uProjMatrix, false, camera.projMatrix);
		this.gl.uniformMatrix4fv(shader.uniforms.uViewMatrix, false, camera.viewMatrix);

		if(geo.mat) {
			if(!geo.mat.gltexture) {
				const img = geo.mat.texture;
				geo.mat.gltexture = this.createTexture(img);
			}
			this.useTexture(geo.mat.gltexture, "uTexture", 0);
		}

		const buffer = geo.buffer;
		this.setBuffersAndAttributes(shader.attributes, buffer);
		this.gl.drawArrays(this.gl[geo.buffer.type], 0, buffer.vertecies.length / buffer.elements);
	}

}
