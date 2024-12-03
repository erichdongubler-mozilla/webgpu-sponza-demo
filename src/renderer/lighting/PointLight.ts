import { Vec3, vec3 } from "wgpu-matrix";
import Light, { LightType, LightTypeToShaderType } from "./Light";

export default class PointLight extends Light {
	private _radius: number;
	public get radius(): number {
		return this._radius;
	}

	public set radius(v: number) {
		this._radius = v;
		this.lightsStorageView.set({
			radius: v,
		});
	}

	constructor() {
		super(LightType.Point);

		this.intensity = 1;
		this.radius = 1;
	}
}