import PipelineStates from "../../renderer/core/PipelineStates";
import RenderPass from "../../renderer/core/RenderPass";
import RenderingContext from "../../renderer/core/RenderingContext";
import Scene from "../../renderer/scene/Scene";
import { RenderPassType } from "../../renderer/types";

import {
	TAA_RESOLVE_FRAGMENT_SHADER_ENTRY_NAME,
	TAA_RESOLVE_FRAGMENT_SHADER_SRC,
} from "../shaders/TAAResolveShader";
import {
	FULLSCREEN_TRIANGLE_VERTEX_SHADER_ENTRY_NAME,
	FULLSCREEN_TRIANGLE_VERTEX_SHADER_SRC,
} from "../shaders/VertexShader";

export default class TAAResolveRenderPass extends RenderPass {
	private outTexture: GPUTexture;
	private outTextureView: GPUTextureView;

	private historyTexture: GPUTexture;
	private historyTextureView: GPUTextureView;

	private sourceCopyTextureInfo: GPUTexelCopyTextureInfo;
	private destCopyTextureInfo: GPUTexelCopyTextureInfo;
	private copyTextureExtend: GPUExtent3DStrict;

	private renderPSO: GPURenderPipeline;
	private texturesBindGroupLayout: GPUBindGroupLayout;

	private textureBindGroup: GPUBindGroup;

	constructor() {
		super(RenderPassType.TAAResolve);

		const vertexShaderModule = PipelineStates.createShaderModule(
			FULLSCREEN_TRIANGLE_VERTEX_SHADER_SRC,
		);
		const fragmentShaderModule = PipelineStates.createShaderModule(
			TAA_RESOLVE_FRAGMENT_SHADER_SRC,
		);

		const targets: GPUColorTargetState[] = [
			{
				format: "rgba16float",
			},
		];

		const texturesBindGroupLayoutEntries: GPUBindGroupLayoutEntry[] = [
			{
				binding: 0,
				visibility: GPUShaderStage.FRAGMENT,
				texture: {},
			},
			{
				binding: 1,
				visibility: GPUShaderStage.FRAGMENT,
				texture: {},
			},
			{
				binding: 2,
				visibility: GPUShaderStage.FRAGMENT,
				texture: {},
			},
		];

		this.texturesBindGroupLayout =
			RenderingContext.device.createBindGroupLayout({
				label: "TAA Resolve Input Textures Bind Group",
				entries: texturesBindGroupLayoutEntries,
			});

		const renderPSODescriptor: GPURenderPipelineDescriptor = {
			layout: RenderingContext.device.createPipelineLayout({
				bindGroupLayouts: [this.texturesBindGroupLayout],
			}),
			vertex: {
				module: vertexShaderModule,
				entryPoint: FULLSCREEN_TRIANGLE_VERTEX_SHADER_ENTRY_NAME,
			},
			fragment: {
				module: fragmentShaderModule,
				entryPoint: TAA_RESOLVE_FRAGMENT_SHADER_ENTRY_NAME,
				targets,
			},
			primitive: {
				topology: "triangle-list",
				cullMode: "back",
			},
		};

		this.renderPSO = PipelineStates.createRenderPipeline(renderPSODescriptor);
	}

	public override onResize(width: number, height: number): void {
		if (this.outTexture) {
			this.outTexture.destroy();
		}

		this.outTexture = RenderingContext.device.createTexture({
			dimension: "2d",
			format: "rgba16float",
			mipLevelCount: 1,
			sampleCount: 1,
			size: { width, height, depthOrArrayLayers: 1 },
			usage:
				GPUTextureUsage.RENDER_ATTACHMENT |
				GPUTextureUsage.TEXTURE_BINDING |
				GPUTextureUsage.STORAGE_BINDING |
				GPUTextureUsage.COPY_SRC,
			label: "TAA Resolve Texture",
		});
		this.outTextureView = this.outTexture.createView();

		this.sourceCopyTextureInfo = {
			texture: this.outTexture,
			mipLevel: 0,
			origin: { x: 0, y: 0, z: 0 },
		};

		if (this.historyTexture) {
			this.historyTexture.destroy();
		}

		this.historyTexture = RenderingContext.device.createTexture({
			dimension: "2d",
			format: "rgba16float",
			mipLevelCount: 1,
			sampleCount: 1,
			size: { width, height, depthOrArrayLayers: 1 },
			usage:
				GPUTextureUsage.RENDER_ATTACHMENT |
				GPUTextureUsage.TEXTURE_BINDING |
				GPUTextureUsage.COPY_DST,
			label: "TAA Resolve Texture",
		});
		this.historyTextureView = this.historyTexture.createView();

		this.destCopyTextureInfo = {
			texture: this.historyTexture,
			mipLevel: 0,
			origin: { x: 0, y: 0, z: 0 },
		};

		this.copyTextureExtend = {
			width,
			height,
			depthOrArrayLayers: 1,
		};
	}

	protected override createRenderPassDescriptor(): GPURenderPassDescriptor {
		const renderPassColorAttachments: GPURenderPassColorAttachment[] = [
			{
				view: this.outTextureView,
				loadOp: "load",
				storeOp: "store",
			},
		];
		return this.augmentRenderPassDescriptorWithTimestampQuery({
			label: "TAA Resolve Pass",
			colorAttachments: renderPassColorAttachments,
		});
	}

	public override render(
		commandEncoder: GPUCommandEncoder,
		_scene: Scene,
		inputs: GPUTexture[],
	): GPUTexture[] {
		if (!this.inputTextureViews.length) {
			this.inputTextureViews.push(inputs[0].createView());
			this.inputTextureViews.push(inputs[1].createView());

			const texturesBindGroupEntries: GPUBindGroupEntry[] = [
				{
					binding: 0,
					resource: this.inputTextureViews[0],
				},
				{
					binding: 1,
					resource: this.inputTextureViews[1],
				},
				{
					binding: 2,
					resource: this.historyTextureView,
				},
			];

			this.textureBindGroup = RenderingContext.device.createBindGroup({
				layout: this.texturesBindGroupLayout,
				entries: texturesBindGroupEntries,
			});
		}
		const renderPassdescriptor = this.createRenderPassDescriptor();
		const renderPassEncoder =
			commandEncoder.beginRenderPass(renderPassdescriptor);

		RenderingContext.setActiveRenderPass(this.type, renderPassEncoder);

		RenderingContext.bindRenderPSO(this.renderPSO);
		renderPassEncoder.setBindGroup(0, this.textureBindGroup);
		renderPassEncoder.draw(3);
		renderPassEncoder.end();

		commandEncoder.copyTextureToTexture(
			this.sourceCopyTextureInfo,
			this.destCopyTextureInfo,
			this.copyTextureExtend,
		);

		this.resolveTiming(commandEncoder);

		return [this.outTexture];
	}
}
