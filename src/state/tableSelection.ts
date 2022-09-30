import { atom } from 'recoil';
import { Mod } from '../models/Mod';

export const tableSelectionState = atom({
  key: 'tableSelection',
  default: {},
});

export const tableSelectionModState = atom<Mod[]>({
  key: 'tableSelectonMod',
  default: [],
});
