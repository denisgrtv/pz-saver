/**
 * @typedef {import('yargs').CommandModule} CommandModule
 * @typedef {import('yargs').CommandBuilder} CommandBuilder
 */

const { printTable } = require('../print-table');
const {
  getSavesPatches,
  getBackups,
  createBackup,
  deleteBackup,
  restoreBackup,
  watchSaves,
  defaultInterval,
} = require('../saves');

const clientsCols = {
  id: { name: 'ID' },
  name: { name: 'Name' },
};

/** @type {CommandModule} */
const getDirsCommand = {
  builder: {},
  handler: async ({ s }) => {
    const saves = await getSavesPatches(s);
    printTable(saves.map((name, id) => ({ name, id })), clientsCols);
  },
};

/** @type {CommandModule} */
const saveCommand = {
  builder: {
    id: { number: true, default: 0, alias: 'i' },
    maxSaves: { number: true, default: 0, alias: 'm' },
  },
  handler: async ({ b, i, m }) => {
    await createBackup(i, b, m);
    const saves = await getBackups(b);
    printTable(saves.map((name, id) => ({ name, id })), clientsCols);
  },
};

/** @type {CommandModule} */
const getBackupsCommand = {
  builder: {},
  handler: async ({ b }) => {
    const backups = await getBackups(b);
    printTable(backups.map((name, id) => ({ name, id })), clientsCols);
  },
};

/** @type {CommandModule} */
const deleteBackupsCommand = {
  builder: {},
  handler: async ({ b, i }) => {
    await deleteBackup(i, b);
    const backups = await getBackups(b);
    printTable(backups.map((name, id) => ({ name, id })), clientsCols);
  },
};

/** @type {CommandModule} */
const restoreBackupsCommand = {
  builder: {
    id: { number: true, default: 0, alias: 'i' },
  },
  handler: async ({ b, i, s }) => {
    const backupPath = await restoreBackup(i, b, s);
    console.log(`Save ${backupPath} restored`);
  },
};

/** @type {CommandModule} */
const watchCommand = {
  builder: {
    id: { number: true, default: 0, alias: 'i' },
    interval: { string: true, default: defaultInterval, alias: 't' },
    maxSaves: {
      number: true, default: 5, alias: 'm', description: 'Maximum count of backups, 0 - disabled',
    },
  },
  handler: async ({
    b, i, s, t, m,
  }) => {
    const watcher = watchSaves(i, t, b, s, m);
    process.once('SIGINT', () => { watcher.stop(); });
    await watcher.start();
    console.log('Save files watching started. Press CTRL + C to stop');
  },
};

module.exports = {
  getDirsCommand,
  getBackupsCommand,
  saveCommand,
  deleteBackupsCommand,
  restoreBackupsCommand,
  watchCommand,
};
