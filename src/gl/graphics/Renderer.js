import { Statistics } from '../Statistics.js';
import { Plane } from '../geo/Plane.js';
import { GLContext } from './GL.js';
import FinalShader from '../shader/FinalShader.js';
import ColorShader from '../shader/ColorShader.js';
import LightShader from '../shader/LightShader.js';
import { Resources } from '../Resources.js';
import ReflectionShader from '../shader/ReflectionShader.js';
import { Grid } from '../geo/Grid.js';
import GridShader from '../shader/GridShader.js';

Resources.add({
	'defaulttexture': './resources/textures/placeholder.png',
}, false);

class RenderPass {

	get buffer() {
		return this.renderer.getBufferTexture(this.id);
	}

	get depthbuffer() {
		return this.renderer.getBufferTexture(this.id + 'Depth');
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
		this.fogEnabled = false;
		this.bloomEnabled = false;

		this.renderPasses = [
			new RenderPass(this, 'shadow', new ColorShader(), this.aspectratio, 3840, true),
			new RenderPass(this, 'light', new LightShader(), this.aspectratio, 3840),
			new RenderPass(this, 'reflection', new ReflectionShader(), this.aspectratio, this.width),
			new RenderPass(this, 'diffuse', new ColorShader(), this.aspectratio, this.width),
		]

		if(this.bloomEnabled) {
			const bloomShader = new LightShader();
			bloomShader.ambient = 0;

			this.renderPasses.push(
				new RenderPass(this, 'bloom', bloomShader, this.aspectratio, this.width)
			);
		}

		this.compShader = new FinalShader();
		this.prepareShader(this.compShader);

        Statistics.data.passes = this.renderPasses.length;
	}

	renderMultiPasses(passes) {
		for(let pass of passes) {
			pass.use();

			const lightS = this.scene.lightSources;
			
			switch(pass.id) {
				
				case "shadow":
					this.drawScene(this.scene, this.scene.lightSources, obj => {
						return obj.mat && obj.mat.castShadows;
					});
					break;

				case "light":
					this.useTexture(this.getBufferTexture('shadow'), "shadowDepthMap", 2);

					this.gl.uniformMatrix4fv(pass.shader.uniforms.lightProjViewMatrix, 
						false, lightS.projViewMatrix);

					this.drawScene(this.scene, this.scene.camera, obj => {
						return obj.mat && obj.mat.receiveShadows;
					});
					this.drawGrid();
					break;
				
				case "reflection":
					this.gl.cullFace(this.gl.FRONT);
					this.drawScene(this.scene, this.scene.camera);
					this.gl.cullFace(this.gl.BACK);
					break;

				case "diffuse":
					this.useTexture(this.getBufferTexture('reflection'), "reflectionBuffer", 2);
					this.drawScene(this.scene);
					this.drawGrid();
					break;

				case "bloom":
					this.drawScene(this.scene, this.scene.camera, obj => {
						return obj.isLight;
					});
					break;
			}
		}

		this.clearFramebuffer();
	}

	drawGrid() {

		if(!this.gridShader) {
			this.gridShader = new GridShader();
			this.prepareShader(this.gridShader);
		}
		if(!this.grid) {
			this.grid = new Grid(160, 16);
		}

		const camera = this.scene.camera;
		if(camera) {
			this.useShader(this.gridShader);
	
			this.gl.uniformMatrix4fv(this.gridShader.uniforms.uProjMatrix, false, camera.projMatrix);
			this.gl.uniformMatrix4fv(this.gridShader.uniforms.uViewMatrix, false, camera.viewMatrix);
	
			this.drawGeo(this.grid);
		}
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
		this.useTexture(this.getBufferTexture('depth'), 'depthBuffer', passes.length+1);

		this.gl.uniform1f(this.compShader.uniforms.aspectRatio, 
			this.width / this.height * 
			this.resolution.width / this.resolution.height);

		this.gl.uniform1i(this.compShader.uniforms.fog, this.fogEnabled);

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

		let lightCount = 0;
		for(let light of objects) {
			if(light.isLight) {
				this.gl.uniform3fv(shader.uniforms["pointLights["+lightCount+"].position"], [
					light.position.x,
					-light.position.y,
					light.position.z,
				]);
				this.gl.uniform3fv(shader.uniforms["pointLights["+lightCount+"].color"], light.color);
				this.gl.uniform1f(shader.uniforms["pointLights["+lightCount+"].intensity"], light.intensity);
				this.gl.uniform1f(shader.uniforms["pointLights["+lightCount+"].size"], light.size);
				lightCount++;
			}
		}

		for(let obj of objects) {
			if(filter && filter(obj) || !filter) {
				// check if obj is in view, dont render it if not
				this.drawMesh(obj);
			}
		}
	}

	drawMesh(geo) {
		const shader = this.currentShader;
		if(geo.mat) {
			this.applyMaterial(shader, geo.mat);
			this.drawGeo(geo);
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
