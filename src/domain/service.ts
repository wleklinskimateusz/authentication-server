export class Service {
  readonly id: string;
  private _name: string;
  private _description: string;
  readonly createdAt: Date = new Date();
  private _updatedAt: Date = new Date();

  constructor({
    id,
    name,
    description,
    createdAt,
    updatedAt,
  }: {
    id: string;
    name: string;
    description: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = id;
    this._name = name;
    this._description = description;
    this.createdAt = createdAt || new Date();
    this._updatedAt = updatedAt || new Date();
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

  get updatedAt(): Date {
    return this._updatedAt;
  }

  private touch() {
    this._updatedAt = new Date();
  }
}
