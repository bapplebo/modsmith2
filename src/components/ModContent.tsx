import React, { useState } from 'react';
import { Modlist } from './Modlist';
import { ModOrder } from './ModOrder';

enum ModContentPanel {
  MODLIST,
  MODORDER,
}

export const ModContent = () => {
  const [selectedPanel, setSelectedPanel] = useState<ModContentPanel>(ModContentPanel.MODLIST);
  return (
    <div className="h-[calc(100%_-_3.5rem)]">
      <div className="px-2 text-base z-10 flex items-center h-14 text-md space-x-2 select-none bg-neutral-900 w-full">
        <div
          className="cursor-pointer hover:bg-neutral-800 py-1 px-2 rounded transition ease-in-out border-neutral-800 border"
          onClick={() => setSelectedPanel(ModContentPanel.MODLIST)}
        >
          Select mods
        </div>
        <div
          className="cursor-pointer hover:bg-neutral-800 py-1 px-2 rounded transition ease-in-out border-neutral-800 border"
          onClick={() => setSelectedPanel(ModContentPanel.MODORDER)}
        >
          Configure load order
        </div>
      </div>
      <div className="h-full">{selectedPanel === ModContentPanel.MODLIST ? <Modlist /> : <ModOrder />}</div>
    </div>
  );
};
