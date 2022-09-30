import React, { useState } from 'react';
import useContextMenu from '../../hooks/useContextMenu';
import './ContextMenu.css';
import { open } from '@tauri-apps/api/shell';
import Dialog from '@reach/dialog';
import { saveCategory } from '../../utils/categoryUtils';
import { useQueryClient } from '@tanstack/react-query';

const itemClasses = 'p-1 px-2 cursor-pointer hover:bg-neutral-700';

const TableContextMenu = ({ outerRef }: { outerRef: React.MutableRefObject<HTMLElement | null> }) => {
  const { xPos, yPos, menu, url, modId } = useContextMenu(outerRef);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryName, setCategoryName] = useState<string>();
  const queryClient = useQueryClient();

  const changeCategory = () => {
    setCategoryModalOpen(true);
  };

  const saveNewCategory = async () => {
    const _categoryName = categoryName ?? '';
    await saveCategory(modId, _categoryName);
    queryClient.invalidateQueries(['categories']);
    queryClient.invalidateQueries(['modlist']);

    close();
  };

  const close = () => setCategoryModalOpen(false);

  if (menu) {
    return (
      <ul
        className="absolute bg-neutral-800 border border-neutral-900 text-sm shadow-lg"
        style={{ top: yPos, left: xPos }}
      >
        {url ? (
          <>
            <li className={itemClasses} onClick={() => open(url)}>
              Open on Steam Workshop
            </li>
            <li className={itemClasses} onClick={() => changeCategory()}>
              Change category
            </li>
          </>
        ) : (
          <li className={itemClasses}>No URL found for this mod</li>
        )}
      </ul>
    );
  }
  return (
    <>
      <Dialog className="p-3 w-96 shadow-lg bg-neutral-800" isOpen={categoryModalOpen} onDismiss={close}>
        <div className="p-1 text-base">Change category</div>
        <div className="p-1 text-sm">Enter a category name. Leave blank to mark as uncategoried.</div>
        <div className="mb-2 border-b border-neutral-600" />
        <input
          onChange={(e) => setCategoryName(e.target.value)}
          className="mb-2 rounded p-2 w-full"
          placeholder="Enter a category name..."
          value={categoryName}
        />
        <div className="flex justify-between">
          <button className="w-1/3" onClick={saveNewCategory}>
            Save
          </button>
          <button className="w-1/3" onClick={close}>
            Close
          </button>
        </div>
      </Dialog>
    </>
  );
};

export default TableContextMenu;
