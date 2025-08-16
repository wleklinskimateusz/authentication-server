export class Service {
  readonly id: string;
  private _name: string;
  private _description: string;
  readonly createdAt: Date = new Date();
  private _updatedAt: Date = new Date();
  private _url?: string;
  private _icon?: string;
  private _version: string;

  constructor({
    id,
    name,
    description,
    createdAt,
    updatedAt,
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
    this._name = name;
    this._description = description;
    this.createdAt = createdAt || new Date();
    this._updatedAt = updatedAt || new Date();
    this._url = url;
    this._icon = icon;
    this._version = version;
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

  get url(): string | undefined {
    return this._url;
  }

  set url(value: string | undefined) {
    this._url = value;
    this.touch();
  }

  get icon(): string | undefined {
    return this._icon;
  }

  set icon(value: string | undefined) {
    this._icon = value;
    this.touch();
  }

  get version(): string {
    return this._version;
  }

  set version(value: string) {
    this._version = value;
    this.touch();
  }

  private touch() {
    this._updatedAt = new Date();
  }
}
