const execSync = require('child_process').execSync;

module.exports = function(project, flags) {
  const PORT = project == 'm' ? '4200' : '4201';
  const CONF = project == 'm' ? 'mobile-serve' : '';

  const command = `ng s --open --port ${PORT} -c ${CONF} ${flags.join(' ')}`;
  execSync(command, { stdio: [0, 1, 2] });
};
