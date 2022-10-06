import { ModWithoutMetadata } from './../models/Mod';
import { invoke } from '@tauri-apps/api';
import { readDir, removeDir } from '@tauri-apps/api/fs';
import { XMLParser } from 'fast-xml-parser';
import { Mod } from '../models/Mod';
import { ModMetadata } from '../models/ModMetadata';
import { getSteamContentDirectory } from './pathUtils';

export const retrieveModList = async (): Promise<Mod[]> => {
  const workshopDirectory = await getSteamContentDirectory();
  if (!workshopDirectory.trim()) {
    console.error('Missing workshop directory, exiting');
    throw new Error('Missing workshop directory');
  }

  // todo - put this in the core layer later as per https://tauri.app/v1/api/js/fs#security. the ["**"] scope is pretty dodgy
  // const stuff = await invoke('find_mods');
  // console.log(stuff);

  const modIdList = await readDir(workshopDirectory);
  //console.log('modIdList', modIdList);

  const tempMods: ModWithoutMetadata[] = [];
  // Go through each mod in the list and get the files
  for (const modIdPath of modIdList) {
    const modId = modIdPath.path.substring(modIdPath.path.lastIndexOf('\\') + 1);
    const modFiles = await readDir(modIdPath.path);
    if (modFiles.length === 0) {
      // todo - delete folder
    } else {
      for (const file of modFiles) {
        if (file.path.endsWith('.bin')) {
          continue;
        }

        if (file.path.endsWith('.pack')) {
          const filename = file.path.substring(file.path.lastIndexOf('\\') + 1);
          const imagePath = file.path.replace('.pack', '.png');
          // set up symlink
          tempMods.push({
            filePath: file.path,
            filename,
            modId,
            imagePath,
          });
        }
      }
    }
  }

  // Add metadata from Steam Workshop
  const modsMetadata: ModMetadata[] = await invoke('get_metadata_from_workshop_ids', {
    ids: tempMods.map((mod) => mod.modId),
  });

  // Join the two arrays
  const modsWithMetadataPromises = tempMods.map(async (mod) => {
    const metadata = modsMetadata.find((modMetadata) => modMetadata.id === mod.modId);
    const username = 'asd'; //await fetchUsernameFromSteamID(metadata?.owner);
    return { ...mod, ...metadata, author: username, lastUpdated: metadata?.time_updated.toString() };
  });

  const modsWithMetadata = await Promise.all(modsWithMetadataPromises);
  return modsWithMetadata;
};

const fetchUsernameFromSteamID = async (fullSteamId?: string): Promise<string> => {
  try {
    const steamId = fullSteamId?.trim();
    const publicUserData: string = await invoke('get_public_steam_user_data', { id: steamId });
    if (!publicUserData.includes('Failed')) {
      const parser = new XMLParser();
      const xmlObj = parser.parse(publicUserData);
      const nickname = xmlObj.profile.steamID;
      // storeUserIdValue(steamId!, nickname);
      return nickname;
    } else {
      return '[unknown]';
    }
  } catch (e) {
    console.error('Unable to determine ID for steam user: ', fullSteamId);
    return '[unknown]';
  }
};

export const unsubscribeFromMod = async (modId: string) => {
  try {
    await invoke('unsubscribe_from_mod', { modId: modId });

    // Then delete the folder
    const workshopDirectory = await getSteamContentDirectory();
    await removeDir(`${workshopDirectory}/${modId}`, { recursive: true });
  } catch (e) {
    console.error(e);
  }
};
