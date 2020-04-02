const execSync = require('child_process').execSync;
const fs = require('fs');
const readline = require('readline');
const moment = require('moment');

const readJSON = filename => JSON.parse(fs.readFileSync(filename));
const writeJSON = (filename, content) => fs.writeFileSync(filename, JSON.stringify(content));
const exec = cmd => execSync(cmd, { stdio: [0, 1, 2] });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const error = (...err) => {
  console.log('\x1b[1m\x1b[31m%s\x1b[0m', err.join(''));
  process.exit(1);
};

const pathToEnvFile = __dirname+'/../src/environments/environment.prod.ts';
const env = fs.readFileSync(pathToEnvFile).toString();

const foundVerStr = env.match(new RegExp('versionNumber: \'[0-9\.]*\''))[0];
const foundVerDtStr = env.match(new RegExp('versionDate: \'[0-9]*\''))[0];
const currentVersion = foundVerStr.split(' ')[1].replace(/\'/g, '');

const sshConfigFilePath = __dirname + '/ssh-config.json';
if (!fs.existsSync(sshConfigFilePath))
  writeJSON(sshConfigFilePath, {
    sshKeyPath: '',
    server: '',
    comment: 'specify path to ssh key (user deploy) and server ssh alias (with ip and port preset)',
  });
const { sshKeyPath, server, sshUser } = readJSON(sshConfigFilePath);
if (!sshKeyPath || !server) error('Ssh config not set. Please  set it up in file "ssh-config.json"');

rl.question(`Set release version: (current is ${currentVersion}) `, version => {
 fs.writeFileSync(
   pathToEnvFile,
   env.replace(foundVerStr, `versionNumber: '${version}'`).replace(foundVerDtStr, `versionDate: '${moment().format('X')}'`));
   exec('ng build --prod --build-optimizer --base-href /admin --deploy-url /admin');

  console.log('build complete');

  const projectName ='axl-admin';
  exec(`zip -r www.zip dist`);
  exec(`scp -i ${sshKeyPath} www.zip ${sshUser}@${server}:/var/www/${projectName}/www.zip`);
  exec(
    `ssh ${sshUser}@${server} -i ${sshKeyPath} "unzip -o /var/www/${projectName}/www.zip -d /var/www/${projectName}"`,
  );
  exec(`ssh ${sshUser}@${server} -i ${sshKeyPath} "rm -f /var/www/${projectName}/www.zip"`);
  console.log('upload complete, congratulations!');

  process.exit(0);
});
rl.write(currentVersion);
