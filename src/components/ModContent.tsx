import React, { useState } from 'react';
import { Modlist } from './Modlist';
import { ModOrder } from './ModOrder';

enum ModContentPanel {
  MODLIST,
  MODORDER,
}

const defaultStyle =
  'inline-block p-2 text-blue-600 bg-gray-100 rounded-t-lg active dark:bg-gray-800 dark:text-blue-500';
const selectedStyle =
  'inline-block p-2 rounded-t-lg hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300';

export const ModContent = () => {
  const [selectedPanel, setSelectedPanel] = useState<ModContentPanel>(ModContentPanel.MODLIST);
  return (
    <div className="h-full flex flex-col">
      {/* <div className="h-[calc(100%_-_5.5rem)]"> */}
      <div className="px-2 text-base z-10 flex items-center h-14 text-md space-x-2 select-none bg-neutral-900 bg-opacity-20 shadow-sm w-full">
        <div
          className="flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400"
          onClick={() => setSelectedPanel(ModContentPanel.MODLIST)}
        >
          <span className={selectedPanel === ModContentPanel.MODLIST ? defaultStyle : selectedStyle}>Select mods</span>
        </div>
        <div
          className="flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400"
          onClick={() => setSelectedPanel(ModContentPanel.MODORDER)}
        >
          <span className={selectedPanel === ModContentPanel.MODORDER ? defaultStyle : selectedStyle}>
            Configure load order
          </span>
        </div>
      </div>
      <div className="h-full grow">{selectedPanel === ModContentPanel.MODLIST ? <Modlist /> : <ModOrder />}</div>
    </div>
  );
};
