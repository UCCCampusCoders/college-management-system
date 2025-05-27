import { Batch } from '@/interfaces/interfaces';
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL
type CurrentState = { success: boolean; error: boolean, message: string };

export const createBatch = async (currentState: CurrentState, batch: Batch) => {
    try {
        const response = await axios.post(`${API_URL}/batch/create/`, batch)
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

export const updateBatch = async (currentState: CurrentState, batch: Batch) => {
    try {
        const response = await axios.patch(`${API_URL}/batch/${batch._id}/`, batch)
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

export const getBatches = async () => {
    try {
        const response = await axios.get(`${API_URL}/batch/`)
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

export const deleteBatch = async (currentState: CurrentState, data: FormData) => {

    const batch_id = data.get("id")
    try {
        const response = await axios.delete(`${API_URL}/batch/${batch_id}/`)
        return { success: true, error: false, message: response.data.message }
    }
    catch (error) {
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

export const importBatches = async (currentState: CurrentState, formData: FormData) => {
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

        const response = await axios.post('http://localhost:8000/batch/upload/', axiosFormData, {
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