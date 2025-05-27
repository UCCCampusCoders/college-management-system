'use client'
import { Faculty, Program } from '@/interfaces/interfaces'
import { getProgramsByStatus } from '@/services/program'
import { useRouter } from 'next/navigation'
import React, { startTransition, useActionState, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import Loader from '../loader/Loader'
import { Form } from '@heroui/form'
import { Input } from '@heroui/input'
import { Select, SelectItem } from '@heroui/select'
import { Radio, RadioGroup } from '@heroui/radio'
import GeneralButton from '../buttons/GeneralButton'
import { createFaculty, updateFaculty } from '@/services/faculty'
import { BiChevronDown, BiChevronUp } from 'react-icons/bi'

const FacultyForm = ({
    onClose,
    type,
    data
}: {
    onClose: () => void,
    type: "create" | "update",
    data?: Faculty
}) => {

    const { register, handleSubmit, reset, control } = useForm<Faculty>({
        defaultValues: {
            first_name: data?.first_name,
            middle_name: data?.middle_name,
            last_name: data?.last_name,
            program_id: data?.program_id,
            email: data?.email,
            phone_no: data?.phone_no,
            status: data?.status,
            dob: data?.dob,
            gender: data?.gender,
            join_date: data?.join_date,
            end_date: data?.end_date
        }
    })
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [programs, setPrograms] = useState<Program[]>([])
    const [initialLoading, setInitialLoading] = useState<boolean>(true)
    const [showOptionalFields, setShowOptionalFields] = useState(false)
    const router = useRouter()
    const [state, formAction] = useActionState(
        type === "create" ? createFaculty : updateFaculty,
        {
            success: false,
            error: false,
            message: ""
        }
    );

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
        const filteredData = Object.fromEntries(
            Object.entries(data).filter(([, value]) =>
                type === "create"
                    ? value !== undefined && value !== null && value !== ''
                    : value !== undefined && value !== null
            )
        ) as Faculty
        setIsLoading(true)
        startTransition(() => {
            formAction(filteredData);
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

    const toggleOptionalFields = () => {
        setShowOptionalFields(!showOptionalFields)
    }
    if (initialLoading) {
        return <Loader />
    }

    return (
        <Form onSubmit={onSubmit} onReset={() => reset()}>
            <div className='flex flex-col gap-5 w-full'>
                {data && (
                    <input
                        type='text'
                        {...register("_id")}
                        defaultValue={data?._id}
                        hidden
                    />
                )}
                {data && (
                    <input
                        type='text'
                        {...register("user_id")}
                        defaultValue={data?.user_id}
                        hidden
                    />
                )}
                <Input
                    label="First Name"
                    {...register("first_name")}
                    variant="bordered"
                    type='text'
                    isRequired
                />
                <Input
                    label="Email"
                    {...register("email")}
                    type="email"
                    variant="bordered"
                    isRequired
                />
                <Input
                    label="Phone Number"
                    {...register("phone_no")}
                    type='number'
                    variant="bordered"
                    minLength={10}
                    maxLength={10}
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
                                <Radio value="Active">Active</Radio>
                                <Radio value="Discontinued">Resigned</Radio>
                            </RadioGroup>
                        )}
                    />
                )}

                <GeneralButton variant='light' name={showOptionalFields ? 'Hide Optional Fields' : 'Show Optional Fields'} startContent={showOptionalFields ? <BiChevronUp /> : <BiChevronDown />} handlePress={toggleOptionalFields} />

                {showOptionalFields && (
                    <div className='flex flex-col gap-5'>
                        <Input
                            {...register("middle_name")}
                            label="Middle Name"
                            variant="bordered"
                            type='text'
                        />
                        <Input
                            label="Last Name"
                            variant="bordered"
                            type='text'
                            {...register("last_name")}
                        />
                        <Controller
                            name="gender"
                            control={control}
                            render={({ field }) => (
                                <RadioGroup
                                    label="Gender"
                                    orientation="horizontal"
                                    {...field}
                                >
                                    <Radio value="Male">Male</Radio>
                                    <Radio value="Female">Female</Radio>
                                    <Radio value="Others">Others</Radio>
                                </RadioGroup>
                            )}
                        />
                        <Input
                            type='date'
                            {...register("dob")}
                            label="Birth Date"
                            variant="bordered"
                        />

                        <Input
                            type='date'
                            {...register("join_date")}
                            label="Join Date"
                            variant="bordered"
                        />
                        <Input
                            type='date'
                            {...register("end_date")}
                            label="End Date"
                            variant="bordered"
                        />
                    </div>
                )}
            </div>
            <div className='flex justify-end w-full gap-3 p-2'>
                <GeneralButton name='Reset' color='danger' variant='light' type='reset' />
                <GeneralButton name='Submit' color='primary' variant='solid' type='submit' />
            </div>
            {isLoading && (
                <div className="absolute w-full h-full bg-white bg-opacity-50 flex justify-center items-center">
                    <Loader />
                </div>
            )}
        </Form>
    )
}

export default FacultyForm