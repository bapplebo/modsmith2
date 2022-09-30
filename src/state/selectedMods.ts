import { tableSelectionModState } from './tableSelection';
import { loadedModsState } from './loadedMods';
import { selectedProfileState } from './profiles';
import { selector } from 'recoil';
import { Mod } from '../models/Mod';

export const selectedModsState = selector<Mod[]>({
  key: 'selectedMods',
  get: ({ get }) => {
    const profile = get(selectedProfileState);
    const loadedMods = get(loadedModsState);
    const tableSelection = get(tableSelectionModState);
    const selectedMods = [];
    // Load in our profile mods. This is kinda bug prone, but will reconcile with itself if the user switches tabs
    if (profile) {
      for (const mod of loadedMods) {
        const exists = profile.Mods.some((profileMod) => profileMod.Filename === mod.filename);
        if (exists) {
          selectedMods.push(mod);
        }
      }

      return selectedMods;
    }

    // handle table selection
    for (const mod of loadedMods) {
      const exists = tableSelection.some((selectedMod: Mod) => selectedMod.filename === mod.filename);
      if (exists) {
        selectedMods.push(mod);
      }
    }

    return selectedMods;
  },
});
