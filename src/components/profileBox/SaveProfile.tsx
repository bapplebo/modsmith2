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
import { Button } from '../generic/Button';
import { saveProfile } from '../../utils/profiles';
import { toast } from 'react-toastify';

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

  const saveProfileClicked = async () => {
    if (!profileName?.trim()) {
      return;
    }

    await saveProfile(profileName, selectedMods);

    queryClient.invalidateQueries(['profiles']);
    toast(`Saved profile: ${profileName}`);
    close();
  };

  useEffect(() => {
    if (selectedProfile) {
      setProfileName(selectedProfile.split('.json')[0]);
    }
  }, [selectedProfile]);

  return (
    <>
      <Dialog
        className="rounded-md p-3 w-96 shadow-lg bg-neutral-800 bg-opacity-30 border border-white/10 backdrop-blur"
        isOpen={showModal}
        onDismiss={close}
      >
        <div className="p-1 text-base">Save profile</div>
        <div className="p-1 text-sm">
          Enter a profile name to save. Using the same name will overwrite an existing profile.
        </div>
        <div className="mb-2 border-b border-neutral-600" />
        <div className="bg-neutral-900 rounded mb-2 overflow-y-auto h-48">
          {profiles.map((profile, i) => {
            const profileName = profile.name?.split('.json')[0];
            if (profileName === 'Last used mods') {
              return <></>;
            }

            return (
              <div
                key={i}
                className={`select-none p-1 px-2 cursor-pointer ${
                  selectedProfile === profile.name ? 'bg-neutral-700' : ''
                }`}
                onClick={() => setSelectedProfile(profile.name)}
              >
                {profileName}
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
          <Button onClick={saveProfileClicked}>Save</Button>
          <Button variant="secondary" onClick={close}>
            Close
          </Button>
        </div>
      </Dialog>
      <Button className="w-full" variant="secondary" onClick={open}>
        Save profile
      </Button>
    </>
  );
};
