import { BaseError } from "./errors/base-error";
import { Permission } from "./permission";

export class PermissionGroup {
  readonly id: string;
  name: string;
  description: string;
  private _permissions: Permission[];
  readonly createdAt: Date = new Date();
  updatedAt: Date = new Date();

  constructor({
    id,
    name,
    description,
    permissions,
    createdAt = new Date(),
    updatedAt = new Date(),
  }: {
    id: string;
    name: string;
    description: string;
    permissions: Permission[];
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this._permissions = permissions;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  addPermission(permission: Permission) {
    if (this._permissions.find((p) => p.isEqual(permission))) {
      throw new PermissionAlreadyAssigned();
    }
    this._permissions.push(permission);
  }

  removePermission(
    permission: Parameters<Permission["isEqual"]>[0],
  ) {
    const oldLength = this._permissions.length;
    this._permissions = this._permissions.filter((p) =>
      !(p.isEqual(permission))
    );
    if (oldLength === this._permissions.length) {
      throw new PermissionNotFoundInGroup(
        "could not remove not exisitng permission",
      );
    }
  }

  hasPermission(permission: Parameters<Permission["isEqual"]>[0]): boolean {
    return this._permissions.some((p) => p.isEqual(permission));
  }

  get permissions(): Permission[] {
    return [...this._permissions];
  }
}

export class PermissionAlreadyAssigned extends BaseError {
  constructor(message = "this permission is already in this group") {
    super(message, 400);
    this.name = "PermissionAlreadyAssigned";
  }
}

export class PermissionNotFoundInGroup extends BaseError {
  constructor(message: string) {
    super(message, 404);
    this.name = "PermissionNotFoundInGroup";
  }
}
