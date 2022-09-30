import { invoke } from '@tauri-apps/api';
import { Command } from '@tauri-apps/api/shell';
import React, { useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Mod } from '../models/Mod';
import { selectedModsState } from '../state/selectedMods';
import { setUpSymlinks, writeUserScript, clearSymlinks, clearUserScript } from '../utils/launchGameUtils';
import { getInstallDirectory } from '../utils/pathUtils';

export const LaunchGameButton = () => {
  const [gameLaunched, setGameLaunched] = useState(false);
  const selectedMods = useRecoilValue(selectedModsState);

  const launchGame = async () => {
    setGameLaunched(true);

    await clearSymlinks();
    await clearUserScript();

    if (selectedMods.length > 0) {
      await setUpSymlinks(selectedMods);
      console.log('Symlinks created');
      await writeUserScript(selectedMods);
      console.log('User script written');
    }

    try {
      const installDir = await getInstallDirectory();
      const exePath = `${installDir}\\Warhammer3.exe`;

      const command = new Command(`start-warhammer-3`, ['/C', exePath]);

      command.on('close', (_data) => {
        console.log('Warhammer 3 closed');
        setGameLaunched(false);
      });

      await command.execute();
    } catch (e) {
      console.error(e);
      setGameLaunched(false);
    }
  };

  return (
    <button className="w-full" onClick={launchGame}>
      {gameLaunched ? '...' : 'Launch game'}
    </button>
  );
};
