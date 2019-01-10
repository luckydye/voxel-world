import { Statistics } from '../Statistics.js';
import { Grid } from '../geo/Grid.js';
import { Plane } from '../geo/Plane.js';
import { GLContext } from './GL.js';
import FinalShader from '../shader/FinalShader.js';
import ColorShader from '../shader/ColorShader.js';
import GridShader from '../shader/GridShader.js';
import LightShader from '../shader/LightShader.js';
import { Material } from './Material.js';
import { Texture } from './Texture.js';
import { Resources } from '../Resources.js';
import ReflectionShader from '../shader/ReflectionShader.js';

Resources.add({
	'defaulttexture': './resources/textures/placeholder.png',
}, false);

class RenderPass {

	get buffer() {
		return this.renderer.getBufferTexture(this.id);
	}

	get depthBuffer() {
		return this.renderer.getBufferTexture(this.id + 'Depth');
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

	setScene(scene) {
		this.scene = scene;

		this.grid = new Grid(200);
		this.screen = new Plane({ material: null });
	}

	updateViewport() {
		this.setResolution();
		this.scene.camera.update();
		this.scene.lightSources.update();
	}

    onCreate() {
		this.renderPasses = [];
		
		window.addEventListener("resize", () => {
			this.updateViewport();
		});

		this.gridShader = new GridShader();
		this.prepareShader(this.gridShader);

		this.compShader = new FinalShader();
		this.prepareShader(this.compShader);

		this.defaultMaterial = Material.create("default");
		this.defaultMaterial.texture = new Texture(Resources.get("defaulttexture"));

		this.renderPasses = [
			new RenderPass(this, 'shadow', new ColorShader()),
			new RenderPass(this, 'reflection', new ReflectionShader()),
			new RenderPass(this, 'diffuse', new ColorShader()),
			new RenderPass(this, 'light', new LightShader()),
		]

        Statistics.data.passes = this.renderPasses.length;
		Statistics.data.resolution = this._resolution;
	}

	renderMultiPasses(passes) {
		for(let pass of passes) {
			pass.use();

			switch(pass.id) {
				
				case "shadow":
					this.drawScene(this.scene, this.scene.lightSources);
					break;
				
				case "reflection":
					this.gl.cullFace(this.gl.FRONT);
					this.drawScene(this.scene);
					this.gl.cullFace(this.gl.BACK);
					break;

				case "diffuse":
					this.useTexture(this.renderPasses[1].buffer, "reflectionBuffer", 2);
					this.drawScene(this.scene);
					this.useShader(this.gridShader);
					this.drawMesh(this.grid);
					break;

				case "light":
					const lightS = this.scene.lightSources;
					this.gl.uniformMatrix4fv(pass.shader.uniforms.lightProjViewMatrix, 
						false, lightS.projViewMatrix);

					this.useTexture(this.renderPasses[0].depthBuffer, "shadowDepthMap", 2);
					this.drawScene(this.scene);
					break;
			}
		}

		this.clearFramebuffer();
	}

	compositePasses(passes) {
		this.clear();
		this.gl.clearColor(0.05, 0.1, 0.15, 1.0);

		this.useShader(this.compShader);
			
		for(let i in passes) {
			const pass = passes[i];
			this.useTexture(pass.buffer, pass.id + "Buffer", i);
		}
		this.drawGeo(this.screen);
	}

	draw() {
		if(!this.scene) return;

		// update animated textures
		for(let geo of this.scene.objects) {
			if(geo.mat && geo.mat.animated) {
				this.updateTexture(geo.mat.texture.gltexture, geo.mat.texture.image);
			}
		}

		this.renderMultiPasses(this.renderPasses);
		this.compositePasses(this.renderPasses);
	}

	// give texture a .gltexture
	prepareTexture(texture) {
		if(!texture.gltexture) {
			texture.gltexture = this.createTexture(texture.image || null);
		}
	}

	// give material attributes to shader
	applyMaterial(shader, material) {
		const colorTexture = material.texture;
		this.prepareTexture(colorTexture);
		this.useTexture(colorTexture.gltexture, "colorTexture", 0);

		const reflectionMap = material.reflectionMap;
		this.prepareTexture(reflectionMap);
		this.useTexture(reflectionMap.gltexture, "reflectionMap", 1);

		this.gl.uniform1f(shader.uniforms.textureScale, colorTexture.scale);
		this.gl.uniform3fv(shader.uniforms.diffuseColor, material.diffuseColor);
		this.gl.uniform1f(shader.uniforms.reflection, material.reflection);
		this.gl.uniform1f(shader.uniforms.transparency, material.transparency);
	}

	drawScene(scene, camera) {
		camera = camera || scene.camera;
		const objects = scene.objects;
		const shader = this.currentShader;

		this.gl.uniformMatrix4fv(shader.uniforms.uProjMatrix, false, camera.projMatrix);
		this.gl.uniformMatrix4fv(shader.uniforms.uViewMatrix, false, camera.viewMatrix);

		for(let obj of objects) {
			if(obj.isLight) {
				this.drawLight(obj);
			} else {
				this.drawMesh(obj);
			}
		}
	}

	drawLight(geo) {
		const shader = this.currentShader;

		this.setTransformUniforms(shader.uniforms, geo);

		this.gl.uniform3fv(shader.uniforms.lightColor, geo.color);
		this.gl.uniform1f(shader.uniforms.lightIntensity, geo.intensity);

		const buffer = geo.buffer;
		this.setBuffersAndAttributes(shader.attributes, buffer);
		this.gl.drawArrays(this.gl[geo.buffer.type], 0, buffer.vertecies.length / buffer.elements);
	}

	drawMesh(geo) {
		const shader = this.currentShader;

		this.gl.uniform1f(shader.uniforms.lightIntensity, 0);

		this.setTransformUniforms(shader.uniforms, geo);

		if(geo.mat) {
			this.applyMaterial(shader, geo.mat);
		
			const buffer = geo.buffer;
			this.setBuffersAndAttributes(shader.attributes, buffer);
			this.gl.drawArrays(this.gl[geo.buffer.type], 0, buffer.vertecies.length / buffer.elements);
		}
	}

	drawGeo(geo) {
		const shader = this.currentShader;

		this.setTransformUniforms(shader.uniforms, geo);

		const buffer = geo.buffer;
		this.setBuffersAndAttributes(shader.attributes, buffer);
		this.gl.drawArrays(this.gl[geo.buffer.type], 0, buffer.vertecies.length / buffer.elements);
	}

}
