'use client'
import { Batch, Faculty, Program } from '@/interfaces/interfaces'
import { getProgramsByStatus } from '@/services/program'
import { useRouter } from 'next/navigation'
import React, { startTransition, useActionState, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import Loader from '../loader/Loader'
import { Form } from '@heroui/form'
import { Input } from '@heroui/input'
import { Select, SelectItem } from '@heroui/select'
import { getFullName } from '@/utilities/utils'
import { Radio, RadioGroup } from '@heroui/radio'
import GeneralButton from '../buttons/GeneralButton'
import { getFacultiesByProgram } from '@/services/faculty'
import { createBatch, updateBatch } from '@/services/batch'

const BatchForm = ({
    onClose,
    type,
    data,
}: {
    onClose: () => void,
    type: "create" | "update",
    data?: Batch,
}) => {

    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [initialLoading, setInitialLoading] = useState<boolean>(true)
    const [programs, setPrograms] = useState<Program[]>([])
    const [faculties, setFaculties] = useState<Faculty[]>([])
    const { register, handleSubmit, reset, control} = useForm<Batch>({
        defaultValues: {
            batch_name: data?.batch_name,
            semester: data?.semester,
            program_id: data?.program_id,
            faculty_in_charge: data?.faculty_in_charge,
            start_date: data?.start_date,
            end_date: data?.end_date,
            status: data?.status
        }
    })
    const [selectedProgram, setSelectedProgram] = useState<string>()


    useEffect(() => {
        const loadData = async () => {
            const [programsRes, defaultRes] = await Promise.all([
                getProgramsByStatus("Active"),
                data
            ]);
            setPrograms(programsRes);
            if (defaultRes?.program_id) {
                const facultyRes = await getFacultiesByProgram(defaultRes.program_id);
                setFaculties(facultyRes);
            }
            setInitialLoading(false);
        };
        loadData();
    }, [data]);

    useEffect(() => {
        const fetchFaculties = async () => {
            const faculty_data = await getFacultiesByProgram(selectedProgram!)
            setFaculties(faculty_data)
        }
        if (selectedProgram) {
            fetchFaculties()
        }
    }, [selectedProgram])

    const [state, formAction] = useActionState(
        type === "create" ? createBatch : updateBatch,
        {
            success: false,
            error: false,
            message: ""
        }
    );
    const router = useRouter()

    const onSubmit = handleSubmit((data) => {
        setIsLoading(true)
        startTransition(() => {
            formAction(data);
        });
    })

    useEffect(() => {
        if (state.success) {
            toast.success(state.message)
            router.refresh()
            onClose()
        } else if (state.error) {
            toast.error(state.message)
        }
        setIsLoading(false)
    }, [state, router, onClose])

    if (initialLoading) {
        return <Loader />
    }

    return (
        <Form onSubmit={onSubmit} onReset={() => reset()}>
            <div className="flex flex-col w-full gap-4">
                {data && (
                    <input
                        type='text'
                        {...register("_id")}
                        defaultValue={data?._id}
                        hidden
                    />
                )}
                <Input
                    {...register("batch_name")}
                    label="Batch Name"
                    variant="bordered"
                    type='text'
                    placeholder='2023-MCA-A'
                    isRequired
                />
                <Input
                    {...register("semester")}
                    label="Semester"
                    variant="bordered"
                    type='number'
                    placeholder='1'
                />
                <Controller
                    name="program_id"
                    control={control}
                    render={({ field }) => (
                        <Select
                            {...field}
                            label='Select Program'
                            variant='bordered'
                            selectedKeys={field.value ? [field.value] : []}
                            onChange={(e) => {
                                field.onChange(e);
                                setSelectedProgram(e.target.value);
                            }}
                        >
                            {programs.map((program) => (
                                <SelectItem key={program._id}>
                                    {program.program_name}
                                </SelectItem>
                            ))}
                        </Select>
                    )}
                />
                <Controller
                    name="faculty_in_charge"
                    control={control}
                    render={({ field }) => (
                        <Select
                            {...field}
                            label="Select Faculty"
                            variant="bordered"
                            selectedKeys={field.value ? [field.value] : []}
                            onChange={(e) => {
                                field.onChange(e.target.value);
                            }}
                            isDisabled={!faculties.length}
                        >
                            {faculties.map((faculty) => (
                                <SelectItem key={faculty.user_id}>
                                    {getFullName(faculty.first_name, faculty.middle_name || "", faculty.last_name || "")}
                                </SelectItem>
                            ))}
                        </Select>
                    )}
                />

                <Input
                    type='date'
                    {...register("start_date")}
                    label="Start Date"
                    variant="bordered"
                />
                <Input
                    type='date'
                    {...register("end_date")}
                    label="End Date"
                    variant="bordered"
                />

                {data && (
                    <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                            <RadioGroup
                                label="Status"
                                orientation="horizontal"
                                {...field}
                            >
                                <Radio value="Active" id="active">Active</Radio>
                                <Radio value="Inactive" id="inactive">Inactive</Radio>
                            </RadioGroup>
                        )}
                    />
                )}
                <div className='flex justify-end w-full gap-3 p-2'>
                    <GeneralButton name='Reset' color='danger' variant='light' type='reset' />
                    <GeneralButton name='Submit' color='primary' variant='solid' type='submit' />
                </div>
            </div>
            {isLoading && (
                <div className="absolute w-full h-full bg-white bg-opacity-50 flex justify-center items-center">
                    <Loader />
                </div>
            )}
        </Form>
    )
}

export default BatchForm