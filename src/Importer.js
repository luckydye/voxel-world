import { Material } from "./gl/graphics/Material.js";
import { Resources } from "./gl/Resources.js";
import { Texture } from "./gl/graphics/Texture.js";
import { Logger } from "./Logger.js";
import { Geometry } from "./gl/scene/Geometry.js";
import { VertexBuffer } from "./gl/graphics/VertexBuffer.js";

const logger = new Logger('Importer');

export class Importer {

    static createModelFromFile(resource) {
        const data = Resources.get(resource);

        const geo = new Geometry();
        geo.createBuffer = () => {
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
            vertxBuffer.type = "TRIANGLES";
            vertxBuffer.attributes = [
                { size: 3, attribute: "aPosition" },
                { size: 3, attribute: "aTexCoords" }
            ]
            return vertxBuffer;
        }
        geo.scale = 50;
        geo.position.y = -400;

        return geo;
    }

    static importMatFromJson(name, json) {
        const mat = Material.create(name);

        Object.assign(mat, json);

        if(json.texture) {
            const texImage = Resources.get(json.texture);
            const texture = new Texture(texImage);
            mat.texture = texture;

            if(!texImage) {
                logger.error('could not find texture on Material', name);
            }
        }

        if(json.reflectionMap) {
            const reflectionImage = Resources.get(json.reflectionMap);
            const reflectionTexture = new Texture(reflectionImage);
            mat.reflectionMap = reflectionTexture;

            if(!reflectionImage) {
                logger.error('could not find reflectionMap on Material', name);
            }
        }

        if(json.displacementMap) {
            const displacementImage = Resources.get(json.displacementMap);
            const displacementMap = new Texture(displacementImage);
            mat.displacementMap = displacementMap;

            if(!displacementImage) {
                logger.error('could not find displacementMap on Material', name);
            }
        }

        return mat;
    }

}
