import { NotFound } from "../domain/errors/not-found";

export interface ServiceRepository {
    create(service: Service): Promise<void>;
    findById(id: string): Promise<Service | null>;
    update(service: Service): Promise<void>;
    delete(id: string): Promise<void>;
    findByName(name: string): Promise<Service | null>;
    findAll(): Promise<Service[]>;
}
import { Service } from "../domain/service";
import type { UuidGenerator } from "../domain/services/uuid-generator";

export class ServiceService {
    constructor(
        private readonly serviceRepository: ServiceRepository,
        private readonly uuidGenerator: UuidGenerator,
    ) {}
    async createService(params: {
        name: string;
        description: string;
    }) {
        const service = new Service({
            id: this.uuidGenerator.generate(),
            name: params.name,
            description: params.description,
        });

        await this.serviceRepository.create(service);

        return service;
    }

    async updateService(
        id: string,
        params: {
            name?: string;
            description?: string;
            url?: string;
            icon?: string;
            version?: string;
        },
    ) {
        const service = await this.serviceRepository.findById(id);

        if (!service) {
            throw new NotFound(`cannot update service with id ${id}`);
        }

        if (params.name) {
            service.name = params.name;
        }
        if (params.description) {
            service.description = params.description;
        }
        if (params.url) {
            service.url = params.url;
        }
        if (params.icon) {
            service.icon = params.icon;
        }

        if (params.version) {
            service.version = params.version;
        }

        await this.serviceRepository.update(service);

        return service;
    }

    async deleteService(id: string) {
        const service = await this.serviceRepository.findById(id);

        if (!service) {
            throw new NotFound(`cannot delete service with id ${id}`);
        }

        await this.serviceRepository.delete(id);
    }

    async findServiceById(id: string): Promise<Service> {
        const service = await this.serviceRepository.findById(id);
        if (!service) {
            throw new NotFound(`Service with id ${id} not found`);
        }
        return service;
    }

    async findServiceByName(name: string): Promise<Service> {
        const service = await this.serviceRepository.findByName(name);
        if (!service) {
            throw new NotFound(`Service with name ${name} not found`);
        }
        return service;
    }

    async findAllServices(): Promise<Service[]> {
        return this.serviceRepository.findAll();
    }
}
