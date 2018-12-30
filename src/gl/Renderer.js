import { Statistics } from '../Statistics.js';
import { GLContext } from './GL.js';
import { Grid } from './geo/Grid.js';
import { Plane } from './geo/Plane.js';
import { Cube } from './geo/Cube.js';
import FinalShader from './shader/FinalShader.js';
import ColorShader from './shader/ColorShader.js';
import NormalShader from './shader/NormalShader.js';
import GridShader from './shader/GridShader.js';
import LightShader from './shader/LightShader.js';
import AOShader from './shader/AOShader.js';

let nextFrame,
	lastFrame;

class RenderPass {

	get buffer() {
		return this.renderer.getBufferTexture(this.id);
	}

	constructor(renderer, id, shader) {
		this.id = id;
		this.shader = shader;
		this.renderer = renderer;

		this.renderer.createFramebuffer(this.id);
	}

	use() {
		this.renderer.useFramebuffer(this.id);
		this.renderer.updateViewport();
		this.renderer.clear();
		this.renderer.useShader(this.shader);
	}
}

export class Renderer extends GLContext {

    onCreate() {
		this.shaders = [];
		this.renderPasses = [];
		
		window.addEventListener("resize", () => {
			this.updateViewport();
		});

		this.options = {
			DEPTH_TEST: true,
			// CULLING: true
		}

		this.shaders = [
			new GridShader(),
			new FinalShader(),
			new ColorShader(),
			new LightShader(),
			// new NormalShader(),
			// new AOShader(),
		];

		this.renderPasses = [
			new RenderPass(this, 'color', this.shaders[2]),
			new RenderPass(this, 'light', this.shaders[3]),
			// new RenderPass(this, 'normal', this.shaders[4]),
		]
		
		for(let shader of this.shaders) {
			this.prepareShader(shader);
		}
	}

	setScene(scene) {
		if(nextFrame) {
			cancelAnimationFrame(nextFrame);
		}

		this.scene = scene;
		this.scene.clear();

		this.updateViewport();

		this.grid = new Grid(200);
		this.screen = new Plane();

		this.draw();
	}

	updateViewport() {
		this.setResolution();
		this.scene.camera.update();
	}

	renderMultiPass(passes) {
		for(let pass of passes) {
			pass.use();
			
			this.drawScene(this.scene);
			
			if(pass.id == 'color') {
				this.useShader(this.shaders[0]);
				this.drawGeo(this.grid);
			}

			Statistics.data.passes++;
		}

		this.clearFramebuffer();
	}

	compositePasses(passes) {
		this.useShader(this.shaders[1]);

		for(let i in passes) {
			const pass = passes[i];
			this.useTexture(pass.buffer, pass.id + "Buffer", i);
		}
		this.useTexture(this.getBufferTexture('depth'), "depthBuffer", 4);
		
		this.drawGeo(this.screen);
	}

	draw() {
		if(!this.scene) return;
		
		nextFrame = requestAnimationFrame((ms) => {
			this.time = ms;
			Statistics.data.fps = Math.floor(1000 / (this.time - lastFrame));
			Statistics.data.passes = 0;
			this.draw();
		});

		// calc draw time
		if(Statistics.lastFrame) {
			Statistics.data.frameTime = Math.round((performance.now() - Statistics.lastFrame) * 10) / 10;
		}

		this.clear();

		this.renderMultiPass(this.renderPasses);
		this.compositePasses(this.renderPasses);

		lastFrame = this.time;

		Statistics.lastFrame = performance.now();
	}

	drawGeo(geo) {
		const shader = this.currentShader;

		const camera = this.scene.camera;
		this.gl.uniformMatrix4fv(shader.uniforms.uProjMatrix, false, camera.projMatrix);
		this.gl.uniformMatrix4fv(shader.uniforms.uViewMatrix, false, camera.viewMatrix);

		const uNormalMatrix  = mat4.create();
		this.gl.uniformMatrix4fv(shader.uniforms.uNormalMatrix, false, uNormalMatrix);

		this.setTransformUniforms(shader.uniforms, geo);

		if(geo.mat) {
			if(!geo.mat.gltexture) {
				const img = geo.mat.texture;
				geo.mat.gltexture = this.createTexture(img);
			}
			this.useTexture(geo.mat.gltexture, "uTexture", 0);
		} else {
			// this.useTexture(null, "uTexture", 0);
		}

		const buffer = geo.buffer;
		this.setBuffersAndAttributes(shader.attributes, buffer);
		this.gl.drawArrays(this.gl[geo.buffer.type], 0, buffer.vertecies.length / buffer.elements);
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
				if(!scene.cached) {
					vertArray.push(...obj.buffer.vertArray);
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

}
