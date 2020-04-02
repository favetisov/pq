const fs = require('fs');
const glob = require('glob');
const replaceFiles = require('./file-replacements.js');
const deploy = require('./deploy.js');
const serve = require('./serve.js');
const generate = require('./generate.js');

const error = (...err) => {
  console.log('\x1b[1m\x1b[31m%s\x1b[0m', err.join(''));
  process.exit(1);
};

const [command, project, ...flags] = process.argv.slice(2);

const allowedCommands = ['s', 'serve', 'd', 'deploy', 'g', 'gen'];

if (!allowedCommands.includes(command)) {
  error(`Incorrect first argument '${command}'. One of these commands allowed: ` + allowedCommands.join(', '));
}

if (['s', 'serve'].includes(command)) {
  replaceFiles(project);
  serve(project, flags);
  process.exit(0);
} else if (['d', 'deploy'].includes(command)) {
  replaceFiles(project);
  deploy(project);
} else if (['g', 'gen'].includes(command)) {
  const [object, path] = process.argv.slice(3);
  generate(object, path);
  process.exit(0);
}
