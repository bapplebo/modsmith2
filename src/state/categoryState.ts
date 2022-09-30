import { atom } from 'recoil';

export const categoryState = atom<Record<string, string[]>>({
  key: 'categories',
  default: {},
});
