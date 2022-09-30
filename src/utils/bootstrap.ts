import { getModsmithConfigDir, getConfigFilePath, getProfilesDir } from './pathUtils';
import { exists, createDir } from '@tauri-apps/api/fs';

export const bootstrap = async () => {
  const modsmithConfigDirExists: boolean = (await exists(await getModsmithConfigDir())) as unknown as boolean;
  if (!modsmithConfigDirExists) {
    console.log('Creating modsmithConfigDir...');
    await createDir(await getModsmithConfigDir(), { recursive: true });
  }

  const profileJsonExists: boolean = (await exists(await getConfigFilePath())) as unknown as boolean;
  if (!profileJsonExists) {
    console.log('Creating config.json...');
  }

  const profilesDirectoryExists: boolean = (await exists(await getProfilesDir())) as unknown as boolean;
  if (!profilesDirectoryExists) {
    console.log('Creating profilesDirectory...');
    await createDir(await getProfilesDir(), { recursive: true });
  }
};
