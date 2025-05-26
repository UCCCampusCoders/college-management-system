import { useEffect, useState } from "react";
import Cookies from 'js-cookie';
import { User } from "@/interfaces/interfaces";
import { jwtDecode } from "jwt-decode";

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

export const useUser = () => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const token = Cookies.get('access_token')
        if (token) {
            try {
                const decodedToken: DecodedToken = jwtDecode(token)
                setUser(decodedToken);
            }
            catch (err) {
                if (err instanceof Error) {
                    console.error("Error decoding token:", err.message)
                }
                else {
                    console.error("Unknown Error")
                }
            }
        }
    }, []);

    return user;
};