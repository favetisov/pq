export function filter(items: Array<any>, query: string, fields?: Array<string>) {
  // заменяем в строке string все элементы из find на replace
  let multireplaceString = (string: string, find: string, replace: string) => {
    for (let i = 0; i < find.length; i++) {
      let regExp = new RegExp(find[i], 'g');
      string = string.replace(regExp, replace[i]);
    }
    return string;
  };

  //удаляем всякие спецсимволы
  let simplifyString = (string: string) => {
    string = string + '';
    return multireplaceString(
      string.toLowerCase(),
      'ёáàâãäåèéêëìíîïñòóôõöùúûüýÿ',
      'еaaaaaaeeeeiiiinooooouuuuyy',
    ).replace(/\s\s+/g, ' ');
  };

  if (!query) return items; // фильтр пустой, значит все подходят

  let queries = simplifyString(query).split(' ');

  let checkWholeItem = function (item) {
    for (let q of queries) {
      if (!checkPart(q, item)) {
        return false;
      } //каждая из частей запроса должна входить хотя бы в одну из частей элемента
    }
    return true;
  };

  let checkPart = function (value, item) {
    let parts = [];
    if (fields) {
      for (let field of fields) {
        let part = item;
        for (let f of field.split('.')) {
          if (!part[f]) {
            part = '';
            break;
          } else {
            part = part[f];
          }
        }
        parts.push(part);
      }
    } else {
      //фильтруем массив простых элементов
      parts.push(item);
    }
    for (let p of parts) {
      if (simplifyString(p).indexOf(value) !== -1) {
        return true;
      }
    }

    return false;
  };

  let result = [];
  for (let item of items) {
    if (checkWholeItem(item)) {
      result.push(item);
    }
  }

  return result;
}
