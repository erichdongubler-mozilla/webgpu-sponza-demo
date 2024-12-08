import { GLTFMeshPrimitivePostprocessed } from "@loaders.gl/gltf";

import Geometry from "./Geometry";
import Renderer from "../../app/Renderer";

export default class GLTFGeometry extends Geometry {
	public firstIndex = 0;

	constructor(
		primitive: GLTFMeshPrimitivePostprocessed,
		private gpuBuffers: Map<string, GPUBuffer>,
	) {
		super();

		const positionAttrib = primitive.attributes.POSITION;
		const normalAttrib = primitive.attributes.NORMAL;
		const texCoord0Attrib = primitive.attributes.TEXCOORD_0;
		const tangentAttrib = primitive.attributes.TANGENT;

		if (!positionAttrib) {
			throw new Error("GLTF Mesh needs to have vertices array");
		}

		[positionAttrib, normalAttrib, texCoord0Attrib, tangentAttrib].forEach(
			(attrib, i) => {
				if (!attrib) {
					const buffer = Renderer.device.createBuffer({
						label: `Vertex Buffer Placeholder`,
						size: 1,
						usage: GPUBufferUsage.VERTEX,
					});
					this.vertexBufferOffsets.set(buffer, [0, 1]);

					this.vertexBuffers.push(buffer);
					return;
				}

				const attribBuffView = attrib.bufferView;
				const buffer = this.gpuBuffers.get(attribBuffView.id);
				this.vertexBuffers.push(buffer);
				this.vertexBufferOffsets.set(buffer, [0, 0]);
			},
		);

		const indicesBuffView = primitive.indices.bufferView;
		const indexBuffer = this.gpuBuffers.get(indicesBuffView.id);

		this.indexBufferOffsets[0] = primitive.indices.byteOffset;
		this.indexBufferOffsets[1] =
			primitive.indices.count * primitive.indices.bytesPerElement;
		// this.indexOffset = indicesSlot.byteOffset;
		// debugger;

		this.indexCount = primitive.indices.count;
		this.indexBuffer = indexBuffer;
	}
}
