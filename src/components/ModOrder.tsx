import { useEffect, useState } from 'react';
import { Mod } from '../models/Mod';
import {
  ColumnDef,
  ColumnResizeMode,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  Header,
  useReactTable,
} from '@tanstack/react-table';
import { selectedModsState } from '../state/selectedMods';
import { useRecoilValue } from 'recoil';
import './Modlist.css';

const columnHelper = createColumnHelper<Mod>();
const defaultColumns: ColumnDef<Mod, any>[] = [
  columnHelper.display({
    id: 'dragger',
    enableResizing: false,
    size: 20,
    cell: ({ row }) => <div>...</div>,
  }),
  columnHelper.accessor('title', {
    header: () => 'Title',
    size: 500,
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('filename', {
    header: () => 'Filename',
    cell: (info) => info.getValue(),
  }),
];

export const ModOrder = () => {
  const [mods, setMods] = useState<Mod[]>([]);
  const selectedMods = useRecoilValue<any>(selectedModsState);

  const [columnResizeMode, setColumnResizeMode] = useState<ColumnResizeMode>('onChange');

  useEffect(() => {
    setMods(selectedMods);
  }, [selectedMods]);

  const table = useReactTable({
    data: mods,
    columns: defaultColumns,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode,
  });

  const headerClass = (header: Header<Mod, unknown>) => {
    if (header.id === 'dragger') {
      return;
    }
    return `resizer ${header.column.getIsResizing() ? 'isResizing' : ''}`;
  };

  const sortByFilename = () => {
    // todo -- implement
  };

  return (
    <div className="h-full flex flex-col">
      <div className="overflow-y-auto">
        {/* <img
        src={convertFileSrc(
          'D:\\games\\Steam\\steamapps\\workshop\\content\\1142710\\2789844937\\wolfy_great_bastion_takes_no_attrition.png'
        )}
      /> */}
        <div className="w-full p-2 mb-2 text-base bg-slate-700 flex justify-between">
          <div>
            OPTIONAL: Configure your load order here by dragging and dropping via the icon on the left.
            <br />
            Mods are sorted by filename automatically, which is the recommended way to load mods.
          </div>
          <button>Sort by filename</button>
        </div>
        {selectedMods.length === 0 ? (
          <div className="text-xl mt-3 flex justify-center items-center">No mods selected</div>
        ) : (
          <table className="mb-2">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      {...{
                        key: header.id,
                        colSpan: header.colSpan,
                        style: {
                          width: header.getSize(),
                        },
                      }}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}

                      <div
                        {...{
                          onMouseDown: header.getResizeHandler(),
                          onTouchStart: header.getResizeHandler(),
                          className: headerClass(header),
                          style: {
                            transform:
                              columnResizeMode === 'onEnd' && header.column.getIsResizing()
                                ? `translateX(${table.getState().columnSizingInfo.deltaOffset}px)`
                                : '',
                          },
                        }}
                      ></div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="text-sm">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      {...{
                        key: cell.id,
                        style: {
                          width: cell.column.getSize(),
                        },
                      }}
                      className="py-1 px-2"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
