import { NotFound } from "../domain/errors/not-found";
import { ResourceAlreadyExists } from "../domain/errors/resource-already-exists";
import type { Permission } from "../domain/permission";
import { PermissionGroup } from "../domain/permission-group";
import type { UuidGenerator } from "../domain/services/uuid-generator";

type SearchableFields = "name";

export interface PermissionGroupRepository {
    createGroup(group: PermissionGroup, userId: string): Promise<void>;
    findGroupById(id: string): Promise<PermissionGroup | null>;
    findGroupsByName(name: string): Promise<PermissionGroup[]>;
    updateGroup(group: PermissionGroup): Promise<void>;
    deleteGroup(id: string): Promise<void>;
    findUserGroups(userId: string): Promise<PermissionGroup[]>;
    addPermissionsToGroup(
        groupId: string,
        permissionIds: string[],
    ): Promise<void>;
    removePermissionsFromGroup(
        groupId: string,
        permissionIds: string[],
    ): Promise<void>;
    searchGroups(
        filters: Partial<Record<SearchableFields, string>>,
        userId: string,
    ): Promise<PermissionGroup[]>;
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

    async createGroup(
        name: string,
        description: string,
        userId: string,
    ): Promise<void> {
        const group = new PermissionGroup({
            id: this.uuidGenerator.generate(),
            name,
            description,
            permissions: [],
        });

        await this.permissionGroupRepository.createGroup(group, userId);
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

    async addPermissionsToGroup(
        groupId: string,
        permissions: Permission[],
    ): Promise<void> {
        const group = await this.permissionGroupRepository.findGroupById(
            groupId,
        );
        if (!group) {
            throw new NotFound(
                `cannot add permission to group with id ${groupId}`,
            );
        }

        await this.permissionGroupRepository.addPermissionsToGroup(
            groupId,
            permissions.map((p) => p.id),
        );
    }

    async removePermissionsFromGroup(
        groupId: string,
        permissions: Permission[],
    ): Promise<void> {
        const group = await this.permissionGroupRepository.findGroupById(
            groupId,
        );
        if (!group) {
            throw new NotFound(
                `cannot remove permission from group with id ${groupId}`,
            );
        }

        await this.permissionGroupRepository.removePermissionsFromGroup(
            groupId,
            permissions.map((p) => p.id),
        );
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

    async searchGroups(
        filters: Partial<Record<SearchableFields, string>>,
        userId: string,
    ): Promise<PermissionGroup[]> {
        const fields = Object.entries(filters).filter(([, v]) =>
            v !== undefined
        );
        if (fields.length === 0) {
            this.getUserGroups(userId);
        }
        return this.permissionGroupRepository.searchGroups(filters, userId);
    }

    async getGroupsByName(name: string): Promise<PermissionGroup[]> {
        const group = await this.permissionGroupRepository.findGroupsByName(
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
