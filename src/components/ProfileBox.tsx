import { WebviewWindow } from '@tauri-apps/api/window';
import React from 'react';
import { LoadProfiles } from './profileBox/LoadProfiles';
import { SaveProfile } from './profileBox/SaveProfile';

export const ProfileBox = () => {
  return (
    <div className="space-y-1 ">
      <LoadProfiles />
      <SaveProfile />
    </div>
  );
};
