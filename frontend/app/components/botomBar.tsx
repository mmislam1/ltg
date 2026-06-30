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
            type="button"
            onClick={onClick}
            className={`btn btn-ghost btn-icon flex-col ${isActive ? 'text-brand' : 'text-muted'}`}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
        >
            <div className="w-6 h-6">{icon}</div>
            <span className="sr-only">{label}</span>
        </button>
    );
};

const BottomBar: React.FC = () => {
    const [activeTab, setActiveTab] = useState<string>('home');
    const router = useRouter()

    return (
        <div className="safe-area-bottom fixed right-0 bottom-0 left-0 border-t border-line bg-surface">
            <div className="max-w-screen-lg mx-auto px-4">
                <div className="flex items-center justify-around h-12 relative">
                    {/* Home */}
                    <NavItem
                        icon={<Home className="w-full h-full" strokeWidth={2} />}
                        label="Home"
                        isActive={activeTab === 'home'}
                        onClick={() => {setActiveTab('home'); router.push("/")}}
                    />

                    {/* Diary */}
                    <NavItem
                        icon={<BookOpen className="w-full h-full" strokeWidth={2} />}
                        label="Diary"
                        isActive={activeTab === 'diary'}
                        onClick={() => setActiveTab('diary')}
                    />

                    {/* Center Add Button */}
                    <button
                        type="button"
                        onClick={() => router.push('/manage_meals')}
                        className="btn btn-primary btn-icon -mt-2 h-14 min-h-14 w-14 min-w-14 shadow-lg"
                        aria-label="Manage meals"
                    >
                        <Plus className="h-8 w-8 text-on-brand" strokeWidth={2.5} />
                    </button>

                    {/* Progress */}
                    <NavItem
                        icon={<BarChart3 className="w-full h-full" strokeWidth={2} />}
                        label="Add meal"
                        isActive={activeTab === 'progress'}
                        onClick={() => {setActiveTab('progress');router.push('/add_meal')}}
                    />

                    {/* More */}
                    <NavItem
                        icon={<MoreHorizontal className="w-full h-full" strokeWidth={2} />}
                        label="More"
                        isActive={activeTab === 'more'}
                        onClick={() => setActiveTab('more')}
                    />
                </div>
            </div>
        </div>
    );
};

export default BottomBar;
