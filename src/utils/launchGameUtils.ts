import { fs, invoke } from '@tauri-apps/api';
import { configDir, join } from '@tauri-apps/api/path';
import { Mod } from '../models/Mod';

export const clearSymlinks = async () => {
  await invoke('delete_symlinks');
};

export const setUpSymlinks = async (selectedMods: Mod[]) => {
  await invoke('setup_symlinks', {
    filenames: selectedMods.map((mod) => ({ path: mod.filePath, filename: mod.filename })),
  });
};

export const clearUserScript = async () => {
  const configDirPath = await configDir();
  const totalWarAppDataPath = await join(configDirPath, 'The Creative Assembly', 'Warhammer3');
  const totalWarScriptPath = await join(totalWarAppDataPath, 'scripts', 'user.script.txt');
  await fs.removeFile(totalWarScriptPath).catch((e) => {
    console.error('Error clearing user script - this might be fine: ', e);
  });
};

export const writeUserScript = async (selectedMods: Mod[]) => {
  const configDirPath = await configDir();
  const totalWarAppDataPath = await join(configDirPath, 'The Creative Assembly', 'Warhammer3');
  const totalWarScriptPath = await join(totalWarAppDataPath, 'scripts', 'user.script.txt');

  await clearUserScript();

  if (selectedMods.length > 0) {
    let modList = '';
    selectedMods.forEach((mod) => {
      modList += `mod \"${mod.filename}\";\n`;
    });
    //console.log(modList);

    await fs.writeTextFile(totalWarScriptPath, modList);
  }
};
