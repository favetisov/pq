import { AbstractModel } from './abstract.model';

export class Team extends AbstractModel {
  _id: string;
  name: string;

  constructor(model?: Object) {
    super();
    this.map(model || {}, {});
  }
}
