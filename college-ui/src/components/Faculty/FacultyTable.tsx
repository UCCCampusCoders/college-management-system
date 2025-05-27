'use client'
import type { Selection } from "@react-types/shared";
import React, { useEffect, useMemo, useState } from 'react'
import { AllCommunityModule, ColDef, ICellRendererParams, ModuleRegistry, RowSelectionOptions, SizeColumnsToContentStrategy, SizeColumnsToFitGridStrategy, SizeColumnsToFitProvidedWidthStrategy, ValueGetterParams } from 'ag-grid-community';
import { Faculty } from '@/interfaces/interfaces';
import { MdOutlineRemoveRedEye, MdSearch } from 'react-icons/md';
import { Tooltip } from '@heroui/tooltip';
import { toast } from 'react-toastify';
import Link from 'next/link';
import FormModal from '../FormModal';
import { Button } from '@heroui/button';
import { FaRegTrashAlt } from 'react-icons/fa';
import { Input } from "@heroui/input";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/dropdown";
import { BiChevronDown } from "react-icons/bi";
import { AgGridReact } from "ag-grid-react";

ModuleRegistry.registerModules([AllCommunityModule]);

interface FacultyTableProps {
    data: Faculty[]
    role: "student" | "faculty" | "admin"
}

const FacultiesTable: React.FC<FacultyTableProps> = ({ data, role }) => {

    const [rowData, setRowData] = useState<Faculty[]>([])
    const [searchContent, setSearchContent] = useState<string>("")

    const handleDelete = (facultyData: Faculty) => {
        toast.error(facultyData.first_name)
    }

    const actionButtons = (props: ICellRendererParams) => {
        return (
            <div className='p-1 flex gap-1 items-center'>
                <Tooltip content='View' showArrow={true} color='primary' delay={1000} closeDelay={100} offset={-2}>
                    <Link className='flex p-2 hover:bg-primary-100 rounded-lg px-5' href={`/list/faculties/${props.data.user_id}`}><MdOutlineRemoveRedEye className='w-5 h-5' /></Link>
                </Tooltip>
                {role === "admin" && (
                    <>
                        <Tooltip content='Edit' showArrow={true} color='primary' delay={1000} closeDelay={100} offset={-2}>
                            <FormModal table='faculty' type='update' data={props.data} />
                        </Tooltip>
                        <Tooltip content='Delete' showArrow={true} color='danger' delay={1000} closeDelay={100} offset={-2}>
                            <Button variant='light' size='sm' color='danger' onPress={() => handleDelete(props.data)}><FaRegTrashAlt className='w-5 h-5' /></Button>
                        </Tooltip>
                    </>
                )}
            </div>
        )
    }

    const allColumns: ColDef[] = [
        {
            field: "name",
            headerName: "Name",
            valueGetter: (params: ValueGetterParams) => {
                const firstName = params.data.first_name || '';
                const middleName = params.data.middle_name || '';
                const lastName = params.data.last_name || '';
                return `${firstName} ${middleName} ${lastName}`.trim();
            },
            sort: "asc"
        },
        { field: "email", headerName: "Email", filter: true },
        { field: "phone_no", headerName: "Phone No", filter: true },
        { field: "program.program_name", headerName: "Program", filter: true },
        { field: "dob", headerName: "Date of Birth", filter: true },
        { field: "gender", headerName: "Gender", filter: true },
        { field: "join_date", headerName: "Join Date", filter: true },
        { field: "end_date", headerName: "End Date", filter: true },
        { field: "status", headerName: "Status", filter: true },
        { field: "actions", headerName: "Actions", cellRenderer: actionButtons },
    ];

    const defaultVisibleFields = ["name", "email", "actions", "program.program_name"];
    const [visibleFields, setVisibleFields] = React.useState<Selection>(
        new Set(defaultVisibleFields),
    );
    const headerColumns = useMemo(() => {
        if (visibleFields === "all") return allColumns;

        return allColumns.filter((column) => Array.from(visibleFields).includes(column.field!));
    }, [visibleFields]);

    useEffect(() => {
        setRowData(data)
    }, [data])

    const autoSizeStrategy = useMemo<
        | SizeColumnsToFitGridStrategy
        | SizeColumnsToFitProvidedWidthStrategy
        | SizeColumnsToContentStrategy
    >(() => {
        return {
            type: "fitCellContents",
        };
    }, []);

    const rowSelection = useMemo<RowSelectionOptions | 'single' | 'multiple'>(() => {
        return {
            mode: "multiRow",
            enableClickSelection: true,
        };
    }, []);

    const paginationPageSize = 10;
    const paginationPageSizeSelector = [10, 20, 50, 100];

    return (
        <div className='ag-theme-quartz flex flex-col gap-3' >
            <div className='flex justify-end'>
                <div className='flex gap-2 items-center p-2'>
                    <Input
                        className='border w-64 rounded-lg'
                        startContent={<MdSearch />}
                        placeholder='Search here...'
                        type='text'
                        isClearable
                        onChange={(e) => setSearchContent(e.target.value)}
                    />
                    <Dropdown>
                        <DropdownTrigger className="hidden sm:flex">
                            <Button endContent={<BiChevronDown className="text-small" />} variant="solid" color='primary'>
                                Columns
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                            disallowEmptySelection
                            aria-label="Table Columns"
                            closeOnSelect={false}
                            selectedKeys={visibleFields}
                            selectionMode="multiple"
                            onSelectionChange={setVisibleFields}
                        >
                            {allColumns.map((column) => (
                                <DropdownItem key={column.field!} className="capitalize">
                                    {column.headerName}
                                </DropdownItem>
                            ))}
                        </DropdownMenu>
                    </Dropdown>
                    {role === "admin" && (
                        <>
                            <FormModal table='faculty' type='import' />
                            <FormModal table='faculty' type='create' />
                        </>
                    )}

                </div>
            </div>

            <AgGridReact
                rowData={rowData}
                columnDefs={headerColumns}
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

export default FacultiesTable