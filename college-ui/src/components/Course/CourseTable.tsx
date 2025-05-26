'use client'
import { Course } from "@/interfaces/interfaces";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@heroui/button"
import { Tooltip } from "@heroui/tooltip"
import { Input } from "@heroui/input"
import { AllCommunityModule, ColDef, ICellRendererParams, ModuleRegistry, RowSelectionOptions, SizeColumnsToContentStrategy, SizeColumnsToFitGridStrategy, SizeColumnsToFitProvidedWidthStrategy } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react'
import Link from "next/link";
import { MdOutlineRemoveRedEye, MdSearch } from "react-icons/md";
import FormModal from "../FormModal";

ModuleRegistry.registerModules([AllCommunityModule]);

interface CourseTableProps {
    data: Course[],
}

const CourseTable: React.FC<CourseTableProps> = ({ data }) => {

    const [rowData, setRowData] = useState<Course[]>()
    const [searchContent, setSearchContent] = useState<string>("")
    // const [selectedCourse, setSelectedCourse] = useState(null);
    // const [assignModalOpen, setAssignModalOpen] = useState(false)

    // const handleAssign = (courseData: any) => {
    //     setSelectedCourse(courseData)
    //     setAssignModalOpen(true)
    // }

    const assignButton = (props: ICellRendererParams) => {
        return (
            <Tooltip content='Assign' showArrow={true} color='primary' delay={1000} closeDelay={100} offset={-2}>
                <Button isDisabled={props.data.status === "Deleted" ? true : false} variant='solid' size='sm' color='primary'
                    // onPress={(e) => handleAssign(props.data)}
                >
                    Assign
                </Button>
            </Tooltip>
        )
    }

    const actionButtons = (props: ICellRendererParams) => {
        return (
            <div className='p-1 flex gap-1'>
                <Tooltip content='View' showArrow={true} color='primary' delay={1000} closeDelay={100} offset={-2}>
                    <Link className='flex p-2 hover:bg-primary-100 rounded-lg px-5' href={`/admin/course/${props.data._id}`}><MdOutlineRemoveRedEye className='w-5 h-5' /></Link>
                </Tooltip>
                <Tooltip content='Edit' showArrow={true} color='primary' delay={1000} closeDelay={100} offset={-2}>
                    <FormModal table='course' type='update' data={props.data} />
                </Tooltip>
                {props.data.status !== "Deleted" && (
                    <Tooltip content='Delete' showArrow={true} color='danger' delay={1000} closeDelay={100} offset={-2}>
                        <FormModal table='course' type='delete' id={props.data._id} />
                    </Tooltip>
                )}
            </div>
        )
    }

    const columnDefs: ColDef[] = [
        { field: "course_code", headerName: "Course Code", filter: true },
        { field: "course_name", headerName: "Course Name", filter: true },
        { field: "semester", headerName: "Semester", filter: true },
        { field: "program.program_name", headerName: "Program", filter: true },
        { field: "status", headerName: "Status", filter: true },
        { field: "assign", headerName: "Assign", cellRenderer: assignButton },
        { field: "actions", headerName: "Actions", cellRenderer: actionButtons }
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
        <div className='flex flex-col gap-3'>
            <div className='flex gap-2 items-center p-2 justify-end'>
                <Input
                    className='border w-64 rounded-lg'
                    startContent={<MdSearch />}
                    placeholder='Search here...'
                    type='text'
                    isClearable
                    onChange={(e) => setSearchContent(e.target.value)}
                />
                <FormModal table='course' type='import' />
                <FormModal table='course' type='create' />
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

            {/* {selectedCourse && (
                <AssignCourseModal
                    isOpen={assignModalOpen}
                    onClose={() => setAssignModalOpen(false)}
                    data={selectedCourse}
                />
            )} */}
        </div>
    )
}

export default CourseTable