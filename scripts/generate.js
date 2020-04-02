const error = (...err) => {
  console.log('\x1b[1m\x1b[31m%s\x1b[0m', err.join(''));
  process.exit(1);
};
const fs = require('fs');
const execSync = require('child_process').execSync;
const nodePath = require('path');

module.exports = function(object, path) {
  const interpolate = (contents, fileName) => {
    contents = contents.replace(new RegExp('__fileName__', 'g'), fileName);

    const camelName = fileName.split('-').reduce((result, part, index) => {
      if (index == 0) return result + part;
      return result + part.charAt(0).toUpperCase() + part.slice(1);
    }, '');

    const className = fileName.split('-').reduce((result, part) => {
      return result + part.charAt(0).toUpperCase() + part.slice(1);
    }, '');

    contents = contents.replace(new RegExp('__className__', 'g'), className);
    contents = contents.replace(new RegExp('__camelName__', 'g'), camelName);

    return contents;
  };

  const createFiles = (template, rootPath, filePrefix) => {
    let templatesPath = __dirname + '/schematics/' + template;

    for (let templateFileName of fs.readdirSync(templatesPath)) {
      const fileName = templateFileName.replace('__name__', filePrefix);
      const filePath = rootPath + '/' + fileName;
      let contents = fs.readFileSync(templatesPath + '/' + templateFileName).toString();

      contents = interpolate(contents, filePrefix);

      if (fs.existsSync(filePath)) error(`file ${nodePath.normalize(filePath)} already exists!`);
      console.log('CREATED: ', nodePath.normalize(filePath));
      fs.writeFileSync(filePath, contents);
      execSync('git add ' + filePath);
    }
  };

  if (['p', 'page'].includes(object)) {
    let rootPath = __dirname + '/../src/app/pages/' + path;
    if (fs.existsSync(rootPath)) error(`directory ${rootPath} already exists!`);
    fs.mkdirSync(rootPath, { recursive: true });
    createFiles('page', rootPath, rootPath.split('/').pop());
  } else if (['c', 'component'].includes(object)) {
    if (path.includes('/')) {
      let rootPath = __dirname + '/../src/app/pages/' + path;
      if (fs.existsSync(rootPath)) error(`directory ${rootPath} already exists!`);
      fs.mkdirSync(rootPath, { recursive: true });
      createFiles('component', rootPath, rootPath.split('/').pop());
    } else {
      let rootPath = __dirname + '/../src/app/components/'+path;
      fs.mkdirSync(rootPath, { recursive: true });
      //todo - add import to sharedComponents module
      console.log(
        '\x1b[33m%s\x1b[0m',
        'Component import to shared-components.module not implemented yet. Please do it manually',
      );
      createFiles('component', rootPath, rootPath.split('/').pop());
    }
  } else if (['s', 'service'].includes(object)) {
    rootPath = __dirname + '/../src/app/services/';
    createFiles('service', rootPath, path);
  } else if (['m', 'model'].includes(object)) {
    rootPath = __dirname + '/../src/app/models/';
    createFiles('model', rootPath, path);
  } else {
    error(`Incorrect object type '${object}'. Please check scripts/generate.js for details`);
  }
};
