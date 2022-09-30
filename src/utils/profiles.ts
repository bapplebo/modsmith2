import { readDir } from '@tauri-apps/api/fs';
import { getProfilesDir } from './pathUtils';

export const loadProfiles = async () => {
  const profilesDir = await getProfilesDir();
  const profiles = await readDir(profilesDir);
  return profiles;
};

export const saveProfile = async () => {};

export const deleteProfile = async () => {};
