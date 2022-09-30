import { atom } from 'recoil';
import { Mod } from '../models/Mod';

export const loadedModsState = atom<Mod[]>({
  key: 'loadedMods',
  default: [],
});
