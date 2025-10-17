'use client'
import { useState } from "react";

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {

    return(
        <div className="">
            <nav className="w-64 fixed h-[93vh] z-[99] top-[9vh] bg-[#6f9556] border-r border-gray-700 p-0 overflow-y-auto">
            <div className="pt-[40px]">
                <div className="px-6 mb-4">
                <h3 className="text-gray-200 text-xl  tracking-wider mb-2">Patient Portal</h3>
                <div className="space-y-1">
                    <button 
                    className={`w-full flex cursor-pointer items-center rounded-[7px] gap-3 px-4 py-3 text-left transition-all ${
                        activeTab === 'overview' 
                        ? 'bg-[#f5d709] text-lack ' 
                        : 'text-gray-300 hover:bg-[#f5d709] hover:text-black '
                    }`}
                    onClick={() => setActiveTab('overview')}
                    >
                    
                    <span className="font-medium">Dashboard Overview</span>
                    </button>
                    
                    
               </div>   
               
                
            </div>
            <div className="px-6 mb-4">
                <h3 className="text-gray-200 text-sm  tracking-wider mb-2">Quick Action</h3>
                <div className="space-y-1">
                    <button 
                    className={`w-full flex cursor-pointer items-center rounded-[7px] gap-3 px-4 py-3 text-left transition-all ${
                        activeTab === 'booking' 
                        ? 'bg-[#f5d709] text-lack ' 
                        : 'text-gray-300 hover:bg-[#f5d709] hover:text-black '
                    }`}
                    onClick={() => setActiveTab('booking')}
                    >
                    
                    <span className="font-medium">+ Book Appointment</span>
                    </button>
                    <button 
                    className={`w-full flex cursor-pointer items-center rounded-[7px] gap-3 px-4 py-3 text-left transition-all ${
                        activeTab === 'appointment' 
                        ? 'bg-[#f5d709] text-lack ' 
                        : 'text-gray-300 hover:bg-[#f5d709] hover:text-black '
                    }`}
                    onClick={() => setActiveTab('appointment')}
                    >
                    
                    <span className="font-medium">Appointments</span>
                    </button>
                    
                    
               </div>   
               
                
            </div>
            </div>
            </nav>

        </div>
        
    )
}

export default Sidebar;