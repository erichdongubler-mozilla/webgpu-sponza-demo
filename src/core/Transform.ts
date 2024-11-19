import { mat4, quat, vec3 } from "gl-matrix";
import { MAT4x4_IDENTITY_MATRIX } from "../utils/math";

export class Transform {
	private _position = vec3.fromValues(0, 0, 0);
	private _rotation = vec3.fromValues(0, 0, 0);
	private _scale = vec3.fromValues(1, 1, 1);
	private _worldPosition: Float32Array;

	private translateMatrix = mat4.create();
	private scaleMatrix = mat4.create();
	private rotationMatrix = mat4.create();
	private quaterion = quat.create();
	private cachedMatrix = mat4.create();
	private worldMatrix = mat4.create();

	protected matrixNeedsUpdate = true;

	public id = self.crypto.randomUUID();
	public label = "Object";

	public visible = true;
	public parent?: Transform;
	public children: Transform[] = [];

	public get modelMatrix(): Float32Array {
		return this.worldMatrix;
	}

	public updateWorldMatrix(): boolean {
		const parentMatrix = this.parent?.worldMatrix ?? MAT4x4_IDENTITY_MATRIX;
		if (!this.matrixNeedsUpdate) {
			mat4.mul(parentMatrix, this.cachedMatrix, this.worldMatrix);
			return false;
		}

		mat4.identity(this.cachedMatrix);
		mat4.scale(this.scaleMatrix, this.scaleMatrix, this.scale);
		quat.fromEuler(
			this.quaterion,
			this.rotation[0],
			this.rotation[1],
			this.rotation[2],
		);
		mat4.fromQuat(this.rotationMatrix, this.quaterion);
		mat4.translate(this.translateMatrix, this.translateMatrix, this.position);

		mat4.identity(this.cachedMatrix);
		mat4.mul(this.cachedMatrix, this.scaleMatrix, this.rotationMatrix);
		mat4.mul(this.cachedMatrix, this.cachedMatrix, this.translateMatrix);

		mat4.mul(this.worldMatrix, parentMatrix, this.cachedMatrix);

		this.matrixNeedsUpdate = false;

		return true;
	}

	public addChild(child: Transform) {
		child.parent = this;
		this.children.push(child);
	}

	public removeChild(child: Transform) {
		this.children = this.children.filter(({ id }) => id != child.id);
		child.parent = null;
	}

	public traverse(traverseFn: (node: Transform) => {}, recursive = false) {
		traverseFn(this);
		if (recursive) {
			for (let child of this.children) {
				child.traverse(traverseFn, recursive);
			}
		}
	}

	public preRender(renderEncoder: GPURenderPassEncoder) {
		// noop
	}

	public onRender(renderEncoder: GPURenderPassEncoder) {
		// noop
	}

	public postRender(renderEncoder: GPURenderPassEncoder) {
		// noop
	}

	public render(renderEncoder: GPURenderPassEncoder) {
		if (!this.visible) {
			return;
		}
		this.preRender(renderEncoder);
		this.onRender(renderEncoder);
		this.postRender(renderEncoder);
	}

	public getWorldPosition(): Float32Array {
		this._worldPosition[0] = this.worldMatrix[12];
		this._worldPosition[1] = this.worldMatrix[13];
		this._worldPosition[2] = this.worldMatrix[14];
		return this._worldPosition;
	}

	public setPosition(x: number, y: number, z: number): this {
		this._position[0] = x;
		this._position[1] = y;
		this._position[2] = z;
		this.matrixNeedsUpdate = true;
		return this;
	}

	public setPositionX(v: number): this {
		this._position[0] = v;
		this.matrixNeedsUpdate = true;
		return this;
	}

	public setPositionY(v: number): this {
		this._position[1] = v;
		this.matrixNeedsUpdate = true;
		return this;
	}

	public setPositionZ(v: number): this {
		this._position[2] = v;
		this.matrixNeedsUpdate = true;
		return this;
	}

	public get position(): Float32Array {
		return this.getPosition();
	}

	public getPosition(): Float32Array {
		return this._position;
	}

	public getPositionX(): number {
		return this._position[0];
	}

	public getPositionY(): number {
		return this._position[1];
	}

	public getPositionZ(): number {
		return this._position[2];
	}

	public setRotation(x: number, y: number, z: number): this {
		this._rotation[0] = x;
		this._rotation[1] = y;
		this._rotation[2] = z;
		this.matrixNeedsUpdate = true;
		return this;
	}

	public setRotationX(v: number): this {
		this._rotation[0] = v;
		this.matrixNeedsUpdate = true;
		return this;
	}

	public setRotationY(v: number): this {
		this._rotation[1] = v;
		this.matrixNeedsUpdate = true;
		return this;
	}

	public setRotationZ(v: number): this {
		this._rotation[2] = v;
		this.matrixNeedsUpdate = true;
		return this;
	}

	public get rotation(): Float32Array {
		return this.getRotation();
	}

	public getRotation(): Float32Array {
		return this._rotation;
	}

	public getRotationX(): number {
		return this._rotation[0];
	}

	public getRotationY(): number {
		return this._rotation[1];
	}

	public getRotationZ(): number {
		return this._rotation[2];
	}

	public setScale(x: number, y: number, z: number): this {
		this._scale[0] = x;
		this._scale[1] = y;
		this._scale[2] = z;
		this.matrixNeedsUpdate = true;
		return this;
	}

	public setScaleX(v: number): this {
		this._scale[0] = v;
		this.matrixNeedsUpdate = true;
		return this;
	}

	public setScaleY(v: number): this {
		this._scale[1] = v;
		this.matrixNeedsUpdate = true;
		return this;
	}

	public setScaleZ(v: number): this {
		this._scale[2] = v;
		this.matrixNeedsUpdate = true;
		return this;
	}

	public get scale(): Float32Array {
		return this._scale;
	}

	public getScale(): Float32Array {
		return this._scale;
	}

	public getScaleX(): number {
		return this._scale[0];
	}

	public getScaleY(): number {
		return this._scale[1];
	}

	public getScaleZ(): number {
		return this._scale[2];
	}
}
