import React, { ReactNode } from 'react'

const Card = ({ icon, title, value }: { icon: ReactNode, title: string, value: number }) => {
    return (
        <div className='flex items-center gap-5 p-6 rounded-2xl shadow-sm border bg-white'>
            <div className='p-2 h-10 w-10 text-primary'>
                {icon}
            </div>
            <div >
                <h2 className='font-bold'>{title}</h2>
                <h2 className='font-bold text-lg'>{value}</h2>
            </div>
        </div>
    )
}

export default Card