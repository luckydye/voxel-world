import { Statistics } from '../Statistics.js';
import { GLContext } from './GL.js';
import { Grid } from './geo/Grid.js';
import { Plane } from './geo/Plane.js';
import FinalShader from './shader/FinalShader.js';
import ColorShader from './shader/ColorShader.js';
import GridShader from './shader/GridShader.js';
import LightShader from './shader/LightShader.js';
import { Voxel } from './geo/Voxel.js';

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

	onRender() {
		
	}

    onCreate() {
		this.shaders = [];
		this.renderPasses = [];
		
		window.addEventListener("resize", () => {
			this.updateViewport();
		});

		this.shaders = [
			new GridShader(),
			new FinalShader(),
			new ColorShader(),
			new LightShader(),
		];

		this.renderPasses = [
			new RenderPass(this, 'color', this.shaders[2]),
			new RenderPass(this, 'light', this.shaders[3]),
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

		this.grid = new Grid(200);
		this.screen = new Plane();

		this.draw();
	}

	updateViewport() {
		this.setResolution();
		this.scene.camera.update();
	}

	renderMultiPasses(passes) {
		for(let pass of passes) {
			pass.use();
			this.drawScene(this.scene);

			if(pass.id === 'color') {
				this.useShader(this.shaders[0]);
				this.drawGeo(this.grid);
			}

			Statistics.data.passes++;
		}

		this.clearFramebuffer();
	}

	compositePasses(passes) {
		this.gl.disable(this.gl.DEPTH_TEST);

		this.useShader(this.shaders[1]);
		for(let i in passes) {
			const pass = passes[i];
			this.useTexture(pass.buffer, pass.id + "Buffer", i);
		}
		this.useTexture(this.getBufferTexture('depth'), "depthBuffer", 4);
		this.drawGeo(this.screen);

		this.gl.enable(this.gl.DEPTH_TEST);
	}

	draw() {
		if(!this.scene) return;

		this.onRender();

		nextFrame = requestAnimationFrame((ms) => {
			this.time = ms;
			Statistics.data.fps = Math.floor(1000 / (this.time - lastFrame));
			Statistics.data.passes = 0;
			this.draw();
		});

		lastFrame = this.time;

		this.clear();

		this.renderMultiPasses(this.renderPasses);

		this.compositePasses(this.renderPasses);

		if(lastFrame) {
			Statistics.data.drawTime = Math.round((performance.now() - lastFrame) * 10) / 10;
		}
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
			this.gl.uniform1f(shader.uniforms.uTextureSize, geo.mat.textureSize);
			this.useTexture(geo.mat.gltexture, "uTexture", 0);
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
			if(obj instanceof Voxel) {
				if(!scene.cached) {
					vertArray.push(...obj.buffer.vertArray);
				}
			} else {
				this.drawGeo(obj);
			}

			if(!scene.defaultMaterial) {
				if(obj && obj.mat) {
					scene.defaultMaterial = obj.mat;
					const img = obj.mat.texture;
					scene.defaultMaterial.gltexture = this.createTexture(img);
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

			this.useTexture(scene.defaultMaterial.gltexture, "uTexture", 0);
			this.gl.uniform1f(shader.uniforms.uTextureSize, scene.defaultMaterial.textureSize);

			this.gl.drawArrays(this.gl.TRIANGLES, 0, vertxBuffer.vertsPerElement);
		}
	}

}
