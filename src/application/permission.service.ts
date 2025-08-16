import { Permission } from "../domain/permission";

export interface PermissionRepository {
  upsert(permissions: Permission[]): Promise<void>;
  deleteMissing(permissions: Permission[]): Promise<void>;
  findUserPermissions(
    userId: string,
    serviceName: string,
  ): Promise<Permission[]>;
}

export class PermissionService {
  private readonly permissionRepository: PermissionRepository;

  constructor(
    permissionRepository: PermissionRepository,
  ) {
    this.permissionRepository = permissionRepository;
  }

  async hasPermission(
    userId: string,
    serviceName: string,
    permissionName: string,
  ) {
    const permissions = await this.getPermissionsForService(
      userId,
      serviceName,
    );

    return permissions.some((p) => p.name === permissionName);
  }

  async updatePermissionsForService(permissions: Permission[]) {
    await this.permissionRepository.upsert(permissions);
    await this.permissionRepository.deleteMissing(permissions);
  }

  getPermissionsForService(userId: string, serviceName: string) {
    return this.permissionRepository.findUserPermissions(
      userId,
      serviceName,
    );
  }
}
