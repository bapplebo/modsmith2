import { exists, writeFile, readTextFile } from '@tauri-apps/api/fs';
import { join } from '@tauri-apps/api/path';
import { getModsmithConfigDir } from './pathUtils';

export const retrieveCategories = async () => {
  const configDirPath = await getModsmithConfigDir();
  const categoryFile = await join(configDirPath, 'categories');

  const categoryFileExists = (await exists(categoryFile)) as unknown as boolean;
  if (!categoryFileExists) {
    await writeFile(categoryFile, JSON.stringify({}));
  }

  const categories = JSON.parse(await readTextFile(categoryFile));
  return categories;
};

export const saveCategory = async (modId: string | undefined, _categoryName: string) => {
  if (!modId?.trim()) {
    return;
  }

  let categoryName = _categoryName;
  if (!_categoryName) {
    categoryName = 'Uncategorised';
  }

  const configDirPath = await getModsmithConfigDir();
  const categoryFile = await join(configDirPath, 'categories');

  const categoryFileExists = (await exists(categoryFile)) as unknown as boolean;
  if (!categoryFileExists) {
    await writeFile(categoryFile, JSON.stringify({}));
  }

  let categories = JSON.parse(await readTextFile(categoryFile));
  categories = removeFromExistingCategory(modId, categories);

  if (!categories[categoryName]) {
    categories[categoryName] = [];
  }

  categories[categoryName].push(modId);
  await writeFile(categoryFile, JSON.stringify(categories));
};

export const deleteCategory = (modId: string) => {};

const removeFromExistingCategory = (_modId: string, categories: Record<string, string[]>) => {
  let arr = Object.entries(categories);
  arr = arr.map(([category, modIds]) => {
    modIds = modIds.filter((modId) => modId !== _modId);
    return [category, modIds];
  });

  return Object.fromEntries(arr);
};
