const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL
import axios from 'axios'

export const getProgramsByStatus = async (status: "Active" | "Inactive" | "Deleted") => {
    try {
        const response = await axios.get(`${API_URL}/program/status/`, {
            params: { program_status: status }
        })
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