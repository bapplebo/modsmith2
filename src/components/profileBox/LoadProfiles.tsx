import React, { useState } from 'react';
import { useRecoilState } from 'recoil';
import { profilesState, selectedProfileState } from '../../state/profiles';
import Dialog from '@reach/dialog';
import { readTextFile } from '@tauri-apps/api/fs';

import '@reach/dialog/styles.css';
import { Button } from '../generic/Button';
export const LoadProfiles = () => {
  const [showModal, setShowModal] = useState(false);
  const [profiles, setProfiles] = useRecoilState(profilesState);
  const [_, setSelectedProfileToLoad] = useRecoilState(selectedProfileState);
  const [selectedProfile, setSelectedProfile] = useState<string>();

  const close = () => setShowModal(false);
  const open = () => setShowModal(true);

  const loadProfile = async () => {
    const profileToLoad = profiles.find((profile) => profile.name === selectedProfile);
    if (!profileToLoad) {
      return;
    }

    const profileInfoRaw = await readTextFile(profileToLoad.path);
    const profileInfo = JSON.parse(profileInfoRaw);
    setSelectedProfileToLoad(profileInfo);
    close();
  };

  return (
    <>
      <Dialog className="p-3 w-96 shadow-lg bg-neutral-800" isOpen={showModal} onDismiss={close}>
        <div className="p-1 text-base">Load profile</div>
        <div className="mb-2 border-b border-neutral-600" />
        <div className="bg-neutral-900 rounded mb-2 overflow-y-auto h-96">
          {profiles.map((profile, i) => {
            return (
              <div
                key={i}
                className={`select-none p-1 px-2 cursor-pointer ${
                  selectedProfile === profile.name ? 'bg-neutral-700' : ''
                }`}
                onClick={() => setSelectedProfile(profile.name)}
              >
                {profile.name?.split('.json')[0]}
              </div>
            );
          })}
        </div>
        <div className="flex justify-between">
          <button className="w-1/3" onClick={loadProfile}>
            Load
          </button>
          <button className="w-1/3" onClick={close}>
            Close
          </button>
        </div>
      </Dialog>
      <Button className="w-full" onClick={open}>
        Load profile
      </Button>
    </>
  );
};
