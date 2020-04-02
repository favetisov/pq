import { isNil } from 'lodash';

export abstract class AbstractModel {
  map(model: Object, customMappings: Object) {
    if (!model) return;

    for (let key in model) {
      if (!isNil(model[key])) {
        //filtering out null values
        if (customMappings[key]) {
          customMappings[key](model);
        } else {
          this[key] = model[key];
        }
      }
    }
    return this;
  }

  //receive object to store in DB
  compact() {
    const keys = Object.keys(this).filter((k) => {
      if (k == 'customMappings') return false;
      return typeof this[k] != 'function';
    });
    let data = {};
    keys.forEach((k) => {
      data[k] = this[k] && this[k].compact ? this[k].compact() : this[k];
    });
    return data;
  }
}
