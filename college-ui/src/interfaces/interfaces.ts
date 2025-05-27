export interface User {
    _id?: string
    first_name: string
    middle_name?: string | null
    last_name?: string | null
    email: string
    role: "admin" | "faculty" | "student"
    status: "Active" | "Inactive"
    created_at?: string | null
    updated_at?: string | null
}

export interface Faculty {
    _id?: string
    user_id?: string
    first_name: string
    middle_name?: string
    last_name?: string
    email: string
    phone_no: string
    gender?: "Male" | "Female" | "Others" | null
    dob?: string | null
    program_id: string
    join_date?: string | null
    end_date?: string | null
    status: "Active" | "Resigned"
    created_at?: string | null
    updated_at?: string | null
    program?: Program
}

export interface Course {
    _id?: string
    course_code: string
    course_name: string
    semester: number
    program_id?: string
    status: "Active" | "Inactive" | "Deleted"
    created_at?: string | null
    updated_at?: string | null

    program?: Program
    assignments?: AssignCourse[]
}

export interface Program {
    _id?: string
    program_name: string
    status: "Active" | "Inactive" | "Deleted"
    created_at?: string
    updated_at?: string
    deleted_at?: string
}

export interface AssignCourse {
    _id?: string
    course_id: string
    batch_id?: string | null
    faculty_id: string
    assigned_date?: string | null
}

export interface Batch {
    _id?: string
    batch_name: string
    faculty_in_charge?: string
    semester?: number
    program_id?: string
    start_date?: string | null
    status: "Active" | "Inactive" | "Deleted"
    end_date?: string | null
    created_at?: string | null
    updated_at?: string | null
    program?: Program
    faculty?: Faculty
}