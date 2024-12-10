export const MAIN_CAMERA_NEAR = 0.1;
export const MAIN_CAMERA_FAR = 100;
export const ORTHO_CAMERA_NEAR = 0.1;
export const ORTHO_CAMERA_FAR = 1;

export const GROUND_SIZE = 80;

export const RENDER_PASS_NORMAL_METALLIC_ROUGHNESS_TEXTURE =
	"normal+metallic+roughness texture";
export const RENDER_PASS_ALBEDO_REFLECTANCE_TEXTURE =
	"albedo+reflectance texture";
export const RENDER_PASS_VELOCITY_TEXTURE = "velocity texture";
export const RENDER_PASS_DEPTH_STENCIL_TEXTURE = "depth texture";
export const RENDER_PASS_DIRECTIONAL_LIGHT_DEPTH_TEXTURE =
	"directional light depth texture";
export const RENDER_PASS_SSAO_TEXTURE = "ssao texture";
export const RENDER_PASS_SSAO_BLUR_TEXTURE = "ssao blur texture";
export const RENDER_PASS_LIGHTING_RESULT_TEXTURE = "lighting texture";
export const RENDER_PASS_TAA_RESOLVE_TEXTURE = "taa resolve texture";

export const GBUFFER_OUTPUT_TARGETS: GPUColorTargetState[] = [
	{
		format: "rgba16float",
	},
	{
		format: "bgra8unorm",
	},
	{
		format: "rg16float",
	},
];
