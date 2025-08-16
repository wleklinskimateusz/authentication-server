import { NotFound } from "../domain/errors/not-found";
import { ResourceAlreadyExists } from "../domain/errors/resource-already-exists";
import type { Permission } from "../domain/permission";
import { PermissionGroup } from "../domain/permission-group";
import type { UuidGenerator } from "../domain/services/uuid-generator";

export interface PermissionGroupRepository {
    createGroup(group: PermissionGroup): Promise<void>;
    findGroupById(id: string): Promise<PermissionGroup | null>;
    findGroupByName(name: string): Promise<PermissionGroup | null>;
    updateGroup(group: PermissionGroup): Promise<void>;
    deleteGroup(id: string): Promise<void>;
    findUserGroups(userId: string): Promise<PermissionGroup[]>;
}

export class PermissionGroupService {
    private readonly permissionGroupRepository: PermissionGroupRepository;
    private readonly uuidGenerator: UuidGenerator;

    constructor(
        permissionGroupRepository: PermissionGroupRepository,
        uuidGenerator: UuidGenerator,
    ) {
        this.permissionGroupRepository = permissionGroupRepository;
        this.uuidGenerator = uuidGenerator;
    }

    async createGroup(name: string, description: string): Promise<void> {
        if (await this.permissionGroupRepository.findGroupByName(name)) {
            throw new ResourceAlreadyExists(
                `Permission group with name ${name} already exists`,
            );
        }
        const group = new PermissionGroup({
            id: this.uuidGenerator.generate(),
            name,
            description,
            permissions: [],
        });

        await this.permissionGroupRepository.createGroup(group);
    }

    async updateGroup(
        id: string,
        params: { name?: string; description?: string },
    ): Promise<void> {
        const group = await this.permissionGroupRepository.findGroupById(id);
        if (!group) {
            throw new NotFound(
                `cannot update group with id ${id}`,
            );
        }

        if (params.name) {
            group.name = params.name;
        }
        if (params.description) {
            group.description = params.description;
        }

        await this.permissionGroupRepository.updateGroup(group);
    }
    async getGroupById(id: string): Promise<PermissionGroup> {
        const group = await this.permissionGroupRepository.findGroupById(id);
        if (!group) {
            throw new NotFound(`Group with id ${id} not found`);
        }
        return group;
    }
    async getUserGroups(userId: string): Promise<PermissionGroup[]> {
        const groups = await this.permissionGroupRepository.findUserGroups(
            userId,
        );
        if (!groups || groups.length === 0) {
            throw new NotFound(
                `No permission groups found for user with id ${userId}`,
            );
        }
        return groups;
    }
    async addPermissionToGroup(
        permission: Permission,
        groupId: string,
    ): Promise<void> {
        const group = await this.permissionGroupRepository.findGroupById(
            groupId,
        );
        if (!group) {
            throw new NotFound(
                `cannot add permission to group with id ${groupId}`,
            );
        }

        group.addPermission(permission);
        await this.permissionGroupRepository.updateGroup(group);
    }

    async removePermissionFromGroup(
        permission: Permission,
        groupId: string,
    ): Promise<void> {
        const group = await this.permissionGroupRepository.findGroupById(
            groupId,
        );
        if (!group) {
            throw new NotFound(
                `cannot remove permission from group with id ${groupId}`,
            );
        }

        group.removePermission(permission);
        await this.permissionGroupRepository.updateGroup(group);
    }

    async deleteGroup(id: string): Promise<void> {
        const group = await this.permissionGroupRepository.findGroupById(id);
        if (!group) {
            throw new NotFound(
                `cannot delete group with id ${id}`,
            );
        }

        await this.permissionGroupRepository.deleteGroup(id);
    }

    async getGroupByName(name: string): Promise<PermissionGroup> {
        const group = await this.permissionGroupRepository.findGroupByName(
            name,
        );
        if (!group) {
            throw new NotFound(
                `Group with name ${name} not found`,
            );
        }
        return group;
    }
}
