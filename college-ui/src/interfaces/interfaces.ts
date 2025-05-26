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