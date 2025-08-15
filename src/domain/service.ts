export class Service {
  readonly id: string;
  readonly name: string;
  readonly description: string;

  constructor({
    id,
    name,
    description,
  }: {
    id: string;
    name: string;
    description: string;
  }) {
    this.id = id;
    this.name = name;
    this.description = description;
  }
}
