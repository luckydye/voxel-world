import { Statistics } from '../Statistics.js';
import { Grid } from '../geo/Grid.js';
import { Plane } from '../geo/Plane.js';
import { GLContext } from './GL.js';
import FinalShader from '../shader/FinalShader.js';
import ColorShader from '../shader/ColorShader.js';
import GridShader from '../shader/GridShader.js';
import LightShader from '../shader/LightShader.js';
import { Voxel } from '../geo/Voxel.js';
import { Material } from './Material.js';
import { Texture } from './Texture.js';
import { Resources } from '../Resources.js';

Resources.add({
	'defaultTextureAtlas': './resources/textures/blocks_solid.png',
	'defaulttexture': './resources/textures/placeholder.png',
}, false);

class RenderPass {

	get buffer() {
		return this.renderer.getBufferTexture(this.id);
	}

	constructor(renderer, id, shader, res) {
		this.id = id;
		this.shader = shader;
		this.renderer = renderer;
		this.resolution = res;

		if(!shader.initialized) {
			this.renderer.prepareShader(shader);
		}

		this.renderer.createFramebuffer(this.id, this.resolution, this.resolution);
	}

	use() {
		this.renderer.useFramebuffer(this.id);
		this.renderer.clear();
		this.renderer.updateViewport();
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

		this.renderPasses = [
			new RenderPass(this, 'color', new ColorShader()),
			new RenderPass(this, 'light', new LightShader()),
		]
		
		this.shaders = [
			new GridShader(),
			new FinalShader(),
		];

		for(let shader of this.shaders) {
			this.prepareShader(shader);
		}

        Statistics.data.passes = this.renderPasses.length;
		Statistics.data.resolution = this._resolution;

		this.defaultMaterial = Material.create("default");
		this.defaultMaterial.texture = new Texture(Resources.get("defaulttexture"));
	}

	setScene(scene) {
		this.scene = scene;
		this.scene.clear();

		this.grid = new Grid(200);
		this.screen = new Plane();
	}

	updateViewport() {
		this.setResolution();
		this.scene.camera.update();
	}

	renderMultiPasses(passes) {
		for(let pass of passes) {
			pass.use();

			switch(pass.id) {
				case 'lightsource':
					this.drawScene(this.scene, this.scene.lightSources);
					break;
				default:
					this.drawScene(this.scene);
					this.useShader(this.shaders[0]);
					this.drawGeo(this.grid);
			}
		}

		this.clearFramebuffer();
	}

	compositePasses(passes) {
		this.useShader(this.shaders[1]);
		this.useFrameBufferPasses(passes);
		this.drawGeo(this.screen);
	}

	useFrameBufferPasses(passes) {
		for(let i in passes) {
			const pass = passes[i];
			this.useTexture(pass.buffer, pass.id + "Buffer", i);
		}
		this.useTexture(this.getBufferTexture('depth'), "depthBuffer", passes.length);
	}

	draw() {
		if(!this.scene) return;

		for(let geo of this.scene.objects) {
			// update animated textures
			if(geo.mat.animated) {
				this.updateTexture(geo.mat.texture.gltexture, geo.mat.texture.image);
			}
		}

		this.renderMultiPasses(this.renderPasses);
		this.compositePasses(this.renderPasses);
	}

	// give texture a .gltexture
	prepareTexture(texture) {
		if(!texture.gltexture) {
			const image = texture.image || Resources.get("defaulttexture");
			texture.gltexture = this.createTexture(image);
		}
	}

	// give material attributes to shader
	applyMaterial(shader, material) {
		// colorTexture
		const colorTexture = material.texture;
		this.prepareTexture(colorTexture);
		this.useTexture(colorTexture.gltexture, "colorTexture", this.renderPasses.length+1);
		this.gl.uniform1f(shader.uniforms.textureScale, colorTexture.scale);

		this.gl.uniform3fv(shader.uniforms.uDiffuseColor, material.diffuseColor);
	}

	drawScene(scene, camera) {
		camera = camera || scene.camera;
		const objects = scene.objects;
		const shader = this.currentShader;

		this.gl.uniformMatrix4fv(shader.uniforms.uProjMatrix, false, camera.projMatrix);
		this.gl.uniformMatrix4fv(shader.uniforms.uViewMatrix, false, camera.viewMatrix);

		for(let obj of objects) {
			this.drawGeo(obj);
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

		this.applyMaterial(shader, geo.mat);

		const buffer = geo.buffer;
		this.setBuffersAndAttributes(shader.attributes, buffer);
		this.gl.drawArrays(this.gl[geo.buffer.type], 0, buffer.vertecies.length / buffer.elements);
	}

}
