'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { AllCommunityModule, ColDef, ICellRendererParams, ModuleRegistry, RowSelectionOptions, SizeColumnsToContentStrategy, SizeColumnsToFitGridStrategy, SizeColumnsToFitProvidedWidthStrategy, ValueGetterParams } from 'ag-grid-community';
import { Batch } from '@/interfaces/interfaces';
import { Tooltip } from '@heroui/tooltip';
import Link from 'next/link';
import { MdOutlineRemoveRedEye, MdSearch } from 'react-icons/md';
import FormModal from '../FormModal';
import { Input } from '@heroui/input';
import { AgGridReact } from 'ag-grid-react';

ModuleRegistry.registerModules([AllCommunityModule]);

interface BatchTableProps {
    data: Batch[]
    role: "faculty" | "admin" | "student"
}
const BatchTable: React.FC<BatchTableProps> = ({ data, role }) => {

    const [rowData, setRowData] = useState<Batch[]>()
    const [searchContent, setSearchContent] = useState<string>("")

    const customButtons = (props: ICellRendererParams) => {
        return (
            <div className='p-1 flex gap-1'>
                <Tooltip content='View' showArrow={true} color='primary' delay={1000} closeDelay={100} offset={-2}>
                    <Link className='flex p-2 hover:bg-primary-100 rounded-lg px-5' href="#"><MdOutlineRemoveRedEye className='w-5 h-5' /></Link>
                </Tooltip>
                {role === "admin" && (
                    <>
                        <Tooltip content='Edit' showArrow={true} color='primary' delay={1000} closeDelay={100} offset={-2}>
                            <FormModal table='batch' type='update' id={props.data._id} data={props.data} />
                        </Tooltip>
                        {props.data.status !== "Deleted" && (
                            <Tooltip content='Delete' showArrow={true} color='danger' delay={1000} closeDelay={100} offset={-2}>
                                <FormModal table='batch' type='delete' id={props.data._id} />
                            </Tooltip>
                        )}
                    </>
                )}
            </div>
        )
    }

    const columnDefs: ColDef[] = [
        { field: "batch_name", headerName: "Batch Name", filter: true },
        {
            field: "name",
            headerName: "Faculty In Charge",
            valueGetter: (params: ValueGetterParams) => {
                const firstName = params.data.faculty.first_name || '';
                const middleName = params.data.faculty.middle_name || '';
                const lastName = params.data.faculty.last_name || '';
                return `${firstName} ${middleName} ${lastName}`.trim();
            },
            sort: "asc"
        },
        { field: "semester", headerName: "Semester", filter: true },
        { field: "program.program_name", headerName: "Program", filter: true },
        { field: "start_date", headerName: "Start Date", filter: true },
        { field: "end_date", headerName: "End Date", filter: true },
        { field: "status", headerName: "Status", filter: true },
        { field: "actions", headerName: "Actions", cellRenderer: customButtons }
    ]

    useEffect(() => {
        setRowData(data);
    }, [data])

    const rowSelection = useMemo<RowSelectionOptions | 'single' | 'multiple'>(() => {
        return {
            mode: "multiRow",
            enableClickSelection: true,
        };
    }, []);

    const autoSizeStrategy = useMemo<
        | SizeColumnsToFitGridStrategy
        | SizeColumnsToFitProvidedWidthStrategy
        | SizeColumnsToContentStrategy
    >(() => {
        return {
            type: "fitCellContents",
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
                {role === "admin" && (
                    <>
                        <FormModal table='batch' type='import' />
                        <FormModal table='batch' type='create' />
                    </>
                )}
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
                autoSizeStrategy={autoSizeStrategy}
            />
        </div>
    )
}

export default BatchTable