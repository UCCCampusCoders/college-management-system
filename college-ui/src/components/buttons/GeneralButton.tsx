'use client'
import { Button } from '@heroui/button'
import React from 'react'


const GeneralButton = ({
    name,
    variant,
    color,
    type,
    handlePress,
    startContent,
    endContent
}: {
    name: string,
    variant: "light" | "solid",
    color?: "primary" | "secondary" | "danger",
    type?: "submit" | "reset",
    handlePress?: () => void,
    startContent?: React.JSX.Element,
    endContent?: React.JSX.Element
}) => {
    return (
        <Button variant={variant} color={color} type={type} onPress={handlePress} startContent={startContent} endContent={endContent}>{name}</Button>
    )
}

export default GeneralButton