export class Id {
  public readonly value: string;

  constructor(parameters: { id: string }) {
    this.value = parameters.id;
    Object.freeze(this);
  }
}
