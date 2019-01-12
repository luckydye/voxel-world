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

	constructor(renderer, id, shader, ar, resolution, isDepthBuffer) {
		this.id = id;
		this.shader = shader;
		this.renderer = renderer;

		if(!shader.initialized) {
			this.renderer.prepareShader(shader);
        }
        
		this.width = resolution;
		this.height = resolution / ar;

		if(isDepthBuffer) {
            this.renderer.createFramebuffer(this.id, this.width, this.height).depthbuffer();
        } else {
            this.renderer.createFramebuffer(this.id, this.width, this.height).colorbuffer();
        }
	}

	use() {
		this.renderer.useFramebuffer(this.id);
		this.renderer.clear();
		this.renderer.viewport(this.width, this.height);
		this.renderer.useShader(this.shader);
	}
}

export class Renderer extends GLContext {

	get width() { return 1280; }
	get height() { return 1280; }

	get aspectratio() { return this.width / this.height; }

	setScene(scene) {
		this.scene = scene;

		this.grid = new Grid(200);
		this.screen = new Plane({ material: null });

		this.updateViewport();
	}

	updateViewport() {
		this.setResolution(this.width, this.height);
		this.scene.camera.sensor = {
			width: this.width,
			height: this.height
		};
		this.scene.camera.update();

		Statistics.data.resolution = this.resolution;
	}

    onCreate() {
		this.renderPasses = [
			new RenderPass(this, 'shadow', new ColorShader(), this.aspectratio, 3840, true),
			new RenderPass(this, 'light', new LightShader(), this.aspectratio, 3840),
			new RenderPass(this, 'reflection', new ReflectionShader(), this.aspectratio, this.width),
			new RenderPass(this, 'diffuse', new ColorShader(), this.aspectratio, this.width),
		]

		this.gridShader = new GridShader();
		this.prepareShader(this.gridShader);

		this.compShader = new FinalShader();
		this.prepareShader(this.compShader);

		this.defaultMaterial = Material.create("default");
		this.defaultMaterial.texture = new Texture(Resources.get("defaulttexture"));

        Statistics.data.passes = this.renderPasses.length;
	}

	renderMultiPasses(passes) {
		for(let pass of passes) {
			pass.use();
			switch(pass.id) {
				
				case "shadow":
					this.drawScene(this.scene, this.scene.lightSources, obj => {
						return obj.mat && obj.mat.castShadows;
					});
					break;

				case "light":
					this.useTexture(this.getBufferTexture('shadow'), "shadowDepthMap", 2);

					const lightS = this.scene.lightSources;
					this.gl.uniformMatrix4fv(pass.shader.uniforms.lightProjViewMatrix, 
						false, lightS.projViewMatrix);

					this.drawScene(this.scene, this.scene.camera, obj => {
						return obj.mat && obj.mat.receiveShadows;
					});
					break;
				
				case "reflection":
					this.gl.cullFace(this.gl.FRONT);
					this.drawScene(this.scene, this.scene.camera);
					this.gl.cullFace(this.gl.BACK);
					break;

				case "diffuse":
					this.useTexture(this.getBufferTexture('reflection'), "reflectionBuffer", 2);
					this.drawScene(this.scene);
					this.useShader(this.gridShader);
					this.drawMesh(this.grid);
					break;
			}
		}

		this.clearFramebuffer();
	}

	compositePasses(passes) {
		this.clear();
		this.gl.clearColor(0.05, 0.1, 0.15, 1.0);
		
		this.viewport(this.resolution.width, this.resolution.height);

		this.useShader(this.compShader);
			
		for(let i in passes) {
			const pass = passes[i];
			this.useTexture(pass.buffer, pass.id + "Buffer", i);
		}

		this.gl.uniform1f(this.compShader.uniforms.aspectRatio, 
			this.width / this.height * 
			this.resolution.width / this.resolution.height);

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

	drawScene(scene, camera, filter) {
		camera = camera || scene.camera;
		const objects = scene.objects;
		const shader = this.currentShader;

		this.gl.uniformMatrix4fv(shader.uniforms.uProjMatrix, false, camera.projMatrix);
		this.gl.uniformMatrix4fv(shader.uniforms.uViewMatrix, false, camera.viewMatrix);

		for(let obj of objects) {
			if(filter && filter(obj) || !filter) {
				if(obj.isLight) {
					this.drawLight(obj);
				} else {
					this.drawMesh(obj);
				}
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
