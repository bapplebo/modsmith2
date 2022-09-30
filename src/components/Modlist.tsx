import { useEffect, useRef, useState } from 'react';
import { steamContentDirectory } from '../utils/pathUtils';
import { readDir, BaseDirectory } from '@tauri-apps/api/fs';
import { Mod } from '../models/Mod';
import {
  ColumnDef,
  ColumnResizeMode,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  Header,
  OnChangeFn,
  Row,
  RowSelectionState,
  Updater,
  useReactTable,
} from '@tanstack/react-table';
import { IndeterminateCheckbox } from './IndeterminateCheckbox';
import { invoke } from '@tauri-apps/api/tauri';
import { ModMetadata } from '../models/ModMetadata';
import { retrieveModList } from '../utils/workshopUtils';
import { selectedModsState } from '../state/selectedMods';
import { useRecoilState } from 'recoil';
import './Modlist.css';
import { tableSelectionModState, tableSelectionState } from '../state/tableSelection';
import { useQuery } from '@tanstack/react-query';
import TableContextMenu from './menu/ContextMenu';
import { selectedProfileState } from '../state/profiles';
import { loadedModsState } from '../state/loadedMods';

const columnHelper = createColumnHelper<Mod>();
const defaultColumns: ColumnDef<Mod, any>[] = [
  columnHelper.display({
    id: 'enabled',
    enableResizing: false,
    size: 20,
    header: ({ table }) => (
      <IndeterminateCheckbox
        {...{
          checked: table.getIsAllRowsSelected(),
          indeterminate: table.getIsSomeRowsSelected(),
          onChange: table.getToggleAllRowsSelectedHandler(),
        }}
      />
    ),
    cell: ({ row }) => (
      <div className="pt-1">
        <IndeterminateCheckbox
          {...{
            checked: row.getIsSelected(),
            indeterminate: row.getIsSomeSelected(),
            onChange: row.getToggleSelectedHandler(),
          }}
        />
      </div>
    ),
  }),
  columnHelper.accessor('title', {
    header: () => 'Title',
    size: 500,
    cell: (info) => info.getValue() || '[not found]',
  }),
  columnHelper.accessor('filename', {
    header: () => 'Filename',
    cell: (info) => info.getValue(),
  }),
];

export const Modlist = () => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedRows, setSelectedRows] = useRecoilState(tableSelectionState);
  const [selectedMods, setSelectedMods] = useRecoilState(tableSelectionModState);
  const [selectedProfile, setSelectedProfile] = useRecoilState(selectedProfileState);
  const [loadedMods, setLoadedMods] = useRecoilState(loadedModsState);
  const [columnResizeMode] = useState<ColumnResizeMode>('onChange');
  const outerRef = useRef<HTMLTableSectionElement | null>(null);

  const table = useReactTable({
    data: loadedMods || [],
    columns: defaultColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    columnResizeMode,
    state: {
      rowSelection: selectedRows,
      globalFilter,
    },
    onRowSelectionChange: setSelectedRows,
    onGlobalFilterChange: setGlobalFilter,
  });

  useEffect(() => {
    const newMods = table.getSelectedRowModel().flatRows.map((row) => row.original);
    setSelectedMods(newMods);
  }, [JSON.stringify(selectedRows)]);

  useEffect(() => {
    if (selectedProfile !== null) {
      const indexes: Record<number, boolean> = {};
      for (const row of table.getRowModel().flatRows) {
        const modExists = (selectedProfile.Mods as any[]).some(
          (selectedMod) => selectedMod.Filename === row.original.filename
        );
        if (modExists) {
          indexes[row.id as unknown as number] = true;
        }
      }

      setSelectedRows(indexes);
      setSelectedProfile(null);
    }
  }, [selectedProfile]);

  const headerClass = (header: Header<Mod, unknown>) => {
    if (header.id === 'enabled') {
      return;
    }
    return `resizer ${header.column.getIsResizing() ? 'isResizing' : ''}`;
  };
  ``;

  const renderRows = () => {
    let collectedByCategories: Record<string, Row<Mod>[]> = table
      .getRowModel()
      .rows.reduce((groups: Record<string, Row<Mod>[]>, item) => {
        const group = (groups[item.original.category!] || []) as Row<Mod>[];
        group.push(item);
        groups[item.original.category!] = group;
        return groups;
      }, {});

    const toRender: React.ReactNode[] = [];

    const entries = Object.entries(collectedByCategories);
    entries.sort((a, b) => (a[0] > b[0] ? 1 : -1));
    entries.map(([category, mods]) => {
      toRender.push(
        <tr className="text-base bg-slate-800">
          <td colSpan={99}>
            <div className="mx-2">{category}</div>
          </td>
        </tr>
      );

      toRender.push(
        mods.map((mod) => {
          return (
            <tr
              className="hover:bg-neutral-800"
              data-url={mod.original.url}
              data-modid={mod.original.modId}
              key={mod.id}
            >
              {mod.getVisibleCells().map((cell) => (
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
          );
        })
      );
    });

    return toRender;
  };

  return (
    <>
      <TableContextMenu outerRef={outerRef} />
      <div className="h-full flex flex-col">
        <div className="overflow-y-scroll">
          {/* <img
        src={convertFileSrc(
          'D:\\games\\Steam\\steamapps\\workshop\\content\\1142710\\2789844937\\wolfy_great_bastion_takes_no_attrition.png'
        )}
      /> */}
          <table className="w-full">
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
            <tbody ref={outerRef} className="text-sm">
              {renderRows()}
            </tbody>
          </table>
        </div>
        <div className="h-12 p-2 bg-neutral-900 w-full">
          <input
            className="p-1 px-2 text-sm border rounded border-gray-600 border-b"
            placeholder="Filter mods by name..."
            onChange={(e) => setGlobalFilter(String(e.target.value))}
          ></input>
        </div>
      </div>
    </>
  );
};
