/****
 * OBSOLETE! USE build.js TO BUILD AND DEPLOY
 */

const execSync = require('child_process').execSync;
const fs = require('fs');
const readline = require('readline');
const moment = require('moment');

const exec = cmd => execSync(cmd, { stdio: [0, 1, 2] });
const writeJSON = (filename, content) => fs.writeFileSync(filename, JSON.stringify(content));
const readJSON = filename => JSON.parse(fs.readFileSync(filename));
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const error = (...err) => {
  console.log('\x1b[1m\x1b[31m%s\x1b[0m', err.join(''));
  process.exit(1);
};

module.exports = function(project) {
  const sshConfigFilePath = __dirname + '/ssh-config.json';
  if (!fs.existsSync(sshConfigFilePath))
    writeJSON(sshConfigFilePath, {
      sshKeyPath: '',
      server: '',
      comment: 'specify path to ssh key (user deploy) and server ssh alias (with ip and port preset)',
    });

  const { sshKeyPath, server } = readJSON(sshConfigFilePath);
  if (!sshKeyPath || !server) error('Ssh config not set. Please  set it up in file "ssh-config.json"');

  const versionPath = __dirname + '/release-version.json';
  if (!fs.existsSync(versionPath)) writeJSON(versionPath, { APP: '0.0.0' });
  const currentVersion = readJSON(versionPath).APP;

  rl.question(`Set release version: (current is ${currentVersion}) `, version => {
    rl.close();

    let config = readJSON(__dirname + '/deploy-config.json');
    config.APP_VERSION = version;
    config.APP_RELEASE_DATE = moment().format('X');
    writeJSON(__dirname + '/../src/app.config.json', config);

    exec(`ng build --prod --build-optimizer --baseHref /admin --deploy-url /admin`);
    console.log('build complete');

    const configKey = 'axl_ru';
    const projectName ='axl-admin';
    exec(`zip -r www.zip www`);
    exec(`scp -i ${sshKeyPath} www.zip deploy@${server}:/var/www/${configKey}/${projectName}/www.zip`);
    exec(
      `ssh deploy@${server} -i ${sshKeyPath} "unzip -o /var/www/${configKey}/${projectName}/www.zip -d /var/www/${configKey}/${projectName}"`,
    );
    exec(`ssh deploy@${server} -i ${sshKeyPath} "rm -f /var/www/${configKey}/${projectName}/www.zip"`);
    console.log('upload complete, congratulations!');

    writeJSON(versionPath, { APP: version });
    process.exit(0);
  });
};
