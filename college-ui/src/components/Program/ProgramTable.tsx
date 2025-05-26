'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { AllCommunityModule, ColDef, ICellRendererParams, ModuleRegistry, RowSelectionOptions } from 'ag-grid-community';
import { Program } from '@/interfaces/interfaces';
import { Tooltip } from '@heroui/tooltip';
import FormModal from '../FormModal';
import { Input } from '@heroui/input';
import { AgGridReact } from 'ag-grid-react';
import { MdSearch } from 'react-icons/md';

ModuleRegistry.registerModules([AllCommunityModule]);

interface ProgramsTableProps {
  data: Program[],
}

const ProgramTable: React.FC<ProgramsTableProps> = ({ data }) => {

  const [searchContent, setSearchContent] = useState<string>("")

  const actionButtons = (props: ICellRendererParams) => {
    return (
      <div className='p-1 flex gap-1'>
        <Tooltip content='Edit' showArrow={true} color='primary' delay={1000} closeDelay={100} offset={-2}>
          <FormModal type='update' table='program' data={props.data} />
        </Tooltip>
        {props.data.status !== "Deleted" && (
          <Tooltip content='Delete' showArrow={true} color='danger' delay={1000} closeDelay={100} offset={-2}>
            <FormModal table='program' type='delete' id={props.data._id} />
          </Tooltip>
        )}
      </div>
    )
  }

  const columnDefs: ColDef[] = [
    { field: 'program_name', headerName: 'Program', filter: true },
    { field: "status", headerName: "Status", filter: true },
    { field: "actions", headerName: "Actions", cellRenderer: actionButtons }
  ]

  const [rowData, setRowData] = useState<Program[]>()
  useEffect(() => {
    setRowData(data)
  }, [data])

  const rowSelection = useMemo<RowSelectionOptions | 'single' | 'multiple'>(() => {
    return {
      mode: "multiRow",
      enableClickSelection: true,
    };
  }, []);

  const paginationPageSize = 10;
  const paginationPageSizeSelector = [10, 20, 50, 100];

  return (
    <div className='flex flex-col gap-3' >
      <div className='flex gap-2 items-center p-2 justify-end'>
        <Input
          className='border w-64 rounded-lg'
          startContent={<MdSearch />}
          placeholder='Search here...'
          type='text'
          isClearable
          onChange={(e) => setSearchContent(e.target.value)}
        />
        <FormModal table='program' type='import' />
        <FormModal table='program' type='create' />
      </div>
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        quickFilterText={searchContent}
        domLayout='autoHeight'
        pagination={true}
        paginationPageSize={paginationPageSize}
        paginationPageSizeSelector={paginationPageSizeSelector}
        rowSelection={rowSelection}
      />
    </div>
  )
}

export default ProgramTable