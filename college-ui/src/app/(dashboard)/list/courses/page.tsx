import Card from '@/components/Cards/Card'
import CourseTable from '@/components/Course/CourseTable'
import { getCourses } from '@/services/course'
import React from 'react'
import { FaBook } from 'react-icons/fa'
export const dynamic = 'force-dynamic';

const CourseListPage = async () => {

    const courses = await getCourses()

    return (
        <div className='flex flex-col gap-3 bg-white p-2 rounded-lg'>
            <div className='flex gap-3 items-center p-2'>
                <h2 className='font-bold text-3xl'>Courses</h2>
            </div>
            <div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-5'>
                <Card icon={<FaBook className='h-6 w-6' />} title="Total Courses" value={courses.length} />
            </div>
            <CourseTable data={courses} />
        </div>
    )
}

export default CourseListPage