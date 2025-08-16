import { BaseError } from "./errors/base-error";
import { Permission } from "./permission";

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
    this.touch();
  }

  get description(): string {
    return this._description;
  }

  set description(value: string) {
    this._description = value;
    this.touch();
  }

  addPermission(permission: Permission) {
    if (this._permissions.find((p) => p.isEqual(permission))) {
      throw new PermissionAlreadyAssigned();
    }
    this._permissions.push(permission);
    this.touch();
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
    this.touch();
  }

  hasPermission(permission: Parameters<Permission["isEqual"]>[0]): boolean {
    return this._permissions.some((p) => p.isEqual(permission));
  }

  get permissions(): Permission[] {
    return [...this._permissions];
  }

  private touch() {
    this._updatedAt = new Date();
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
