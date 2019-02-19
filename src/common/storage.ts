export default class Storage {
  protected name:string;
  protected defaultValue: any;

  constructor(name: string, defaultValue) {
    this.name = name;
    this.defaultValue = defaultValue;
  }
}
