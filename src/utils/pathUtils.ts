import { WARHAMMER_3_ID } from './constants';
import { invoke } from '@tauri-apps/api';
import { configDir, join } from '@tauri-apps/api/path';

export const getInstallDirectory = async () => invoke('get_install_dir');

export const steamContentDirectory = async () => {
  const installDirectory = (await getInstallDirectory()) as unknown as string;
  const steamContentDirectory = await join(
    `${installDirectory.split('common')[0]}`,
    'workshop',
    'content',
    WARHAMMER_3_ID.toString()
  );
  return steamContentDirectory;
};

export const getModsmithConfigDir = async () => {
  const configDirPath = await configDir();
  const path = await join(configDirPath, 'modsmith');
  return path;
};

export const getConfigFilePath = async () => {
  const modsmithConfigDir = await getModsmithConfigDir();
  const path = await join(modsmithConfigDir, 'config.json');
  return path;
};

export const getProfilesDir = async () => {
  const modsmithConfigDir = await getModsmithConfigDir();
  const path = await join(modsmithConfigDir, 'profiles', 'Warhammer3');
  return path;
};
