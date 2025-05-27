import Card from '@/components/Cards/Card'
import FacultiesTable from '@/components/Faculty/FacultyTable'
import { getFaculties } from '@/services/faculty'
import React from 'react'
import { GiTeacher } from 'react-icons/gi'
export const dynamic = 'force-dynamic';

const FacultiesList = async () => {

  // const user = await getUser()
  // const role = user?.role!
  const role='admin'
  const faculties = await getFaculties()

  return (
    <div className='flex flex-col gap-3 bg-white p-2 rounded-lg'>
      <div className='flex justify-between gap-3 items-center p-2'>
        <h2 className='font-bold text-3xl'>Faculties</h2>
      </div>
      <div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-5 '>
        <Card title="Total Faculties" value={faculties.length} icon={<GiTeacher className='h-6 w-6' />} />
      </div>
      <FacultiesTable data={faculties} role={role} />
    </div>
  )
}

export default FacultiesList