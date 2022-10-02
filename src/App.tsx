import { useEffect } from 'react';
import './App.css';
import { readTextFile } from '@tauri-apps/api/fs';
import { getInstallDirectory } from './utils/pathUtils';
import { useRecoilState } from 'recoil';
import { LaunchGameButton } from './components/LaunchGameButton';
import { ModContent } from './components/ModContent';
import { ProfileBox } from './components/ProfileBox';
import { loadProfiles } from './utils/profiles';
import { profilesState } from './state/profiles';
import { useQuery } from '@tanstack/react-query';
import { retrieveModList } from './utils/workshopUtils';
import { loadedModsState } from './state/loadedMods';
import { categoryState } from './state/categoryState';
import { retrieveCategories } from './utils/categoryUtils';

function App() {
  const [_, setProfiles] = useRecoilState(profilesState);
  const [loadedMods, setLoadedMods] = useRecoilState(loadedModsState);
  const [categories, setCategories] = useRecoilState(categoryState);

  const categoryQuery = useQuery(['categories'], async () => {
    let cats = await retrieveCategories();
    return cats;
  });

  const modListQuery = useQuery(
    ['modlist', JSON.stringify(categories)],
    async () => {
      // todo - transform into our Mod.ts data structure from rust
      console.log('retrieving again');
      let modList = await retrieveModList();
      console.log(modList);
      if (!modList) {
        throw new Error('Failed to load modlist');
      }

      modList = modList.sort((a, b) => (a.filename >= b.filename ? 1 : -1));
      modList.forEach((mod) => {
        const cats = Object.entries(categories);
        cats.forEach(([category, modIdList]) => {
          if (modIdList.includes(mod.modId)) {
            console.log('Assigning category to: ', mod.filename);
            mod.category = category;
          }
        });

        if (!mod.category) {
          mod.category = 'Uncategorised';
        }
      });
      return modList;
    },
    {
      staleTime: 60 * 1000, // 60 * 1000 ms = 60 seconds,
      enabled: Object.keys(categories).length > 0,
    }
  );

  const profiles = useQuery(['profiles'], loadProfiles, {
    staleTime: 60 * 1000, // 60 * 1000 ms = 60 seconds
  });

  if (categoryQuery.data) {
    setCategories(categoryQuery.data);
  }

  if (modListQuery.data) {
    setLoadedMods(modListQuery.data);
  }

  if (profiles.data) {
    setProfiles(profiles.data);
  }

  return (
    <div className="w-full flex full-bg">
      <div
        className="sidepanel acrylic
       bg-opacity-20 bg-black"
      >
        <div className="mt-2">MODSMITH</div>
        <div className="launch-game-container space-y-3">
          <ProfileBox />
          <LaunchGameButton />
        </div>
      </div>
      <div className="w-full h-screen content">
        <ModContent />
      </div>
    </div>
  );
}

export default App;
