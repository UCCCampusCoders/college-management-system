import "../globals.css";
import Header from "@/components/Header/Header";
import SidebarMenu from "@/components/Sidebar/SidebarMenu";
import Link from "next/link";
import { HiAcademicCap } from "react-icons/hi";
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css";

export const metadata = {
    title: "AMS",
    description: "Attendance Management System",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <html>
            <body>
                <div className="h-screen flex">
                    <div className="w-[14%] md:w-[12%] lg:w-[16%] xl:w-[14%] p-4 bg-blue-950 overflow-y-scroll">
                        <Link
                            href="/"
                            className="flex items-center justify-center lg:justify-start gap-2 text-white"
                        >
                            <HiAcademicCap className="h-10 w-10" />
                            <span className="hidden lg:block font-bold">AMS</span>
                        </Link>
                        <SidebarMenu />
                    </div>
                    <div className="w-[86%] md:w-[88%] lg:w-[84%] xl:w-[86%] bg-[#F7F8FA] overflow-scroll flex flex-col">
                        <Header />
                        {children}
                    </div>
                </div>
                <ToastContainer position="top-right" autoClose={2000} />
            </body>
        </html>

    );
}