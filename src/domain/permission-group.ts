import type { Permission } from "./permission";

export class PermissionGroup {
  readonly id: string;
  private _name: string;
  private _description: string;
  private _permissions: Permission[];
  readonly createdAt: Date = new Date();
  private _updatedAt: Date = new Date();

  constructor({
    id,
    name,
    description,
    permissions,
    createdAt,
    updatedAt,
  }: {
    id: string;
    name: string;
    description: string;
    permissions: Permission[];
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = id;
    this._name = name;
    this._description = description;
    this._permissions = permissions;
    this.createdAt = createdAt || new Date();
    this._updatedAt = updatedAt || new Date();
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
    this._updatedAt = new Date();
  }

  get description(): string {
    return this._description;
  }
  set description(value: string) {
    this._description = value;
    this._updatedAt = new Date();
  }

  addPermission(permission: Permission) {
    if (!this._permissions.find((p) => p.id === permission.id)) {
      this._permissions.push(permission);
    }
    this._updatedAt = new Date();
  }

  removePermission(permissionId: string) {
    this._permissions = this._permissions.filter((p) => p.id !== permissionId);
    this._updatedAt = new Date();
  }

  hasPermission(permissionName: string): boolean {
    return this._permissions.some((p) => p.name === permissionName);
  }

  get permissions(): Permission[] {
    return [...this._permissions];
  }
}
