import Link from "next/link";
import { RxAvatar, RxDashboard } from 'react-icons/rx';
import { PiChalkboardTeacher, PiStudent } from "react-icons/pi";
import { LuBookText, LuNewspaper, LuSettings } from 'react-icons/lu';
import { TiGroupOutline } from 'react-icons/ti';
import { FiUser, FiUserCheck } from 'react-icons/fi';
import { MdOutlineSchedule } from 'react-icons/md';
import { FaRegCalendarTimes } from 'react-icons/fa';

const menuItems = [
    {
        title: "MENU",
        items: [
            {
                icon: RxDashboard,
                label: "Dashboard",
                href: "/",
                visible: ["admin", "faculty", "student"],
            },
            {
                icon: PiChalkboardTeacher,
                label: "Faculties",
                href: "/list/faculties",
                visible: ["admin", "faculty"],
            },
            {
                icon: PiStudent,
                label: "Students",
                href: "/list/students",
                visible: ["admin", "faculty"],
            },
            {
                icon: FiUser,
                label: "Users",
                href: "/list/users",
                visible: ["admin"],
            },
            {
                icon: LuBookText,
                label: "Courses",
                href: "/list/courses",
                visible: ["admin"],
            },
            {
                icon: LuNewspaper,
                label: "Programs",
                href: "/list/programs",
                visible: ["admin"],
            },
            {
                icon: TiGroupOutline,
                label: "Batches",
                href: "/list/batches",
                visible: ["admin", "faculty"],
            },
            {
                icon: MdOutlineSchedule,
                label: "Timetable",
                href: "/list/timetable",
                visible: ["admin"],
            },
            {
                icon: FiUserCheck,
                label: "Attendance Reports",
                href: "/list/attendance",
                visible: ["admin", "faculty"],
            },
            {
                icon: FiUserCheck,
                label: "Attendance",
                href: "/faculty/attendance",
                visible: ["faculty"],
            },
            {
                icon: FiUserCheck,
                label: "Attendance",
                href: "/student/attendance",
                visible: ["student"],
            },
            {
                label: 'Leave',
                href: '/faculty/leave',
                icon: FaRegCalendarTimes,
                visible: ["faculty"],
            },
            {
                label: 'Leave',
                href: '/student/leave',
                icon: FaRegCalendarTimes,
                visible: ["student"],
            },
        ],
    },
    {
        title: "OTHER",
        items: [
            {
                icon: RxAvatar,
                label: "Profile",
                href: "/profile",
                visible: ["admin", "faculty", "student"],
            },
            {
                icon: LuSettings,
                label: "Settings",
                href: "/settings",
                visible: ["admin", "faculty", "student"],
            },
        ],
    },
];


const SidebarMenu = async () => {
    // const user = await getUser()
    // const role = user!.role
    const role = "admin"

    return (
        <div className="mt-2 text-sm">
            {menuItems.map((i) => (
                <div className="flex flex-col gap-2" key={i.title}>
                    <span className="hidden lg:block text-white font-light my-4">
                        {i.title}
                    </span>
                    {i.items.map((item) => {
                        if (item.visible.includes(role)) {
                            const IconComponent: React.ElementType = item.icon
                            return (
                                <Link
                                    href={item.href}
                                    key={item.label}
                                    className="flex items-center justify-center lg:justify-start gap-4 text-white py-2 md:px-2 rounded-md hover:bg-indigo-500 duration-300"
                                >
                                    {IconComponent && <IconComponent className='w-5 h-5' />}
                                    <span className="hidden lg:block">{item.label}</span>
                                </Link>
                            );
                        }
                    })}
                </div>
            ))}
        </div>
    )
}

export default SidebarMenu