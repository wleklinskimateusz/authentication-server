import { Permission } from "../domain/permission";
import type { Service } from "../domain/service";
import type { UuidGenerator } from "../domain/services/uuid-generator";

export interface PermissionRepository {
  create(permission: Permission): Promise<void>;
  findById(id: string): Promise<Permission | null>;
  update(permission: Permission): Promise<void>;
  delete(id: string): Promise<void>;
  findUserPermissions(userId: string, serviceId: string): Promise<Permission[]>;
}

export class PermissionService {
  private readonly permissionRepository: PermissionRepository;
  private readonly uuidGenerator: UuidGenerator;

  constructor(
    permissionRepository: PermissionRepository,
    uuidGenerator: UuidGenerator,
  ) {
    this.permissionRepository = permissionRepository;
    this.uuidGenerator = uuidGenerator;
  }

  async createPermission(params: {
    name: string;
    service: Service;
    description: string;
  }) {
    const permission = new Permission({
      id: this.uuidGenerator.generate(),
      name: params.name,
      service: params.service,
      description: params.description,
    });

    await this.permissionRepository.create(permission);

    return permission;
  }

  async updatePermission(
    id: string,
    params: {
      name?: string;
      description?: string;
    },
  ) {
    const permission = await this.permissionRepository.findById(id);

    if (!permission) {
      throw new Error(`Permission with id ${id} not found`);
    }

    if (params.name) {
      permission.name = params.name;
    }
    if (params.description) {
      permission.description = params.description;
    }

    await this.permissionRepository.update(permission);

    return permission;
  }

  async deletePermission(id: string) {
    const permission = await this.permissionRepository.findById(id);

    if (!permission) {
      throw new Error(`Permission with id ${id} not found`);
    }

    await this.permissionRepository.delete(id);
  }

  async getPermissionById(id: string) {
    const permission = await this.permissionRepository.findById(id);

    if (!permission) {
      throw new Error(`Permission with id ${id} not found`);
    }

    return permission;
  }

  async hasPermission(
    userId: string,
    serviceId: string,
    permissionName: string,
  ) {
    const permissions = await this.getPermissionsForService(userId, serviceId);

    return permissions.some((p) => p.name === permissionName);
  }

  async getPermissionsForService(userId: string, serviceId: string) {
    return this.permissionRepository.findUserPermissions(
      userId,
      serviceId,
    );
  }
}
