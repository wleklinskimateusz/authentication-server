import type { Service } from "./service";

export class Permission {
  readonly id: string;
  private _name: string;
  readonly service: Service;
  private _description: string;
  readonly createdAt: Date = new Date();
  private _updatedAt: Date = new Date();

  constructor({
    id,
    name,
    service,
    description,
    createdAt,
    updatedAt,
  }: {
    id: string;
    name: string;
    service: Service;
    description: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = id;
    this._name = name;
    this.service = service;
    this._description = description;
    this.createdAt = createdAt || new Date();
    this._updatedAt = updatedAt || new Date();
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

  get updatedAt(): Date {
    return this._updatedAt;
  }

  isEqual(
    otherPermission:
      | { serviceName: string; permissionName: string }
      | Permission,
  ) {
    if (otherPermission instanceof Permission) {
      return this._name === otherPermission.name &&
        this.service.name === otherPermission.service.name;
    }
    return this._name === otherPermission.permissionName &&
      this.service.name === otherPermission.serviceName;
  }
}
