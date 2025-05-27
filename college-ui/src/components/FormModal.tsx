'use client'
import { Batch, Course, Faculty, Program } from '@/interfaces/interfaces';
import dynamic from 'next/dynamic';
import React, { JSX, useActionState, useEffect, useState } from 'react'
import Loader from './loader/Loader';
import { Modal, ModalBody, ModalContent, ModalHeader, useDisclosure } from '@heroui/modal'
import { Form } from '@heroui/form';
import GeneralButton from './buttons/GeneralButton';
import { MdOutlineCloudUpload } from 'react-icons/md';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import ActionButton from './buttons/ActionButton';
import { deleteCourse, importCourses } from '@/services/course';
import { deleteProgram, importPrograms } from '@/services/program';
import { deleteBatch, importBatches } from '@/services/batch';
import { importFaculties } from '@/services/faculty';

type FormType = "course" | "program" | "batch" |"faculty"

type FormPropsMap = {
    course: Course;
    program: Program;
    batch: Batch;
    faculty: Faculty
};

type FormModalProps<K extends FormType = FormType> = {
    table: K;
    type: "create" | "update" | "delete" | "import" | "view";
    data?: FormPropsMap[K];
    id?: string;
};

const deleteActionMap = {
    course: deleteCourse,
    program: deleteProgram,
    batch: deleteBatch,
    faculty: deleteBatch
}

const importActionMap = {
    course: importCourses,
    program: importPrograms,
    batch: importBatches,
    faculty: importFaculties
}

const CourseForm = dynamic(() => import("./forms/CourseForm"), {
    loading: () => <Loader />
})

const ProgramForm = dynamic(() => import("./forms/ProgramForm"), {
    loading: () => <Loader />
})

const BatchForm = dynamic(() => import("./forms/BatchForm"), {
    loading: () => <Loader />
})

const FacultyForm = dynamic(() => import("./forms/FacultyForm"), {
    loading: () => <Loader />
})

const forms: {
    [K in FormType]: (
        onClose: () => void,
        type: "create" | "update",
        data?: FormPropsMap[K]
    ) => JSX.Element;
} = {
    course: (onClose, type, data) => (
        <CourseForm onClose={onClose} type={type} data={data} />
    ),
    program: (onClose, type, data) => (
        <ProgramForm onClose={onClose} type={type} data={data} />
    ),
    batch: (onClose, type, data) => (
        <BatchForm onClose={onClose} type={type} data={data} />
    ),
    faculty: (onClose, type, data) => (
        <FacultyForm onClose={onClose} type={type} data={data} />
    )
}

const FormModal = <K extends FormType>({ table, type, data, id }: FormModalProps<K>) => {

    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

    const header_name = type === "create" ? `Add New ${table}` : type === "update" ? `Edit ${table}` : type === "delete" ? `Delete ${table}` : type === "import" ? "Select File to import" : ""

    const Forms = () => {

        const [deleteState, deleteAction] = useActionState(deleteActionMap[table], {
            success: false,
            error: false,
            message: ""
        })
        const [importState, importAction] = useActionState(importActionMap[table], {
            success: false,
            error: false,
            message: ""
        })
        const [selectedFile, setSelectedFile] = useState<File | null>(null);

        const router = useRouter()

        useEffect(() => {
            if (deleteState.success) {
                toast.success(deleteState.message)
                onClose()
                router.refresh();
            }
            else if (deleteState.error) {
                toast.error(deleteState.message)
                router.refresh();
            }
        }, [deleteState, router])

        useEffect(() => {
            if (importState.success) {
                toast.success(importState.message)
                onClose()
                router.refresh();
            }
            else if (importState.error) {
                toast.error(importState.message)
                router.refresh();
            }
        }, [importState, router])

        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0]
            if (file) {
                setSelectedFile(file);
            }
        }

        const handleResetImportForm = () => {
            setSelectedFile(null);
            onClose();
        }

        return type === "delete" && id ? (
            <Form action={deleteAction} onReset={onClose}>
                <span>You are about to delete the {table} permanently. <b>Are you sure you want to continue?</b></span>
                <input type='text' name='id' defaultValue={id} hidden />
                <div className='flex w-full justify-between gap-3 p-2'>
                    <GeneralButton name='Cancel' variant='light' type='reset' />
                    <GeneralButton name='Delete' color='danger' variant='solid' type='submit' />
                </div>
            </Form>
        ) : type === "import" ? (
            <Form action={importAction} onReset={handleResetImportForm}>
                <div className="flex flex-col items-center justify-center w-full gap-2">
                    <label className="flex flex-col items-center justify-center w-full h-full border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <MdOutlineCloudUpload className='h-16 w-16 text-gray-700' />
                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">csv or xslx</p>
                        </div>
                        <input id="dropzone-file" name="file" type="file" className="hidden" onChange={handleFileChange} />
                    </label>
                    {selectedFile && <p>Selected file: {selectedFile.name}</p>}
                    <div className='flex w-full justify-between gap-3 p-2'>
                        <GeneralButton name='Cancel' variant='light' type='reset' />
                        <GeneralButton name='Submit' color='primary' variant='solid' type='submit' />
                    </div>
                </div>
            </Form>
        ) : type === "create" || type === "update" ? (
            forms[table](onClose, type, data)
        ) : (
            "Form not found"
        )
    }
    return (
        <>
            <ActionButton type={type} table={table} handlePress={onOpen} />
            <Modal isOpen={isOpen} placement="top-center" size='xl' scrollBehavior='inside' onOpenChange={onOpenChange} onClose={onClose}>
                <ModalContent>
                    {/* {(onClose) => (
                        <> */}
                    <ModalHeader>{header_name}</ModalHeader>
                    <ModalBody>
                        <Forms />
                    </ModalBody>
                    {/* </>
                    )} */}
                </ModalContent>
            </Modal>
        </>
    )
}

export default FormModal