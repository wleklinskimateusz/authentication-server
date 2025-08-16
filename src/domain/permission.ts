import type { Service } from "./service";

export class Permission {
  readonly id: string;
  name: string;
  readonly service: Service;
  description: string;
  readonly createdAt: Date = new Date();
  updatedAt: Date = new Date();

  constructor({
    id,
    name,
    service,
    description,
    createdAt = new Date(),
    updatedAt = new Date(),
  }: {
    id: string;
    name: string;
    service: Service;
    description: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = id;
    this.name = name;
    this.service = service;
    this.description = description;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  isEqual(
    otherPermission:
      | { serviceName: string; permissionName: string }
      | Permission,
  ) {
    if (otherPermission instanceof Permission) {
      return this.name === otherPermission.name &&
        this.service.name === otherPermission.service.name;
    }
    return this.name === otherPermission.permissionName &&
      this.service.name === otherPermission.serviceName;
  }
}
