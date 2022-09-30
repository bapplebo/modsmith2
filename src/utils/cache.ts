import { createDir, writeFile, exists, readTextFile } from '@tauri-apps/api/fs';
import { configDir as configDirPromise } from '@tauri-apps/api/path';
//const configDir = `C:/Users/ndaus/AppData/Roaming/modsmith`;

const CACHE_LENGTH_IN_DAYS = 30;

let configDir: string;
let cacheDir: string;
let userCacheFile: string;

export async function initialize() {
  // check if our cache exists
  console.log('Initializing cache stuff');
  configDir = `${await configDirPromise()}modsmith`;

  // cacheDir = `${configDir}/.cache`;
  // userCacheFile = `${configDir}/.cache/user`;

  await createDir(configDir).catch(console.error);
  await createDir(cacheDir).catch(console.error);

  // await readTextFile(userCacheFile).catch(async (e) => {
  //   await writeFile(userCacheFile, '{}').catch(console.error);
  // });

  // console.log(configDir);yarn add github:tauri-apps/tauri-plugin-sql
  // const contents = await readTextFile(`${configDir}/modsmith/config.json`);
}

export const storeUserIdValue = async (steamId: string, nickname: string) => {
  let userCache;
  try {
    const rawCacheFile = await readTextFile(userCacheFile);
    userCache = JSON.parse(rawCacheFile);
    console.log(userCache);
  } catch (e) {
    console.error('Error fetching userCache file: ', e);
    // File might not exist, write it again

    await createDir(cacheDir).catch(console.error);
    await writeFile(userCacheFile, '{}').catch(console.error);
  }

  if (
    !userCache[steamId] ||
    userCache[steamId].lastWritten > new Date().setDate(new Date().getDate() + CACHE_LENGTH_IN_DAYS)
  ) {
    console.log('Writing steam ID into cache...');
    userCache[steamId] = { nickname, lastWritten: new Date() };
    await writeFile(userCacheFile, JSON.stringify(userCache)).catch(console.error);
  }
};

export const retrieveUserIdValue = async (steamId: string): Promise<string> => {
  try {
    const rawCacheFile = await readTextFile(userCacheFile);
    const userCache = JSON.parse(rawCacheFile);
    if (userCache[steamId].lastWritten > new Date().setDate(new Date().getDate() + CACHE_LENGTH_IN_DAYS)) {
      throw new Error('Cache entry is older than 30 days');
    }
    return userCache[steamId].nickname as string;
  } catch (e) {
    console.error('Error fetching userCache file: ', e);
    throw e;
  }
};
