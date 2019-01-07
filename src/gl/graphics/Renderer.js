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
import { Geometry } from '../scene/Geometry.js';
import { VertexBuffer } from './VertexBuffer.js';

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
		this.renderPasses = [];
		
		window.addEventListener("resize", () => {
			this.updateViewport();
		});

		this.defaultMaterial = Material.create("default");
		this.defaultMaterial.texture = new Texture(Resources.get("defaulttexture"));

		this.debugPass = new RenderPass(this, 'debug', new ColorShader());

		this.renderPasses = [
			new RenderPass(this, 'color', new ColorShader()),
			new RenderPass(this, 'light', new LightShader()),
		]

        Statistics.data.passes = this.renderPasses.length;
		Statistics.data.resolution = this._resolution;

		this.gridShader = new GridShader();
		this.prepareShader(this.gridShader);

		this.compShader = new FinalShader();
		this.prepareShader(this.compShader);

		this.createDebugGeo();
	}

	createDebugGeo() {
		this.originGeo = new Geometry();
		this.originGeo.createBuffer = () => {
			const data = Resources.get('spaceship');
            const vertArray = [];
            for(let v = 0; v < data.vertecies.length; v++) {
                vertArray.push(
                    data.vertecies[v][0],
                    data.vertecies[v][1],
                    data.vertecies[v][2],
                    data.uvs[v][0],
                    data.uvs[v][1],
                );
            }
            const vertxBuffer = VertexBuffer.create(vertArray);
            vertxBuffer.type = "POINTS";
            vertxBuffer.attributes = [
                { size: 3, attribute: "aPosition" },
                { size: 2, attribute: "aTexCoords" }
            ]
            return vertxBuffer;
        }
		this.originGeo.scale = 50;
		this.originGeo.position.y = -400;
		this.originGeo.mat = this.defaultMaterial;
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
				default:
					this.drawScene(this.scene);
			}
		}

		// DEBUG RENDERPASS
		// this.debugPass.use();
		// this.useShader(this.debugPass.shader);
		// this.drawGeo(this.originGeo);

		this.clearFramebuffer();
	}

	compositePasses(passes) {
		this.useShader(this.compShader);
		this.useFrameBufferPasses(passes);
		this.drawGeo(this.screen);
	}

	useFrameBufferPasses(passes) {
		for(let i in passes) {
			const pass = passes[i];
			this.useTexture(pass.buffer, pass.id + "Buffer", i);
		}
		this.useTexture(this.getBufferTexture('depth'), "depthBuffer", passes.length);
		this.useTexture(this.getBufferTexture('debug'), "debugBuffer", passes.length+1);
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
		this.useTexture(colorTexture.gltexture, "colorTexture", 5);
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
		
		this.useShader(this.gridShader);
		this.drawGeo(this.grid);
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
