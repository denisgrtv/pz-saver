const yargs = require('yargs');
const {
  getDirsCommand,
  getBackupsCommand,
  saveCommand,
  deleteBackupsCommand,
  restoreBackupsCommand,
  watchCommand,
} = require('./saves.command');
const { defaultDir, defaultBackupDir } = require('../saves');

const cliModule = yargs(process.argv.slice(2))
  .command('saves', 'List available saves', getDirsCommand)
  .command('save', 'Backups save', saveCommand)
  .command('delete', 'Deletes backup', deleteBackupsCommand)
  .command('backups', 'List available backups', getBackupsCommand)
  .command('restore', 'Restores backups', restoreBackupsCommand)
  .command('autosave', 'Makes backups with interval', watchCommand)
  .options('s', { string: true, default: defaultDir, alias: ['saves-dir'] })
  .options('b', { string: true, default: defaultBackupDir, alias: ['backups-dir'] })
  .help();

module.exports = {
  cliModule,
};
