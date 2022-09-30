import { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { profilesState, selectedProfileState } from '../../state/profiles';
import Dialog from '@reach/dialog';
import '@reach/dialog/styles.css';
import { selectedModsState } from '../../state/selectedMods';
import { writeFile } from '@tauri-apps/api/fs';
import { getProfilesDir } from '../../utils/pathUtils';
import { join } from '@tauri-apps/api/path';
import { useQueryClient } from '@tanstack/react-query';

export const SaveProfile = () => {
  const [showModal, setShowModal] = useState(false);
  const [profiles, setProfiles] = useRecoilState(profilesState);
  const [_, setSelectedProfileToLoad] = useRecoilState(selectedProfileState);
  const [selectedProfile, setSelectedProfile] = useState<string>();
  const [profileName, setProfileName] = useState<string>();
  const selectedMods = useRecoilValue(selectedModsState);

  const queryClient = useQueryClient();

  const close = () => setShowModal(false);
  const open = () => setShowModal(true);

  const saveProfile = async () => {
    if (!profileName?.trim()) {
      return;
    }

    const profile = {
      Name: profileName,
      Mods: selectedMods.map((mod) => {
        return {
          SteamId: mod.modId,
          Filename: mod.filename,
          Name: mod.title,
        };
      }),
    };

    const profilesDir = await getProfilesDir();
    const newFilePath = await join(profilesDir, `${profileName}.json`);

    await writeFile(newFilePath, JSON.stringify(profile));
    queryClient.invalidateQueries(['profiles']);
    close();
  };

  useEffect(() => {
    if (selectedProfile) {
      setProfileName(selectedProfile.split('.json')[0]);
    }
  }, [selectedProfile]);

  return (
    <>
      <Dialog className="p-3 w-96 shadow-lg bg-neutral-800" isOpen={showModal} onDismiss={close}>
        <div className="p-1 text-base">Save profile</div>
        <div className="p-1 text-sm">
          Enter a profile name to save. Using the same name will overwrite an existing profile.
        </div>
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
        <input
          onChange={(e) => setProfileName(e.target.value)}
          className="mb-2 rounded p-2 w-full"
          placeholder="Enter a profile name..."
          value={profileName}
        />
        <div className="flex justify-between">
          <button className="w-1/3" onClick={saveProfile}>
            Save
          </button>
          <button className="w-1/3" onClick={close}>
            Close
          </button>
        </div>
      </Dialog>
      <button className="w-full" onClick={open}>
        Save profile
      </button>
    </>
  );
};
