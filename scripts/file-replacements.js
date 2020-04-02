const fs = require('fs');
const glob = require('glob');
const lodash = require('lodash');
const error = (...err) => {
  console.log('\x1b[1m\x1b[31m%s\x1b[0m', err.join(''));
  process.exit(1);
};

module.exports = function(project) {
  console.log('starting file replacement...');
  let angularFile = JSON.parse(fs.readFileSync(__dirname + '/../angular.template.json'));

  if (project == 'm') {
    const replacements = glob
      .sync('./src/app/pages/**/!(m.)*.html', {})
      .map(f => {
        let parts = f.split('/');
        return { replace: f, with: parts.slice(0, -1).join('/') + '/m.' + parts[parts.length - 1] };
      })
      .filter(f => fs.existsSync(f.with));

    if (
      !Array.isArray(
        lodash.get(angularFile, 'projects.app.architect.build.configurations.mobile-serve.fileReplacements'),
      )
    ) {
      error(`Incorrect angular.template.json configuration. Check 'scripts/file-replacements.js' for more details`);
    } else if (
      !Array.isArray(lodash.get(angularFile, 'projects.app.architect.build.configurations.production.fileReplacements'))
    ) {
      error(`Incorrect angular.template.json configuration. Check 'scripts/file-replacements.js' for more details`);
    }

    angularFile.projects.app.architect.build.configurations['mobile-serve'].fileReplacements.push(...replacements);
    angularFile.projects.app.architect.build.configurations.production.fileReplacements.push(...replacements);
  }

  fs.writeFileSync('angular.json', JSON.stringify(angularFile));
  console.log('file replacement complete');
};
