'use client'

import { Button } from "@heroui/button"
import { FaPlus, FaRegTrashAlt } from "react-icons/fa"
import { MdImportExport, MdOutlineEdit, MdOutlineRemoveRedEye } from "react-icons/md"

const ActionButton = (
    {
        table,
        type,
        handlePress
    }: {
        table: "student" | "program" | "course" | "batch" | "faculty" | "user",
        type: "create" | "update" | "delete" | "import" | "view",
        handlePress?: () => void
    }) => {

    const button_name = type === "create" ? `Add ${table}` : type === "import" ? `Import ${table}` : ""
    const button_icon = type === "create" ? <FaPlus /> : type === "update" ? <MdOutlineEdit className='w-4 h-4' /> : type === "delete" ? <FaRegTrashAlt className='w-4 h-4' /> : type === "import" ? <MdImportExport className='w-4 h-4' /> : type === "view" ? <MdOutlineRemoveRedEye className='w-4 h-4' /> : null
    const button_style = type === "create" || type === "import" ? "hover:bg-secondary rounded-lg" : ""
    const button_variant = type === "create" || type === "import" ? "solid" : "light"
    const button_size = type === "create" || type === "import" ? undefined : "sm"
    const button_color = type === "delete" ? "danger" : "primary"

    return (
        <Button variant={button_variant} className={button_style} endContent={button_icon} size={button_size} color={button_color} onPress={handlePress}>{button_name}</Button>
    )
}

export default ActionButton