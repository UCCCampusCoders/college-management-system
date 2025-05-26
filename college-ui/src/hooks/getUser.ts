import { User } from "@/interfaces/interfaces"
import { jwtDecode } from 'jwt-decode';
import { cookies } from "next/headers"


interface DecodedToken {
    _id: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    email: string;
    role: "admin" | "faculty" | "student";
    exp: number;
    status: "Active" | "Inactive"
}

const getUser = async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    if (token) {
        const decoded_token: DecodedToken = jwtDecode(token)
        const user: User = {
            _id: decoded_token._id,
            first_name: decoded_token.first_name,
            middle_name: decoded_token.middle_name,
            last_name: decoded_token.last_name,
            email: decoded_token.email,
            role: decoded_token.role,
            status: decoded_token.status
        };

        return user;
    }
    return null
}

export default getUser