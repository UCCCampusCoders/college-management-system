import Card from '@/components/Cards/Card'
import ProgramTable from '@/components/Program/ProgramTable';
import { getPrograms } from '@/services/program'
import React from 'react'
export const dynamic = 'force-dynamic';

const ProgramsListPage = async () => {

    const programs = await getPrograms()

    return (
        <div className='flex flex-col gap-3 p-2 rounded-lg'>
            <div className='flex gap-3 items-center pt-0'>
                <h2 className='font-bold text-3xl'>Programs</h2>
            </div>
            <div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-5 '>
                <Card title="Total Programs" value={programs.length} />
            </div>
            <ProgramTable data={programs} />
        </div>
    )
}

export default ProgramsListPage