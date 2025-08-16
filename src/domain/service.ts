export class Service {
  readonly id: string;
  name: string;
  description: string;
  readonly createdAt: Date;
  updatedAt: Date;
  url?: string;
  icon?: string;
  version: string;

  constructor({
    id,
    name,
    description,
    createdAt = new Date(),
    updatedAt = new Date(),
    url,
    icon,
    version = "1.0.0",
  }: {
    id: string;
    name: string;
    description: string;
    createdAt?: Date;
    updatedAt?: Date;
    url?: string;
    icon?: string;
    version?: string;
  }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.url = url;
    this.icon = icon;
    this.version = version;
  }
}
