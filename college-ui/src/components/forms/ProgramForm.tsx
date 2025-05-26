'use client'
import { Program } from "@/interfaces/interfaces";
import { Form } from "@heroui/form";
import { Input } from "@heroui/input";
import { Radio, RadioGroup } from "@heroui/radio";
import { useRouter } from "next/navigation";
import { startTransition, useActionState, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import GeneralButton from "../buttons/GeneralButton";
import Loader from "../loader/Loader";
import { createProgram, updateProgram } from "@/services/program";

const ProgramForm = ({
    onClose,
    type,
    data
}: {
    onClose: () => void,
    type: "create" | "update",
    data?: Program
}) => {
    const { register, handleSubmit, reset, control } = useForm<Program>()
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [state, formAction] = useActionState(
        type === "create" ? createProgram : updateProgram,
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


    return (
        <Form onSubmit={onSubmit} onReset={() => reset()}>
            {data && (
                <input
                    type='text'
                    {...register("_id")}
                    defaultValue={data?._id}
                    hidden
                />
            )}
            <Input
                type='text'
                {...register("program_name")}
                placeholder='MCA'
                label='Program Name'
                defaultValue={data?.program_name}
                variant='bordered'
                isRequired
            />
            {data && (
                <Controller
                    name="status"
                    control={control}
                    defaultValue={data?.status}
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
            {isLoading && (
                <div className="absolute w-full h-full bg-white bg-opacity-50 flex justify-center items-center">
                    <Loader />
                </div>
            )}
        </Form>
    )
}

export default ProgramForm