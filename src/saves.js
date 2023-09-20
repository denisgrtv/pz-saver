const { homedir } = require('node:os');
const { join, parse } = require('path');
const { promises } = require('fs');
const { DateTime } = require('luxon');
const ms = require('millisecond');

const defaultDir = join(homedir(), 'Zomboid', 'Saves');
const defaultBackupDir = join(homedir(), 'Zomboid', 'Backups');
const defaultInterval = '5min';

const getSavesPatches = async (rootDir = defaultDir) => {
  const modesDir = await promises.readdir(rootDir);
  const savesPatches = await Promise.all(modesDir.map(async (dir) => {
    const folderPath = join(rootDir, dir);
    const stat = await promises.lstat(folderPath);
    if (stat.isFile()) return folderPath;
    const savesDirs = await promises.readdir(folderPath);
    return savesDirs.map((i) => join(folderPath, i));
  }));

  return savesPatches.flatMap((i) => i);
};

const getBackups = async (dir = defaultBackupDir) => {
  await promises.mkdir(dir, { recursive: true });
  const backups = await getSavesPatches(dir);
  return backups;
};

const deleteBackup = async (id, dir = defaultBackupDir) => {
  const backups = await getBackups(dir);
  const path = backups[id];
  if (!path) throw new Error('backup not found');
  await promises.rm(path, { recursive: true });
};

const createBackup = async (saveId = 0, backupDir = defaultBackupDir, maxBackups = 0) => {
  const saves = await getSavesPatches();
  const dirToBackup = saves[saveId];
  if (!dirToBackup) throw new Error('save not exists');

  const parsedSave = parse(dirToBackup);
  const parsedMode = parse(parsedSave.dir);
  const fullBackupPath = join(backupDir, parsedMode.name, `${parsedSave.name}_backup_${DateTime.now().toFormat('yyyy-MM-dd_HH-mm-ss')}`);
  await promises.cp(dirToBackup, fullBackupPath, { recursive: true });

  if (maxBackups) {
    const backups = await getBackups();
    if (maxBackups < backups.length) {
      const backupsWithIds = backups.sort().map((value, id) => ({ id, value }));
      const saveBackups = backupsWithIds.filter((i) => i.value.indexOf(parsedSave.name));
      const idsToDelete = saveBackups.slice(0, backups.length - maxBackups).map(({ id }) => id);
      await Promise.all(idsToDelete.map((i) => deleteBackup(i, backupDir)));
    }
  }

  return fullBackupPath;
};

const restoreBackup = async (id, backupDir = defaultBackupDir, savesDir = defaultDir) => {
  const backups = await getBackups(backupDir);
  const backupPath = backups[id];
  if (!backupPath) throw new Error('backup not found');

  const parsedBackupPath = parse(backupPath);
  const [saveName] = parsedBackupPath.name.split('_backup_');
  const parsedModePath = parse(parsedBackupPath.dir);

  const fullSavePath = join(savesDir, parsedModePath.name, saveName);

  try {
    await promises.rm(fullSavePath, { recursive: true });
  } catch (ex) { /* empty */ }
  await promises.mkdir(fullSavePath, { recursive: true });
  await promises.cp(backupPath, fullSavePath, { recursive: true });

  return backupPath;
};

const watchSaves = (
  saveId = 0,
  interval = defaultInterval,
  backupDir = defaultBackupDir,
  savesDir = defaultDir,
  maxBackups = 0,
) => {
  let lastTimeout;
  let running = false;

  const stop = () => {
    running = false;
    if (lastTimeout) clearTimeout(lastTimeout);
  };

  const saveLoop = async () => {
    if (!running) return;
    const path = await createBackup(saveId, backupDir, maxBackups);
    console.log(`Backup created: ${path}`);
    lastTimeout = setTimeout(() => saveLoop(), ms(interval));
  };

  const start = async () => {
    const saves = await getSavesPatches(savesDir);
    const saveDir = saves[saveId];
    if (!saveDir) throw new Error('Save not exists');

    running = true;
    saveLoop();
  };

  return {
    start,
    stop,
  };
};

module.exports = {
  getSavesPatches,
  createBackup,
  getBackups,
  deleteBackup,
  restoreBackup,
  watchSaves,
  defaultDir,
  defaultBackupDir,
  defaultInterval,
};
