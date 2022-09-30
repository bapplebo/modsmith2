import { Profile } from './../models/Profile';
import { atom } from 'recoil';
import { FileEntry } from '@tauri-apps/api/fs';

export const profilesState = atom<FileEntry[]>({
  key: 'profiles',
  default: [],
});

export const selectedProfileState = atom<Profile | null>({
  key: 'selectedprofile',
  default: null,
});
