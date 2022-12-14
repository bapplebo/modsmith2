import { useEffect } from 'react';
import './App.css';
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
import { Titlebar } from './components/titlebar/Titlebar';
import { appWindow } from '@tauri-apps/api/window';
import { clearSymlinks, clearUserScript } from './utils/launchGameUtils';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [_, setProfiles] = useRecoilState(profilesState);
  const [loadedMods, setLoadedMods] = useRecoilState(loadedModsState);
  const [categories, setCategories] = useRecoilState(categoryState);

  useEffect(() => {
    // Clear on startup, and on cleanup
    clearUserScript();
    clearSymlinks();

    appWindow.onCloseRequested(async (event) => {
      await clearUserScript();
      await clearSymlinks();
    });
  }, []);

  // const configsMissing = useQuery(
  //   ['startup-configs'],
  //   async () => {
  //     try {
  //       const steamDir = await getInstallDirectory();
  //       const steamContentDirectory = await getSteamContentDirectory();

  //       console.log(steamDir);
  //       console.log(steamContentDirectory);
  //     } catch (e) {
  //       console.log('error', e);
  //       throw e;
  //     }
  //   },
  //   {
  //     staleTime: Infinity,
  //   }
  // );

  const categoryQuery = useQuery(['categories'], async () => {
    let cats = await retrieveCategories();
    return cats;
  });

  const minimiseWindow = () => appWindow.minimize();
  const maximiseWindow = () => appWindow.toggleMaximize();
  const close = () => appWindow.close();

  useEffect(() => {
    if (document.getElementById('titlebar-minimize')) {
      document.getElementById('titlebar-minimize')?.addEventListener('click', minimiseWindow);
    }
    if (document.getElementById('titlebar-maximize')) {
      document.getElementById('titlebar-maximize')?.addEventListener('click', maximiseWindow);
    }
    if (document.getElementById('titlebar-close')) {
      document.getElementById('titlebar-close')?.addEventListener('click', close);
    }

    return () => {
      document.getElementById('titlebar-minimize')?.removeEventListener('click', minimiseWindow);
      document.getElementById('titlebar-maximize')?.removeEventListener('click', maximiseWindow);
      document.getElementById('titlebar-close')?.removeEventListener('click', close);
    };
  }, [document]);

  const modListQuery = useQuery(
    ['modlist', JSON.stringify(categories)],
    async () => {
      // todo - transform into our Mod.ts data structure from rust
      let modList = await retrieveModList();
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
      enabled: !!categories,
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

  if (modListQuery.isError) {
    console.log(modListQuery.error);
  }

  if (categoryQuery.isError) {
    console.log(categoryQuery.error);
  }
  // todo - first time setup
  // Creating configuration files - ensure that Steam has started and Warhammer III is installed.
  // if (configsMissing.data === true) {
  //   return <div>some stuff is missing</div>;
  // }

  return (
    <div className="full-bg bg-image h-screen flex flex-col flex-nowrap">
      <Titlebar />
      <div className="relative w-full grow flex">
        <div
          className="sidepanel acrylic
       bg-opacity-20 bg-black"
        >
          <div className="mt-2">MODSMITH</div>
          <div className="launch-game-container space-y-3 ">
            <ProfileBox />
            <LaunchGameButton />
          </div>
        </div>
        <div className="relative h-full w-full content">
          {modListQuery.isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div role="status">
                <svg
                  className="inline mr-2 w-20 h-20 animate-spin text-gray-600 text-opacity-70  fill-blue-600"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          ) : (
            <ModContent />
          )}
        </div>
      </div>
      <ToastContainer
        toastClassName="bg-neutral-800 bg-opacity-20 border border-black"
        bodyClassName="bg-neutral-800 bg-opacity-30 border border-white/10"
        position="bottom-right"
        pauseOnHover={false}
        autoClose={3000}
      />
    </div>
  );
}

export default App;
