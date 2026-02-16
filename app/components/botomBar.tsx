"use client";

import React, { useState } from 'react';
import { Home, BookOpen, Plus, BarChart3, MoreHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface NavItemProps {
    icon: React.ReactNode;
    label: string;
    isActive?: boolean;
    onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${isActive ? 'text-blue-600' : 'text-gray-500'
                } hover:text-blue-600`}
        >
            <div className="w-6 h-6">{icon}</div>
            <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
        </button>
    );
};

const BottomBar: React.FC = () => {
    const [activeTab, setActiveTab] = useState<string>('home');
    const router = useRouter()

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom">
            <div className="max-w-screen-lg mx-auto px-4">
                <div className="flex items-center justify-around h-12 relative">
                    {/* Home */}
                    <NavItem
                        icon={<Home className="w-full h-full" strokeWidth={2} />}
                        label=""
                        isActive={activeTab === 'home'}
                        onClick={() => {setActiveTab('home'); router.push("/")}}
                    />

                    {/* Diary */}
                    <NavItem
                        icon={<BookOpen className="w-full h-full" strokeWidth={2} />}
                        label=""
                        isActive={activeTab === 'diary'}
                        onClick={() => setActiveTab('diary')}
                    />

                    {/* Center Add Button */}
                    <button
                        onClick={() => router.push('/manage_meals')}
                        className="flex items-center justify-center w-14 h-14 bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 transition-colors -mt-2"
                    >
                        <Plus className="w-8 h-8 text-white" strokeWidth={2.5} />
                    </button>

                    {/* Progress */}
                    <NavItem
                        icon={<BarChart3 className="w-full h-full" strokeWidth={2} />}
                        label=""
                        isActive={activeTab === 'progress'}
                        onClick={() => {setActiveTab('progress');router.push('/meals')}}
                    />

                    {/* More */}
                    <NavItem
                        icon={<MoreHorizontal className="w-full h-full" strokeWidth={2} />}
                        label=""
                        isActive={activeTab === 'more'}
                        onClick={() => setActiveTab('more')}
                    />
                </div>
            </div>
        </div>
    );
};

export default BottomBar;