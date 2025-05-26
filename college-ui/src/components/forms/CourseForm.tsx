'use client'
import { Course, Program } from '@/interfaces/interfaces'
import { useRouter } from 'next/navigation'
import React, { startTransition, useActionState, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { Form } from "@heroui/form"
import { Input } from '@heroui/input'
import { Select, SelectItem } from "@heroui/select"
import { Controller, useForm } from 'react-hook-form'
import {Radio, RadioGroup} from "@heroui/radio"
import GeneralButton from '../buttons/GeneralButton'
import Loader from '../loader/Loader'
import { createCourse, updateCourse } from '@/services/course'
import { getProgramsByStatus } from '@/services/program'


const CourseForm = ({
    onClose,
    type,
    data,
}: {
    onClose: () => void,
    type: "create" | "update",
    data?: Course,
}) => {

    const [initialLoading, setInitialLoading] = useState<boolean>(true)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const { register, handleSubmit, reset, control } = useForm<Course>({
        defaultValues: {
            program_id: data?.program_id,
            course_code: data?.course_code,
            course_name: data?.course_name,
            semester: data?.semester,
            status: data?.status
        },
    })
    const [programs, setPrograms] = useState<Program[]>([])
    const [state, formAction] = useActionState(
        type === "create" ? createCourse : updateCourse,
        {
            success: false,
            error: false,
            message: ""
        }
    );
    const router = useRouter()

    useEffect(() => {
        const loadData = async () => {
            const [programsRes] = await Promise.all([
                getProgramsByStatus("Active"),
            ]);
            setPrograms(programsRes);
            setInitialLoading(false);
        };
        loadData();
    }, []);


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
                    {...register("course_code")}
                    label="Course Code"
                    variant="bordered"
                    type='text'
                    placeholder='MCA-CT1'
                    isRequired
                />
                <Input
                    {...register("course_name")}
                    label="Course Name"
                    placeholder='Science'
                    variant="bordered"
                    isRequired
                />
                <Input
                    {...register("semester")}
                    label="Semester"
                    variant="bordered"
                    placeholder='1'
                    type='number'
                    isRequired
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
                            isRequired
                        >
                            {programs.map((program) => (
                                <SelectItem key={program._id}>
                                    {program.program_name}
                                </SelectItem>
                            ))}
                        </Select>
                    )}
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
                                <Radio value="Active" id="active" >Active</Radio>
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

export default CourseForm