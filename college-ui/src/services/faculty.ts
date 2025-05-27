import { Faculty } from '@/interfaces/interfaces';
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL
type CurrentState = { success: boolean; error: boolean, message: string };

export const getFacultiesByProgram = async (program_id: string) => {
    try {
        const response = await axios.get(`${API_URL}/faculty/program/${program_id}/`)
        return response.data
    } catch (error) {
        if (error instanceof Error) {
            throw Error(error.message)
        }
        else {
            throw Error("Unknown Error")
        }
    }
}

export const importFaculties = async (currentState: CurrentState, formData: FormData) => {
    const file = formData.get('file') as File
    if (!file) {
        return {
            success: false,
            error: true,
            message: 'No file selected.',
        }
    }
    try {
        const buffer = await file.arrayBuffer()
        const blob = new Blob([buffer], { type: file.type })

        const axiosFormData = new FormData()
        axiosFormData.append('file', blob, file.name)

        const response = await axios.post('http://localhost:8000/faculty/upload/', axiosFormData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return {
            success: true,
            error: false,
            message: response.data.message,
        }

    } catch (error) {
        if (error instanceof Error) {
            return {
                success: false,
                error: true,
                message: error.message,
            }
        }
        else {
            return {
                success: false,
                error: true,
                message: "Unknown Error Occurred",
            }
        }
    }
}

export const getFaculties = async () => {
    try {
        const response = await axios.get(`${API_URL}/faculty/`)
        return response.data
    }
    catch (error) {
        if (error instanceof Error) {
            throw Error(error.message)
        }
        else {
            throw Error("Unknown Error")
        }
    }
}

export const createFaculty = async (currentState: CurrentState, faculty: Faculty) => {
    try {
        const response = await axios.post(`${API_URL}/faculty/create/`, faculty)
        return { success: true, error: false, message: response.data.message }
    } catch (err) {
        if (err instanceof Error) {
            return { success: false, error: true, message: err.message }
        }
        else {
            return { success: false, error: true, message: "Unknown error" }
        }
    }
}

export const updateFaculty = async (currentState: CurrentState, faculty: Faculty) => {
    try {
        const response = await axios.patch(`${API_URL}/faculty/${faculty._id}/`, faculty)
        return { success: true, error: false, message: response.data.message }
    } catch (err) {
        if (err instanceof Error) {
            return { success: false, error: true, message: err.message }
        }
        else {
            return { success: false, error: true, message: "Unknown error" }
        }
    }
}