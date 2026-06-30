'use client'
import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit, Trash2, Share2, Copy, Plus, CheckIcon, List, PlusCircleIcon, CopyIcon, MenuIcon, Send, DockIcon, File } from 'lucide-react';
import { FaCopy } from 'react-icons/fa';
import { useDeviceType } from '../hooks/useDeviceType';
import { useRouter } from 'next/navigation';

interface MenuItem {
    id: string;
    label: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    danger?: boolean;
}

interface DropdownMenuProps {
    items: MenuItem[];
    onItemClick?: (item: MenuItem) => void;
}

export default function DropdownMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const device = useDeviceType()
    const router = useRouter()




    const items = [{
        id: '1',
        label: 'Mark Day as Complete',
        icon: <CheckIcon />,
        onClick:()=>router.push('/'),
    },
    {
        id: '2',
        label: 'Daily Report',
        icon: <List />,
        onClick: () => router.push('/'),
    },
    {
        id: '3',
        label: 'Multi-Select',
        icon: <PlusCircleIcon />,
        onClick: () => router.push('/'),
    },
    {
        id: '4',
        label: 'Copy Current Day',
        icon: <CopyIcon />,
        onClick: () => router.push('/'),
    },
    {
        id: '5',
        label: 'Copy Previous Day',
        icon: <File />,
        onClick: () => router.push('/'),
    },
    {
        id: '6',
        label: 'Clear All Serving Sizes',
        icon: <MenuIcon />,
        onClick: () => router.push('/'),
    },
    {
        id: '7',
        label: 'Delete All Diary Entries',
        icon: <Trash2 />,
        onClick: () => router.push('/'),
    },
    {
        id: '8',
        label: 'Export Chart',
        icon: <Send />,
        onClick: () => router.push('/chart'),

    }
    ]

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleItemClick = (item: MenuItem) => {
        /*item.onClick();
        onItemClick?.(item);
        setIsOpen(false);*/
    };

    return (
        <div className="relative inline-block">
            <button
                type="button"
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className="btn btn-ghost btn-icon"
                aria-label="Menu"
                aria-expanded={isOpen}
                aria-haspopup="menu"
            >
                <MoreVertical size={20} />
            </button>

            {isOpen && (
                <div
                    ref={menuRef}
                    className="card absolute right-0 z-10 mt-2 w-65 py-1"
                    role="menu"
                >
                    {items.map((item) => (
                        <button
                            type="button"
                            key={item.id}
                            onClick={item.onClick}
                            className="btn btn-ghost w-full justify-start rounded-none px-4 text-left text-sm"
                            role="menuitem"
                        >
                            {item.icon && <span className="text-lg">{item.icon}</span>}
                            <span className={device === 'm' ? 'text-sm' : 'text-base'}>{item.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// Example usage component
export function DropdownMenuExample() {
    const [menuItems] = useState<MenuItem[]>([
        {
            id: '1',
            label: 'Edit',
            icon: <Edit size={16} />,
            onClick: () => console.log('Edit clicked'),
        },
        {
            id: '2',
            label: 'Copy',
            icon: <Copy size={16} />,
            onClick: () => console.log('Copy clicked'),
        },
        {
            id: '3',
            label: 'Share',
            icon: <Share2 size={16} />,
            onClick: () => console.log('Share clicked'),
        },
        {
            id: '4',
            label: 'Delete',
            icon: <Trash2 size={16} />,
            onClick: () => console.log('Delete clicked'),
            danger: true,
        },
    ]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-canvas">
            <div className="card p-8">
                <h1 className="text-2xl font-bold mb-6">Dropdown Menu Example</h1>
                <div className="flex items-center gap-4">
                    <span className="text-muted">Click the menu button:</span>
                    <DropdownMenu />
                </div>
            </div>
        </div>
    );
}
