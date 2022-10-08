import { readDir, writeFile } from '@tauri-apps/api/fs';
import { join } from '@tauri-apps/api/path';
import { Mod } from '../models/Mod';
import { getProfilesDir } from './pathUtils';

export const saveProfile = async (profileName: string, mods: Mod[]) => {
  const profile = {
    Name: profileName,
    Mods: mods.map((mod) => {
      return {
        SteamId: mod.modId,
        Filename: mod.filename,
        Name: mod.title,
      };
    }),
  };

  const profilesDir = await getProfilesDir();
  const newFilePath = await join(profilesDir, `${profileName}.json`);

  await writeFile(newFilePath, JSON.stringify(profile));
};

export const loadProfiles = async () => {
  // todo - call rust, sort by last modified order
  const profilesDir = await getProfilesDir();
  const profiles = await readDir(profilesDir);
  return profiles;
};

export const deleteProfile = async () => {};
