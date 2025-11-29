import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit, Trash2, Share2, Copy, Plus, CheckIcon, List, PlusCircleIcon, CopyIcon, MenuIcon, Send, DockIcon, File } from 'lucide-react';
import { FaCopy } from 'react-icons/fa';

interface MenuItem {
    id: string;
    label: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    danger?: boolean;
}
const items = [{
    id: '1',
    label: 'Mark Day as Complete',
    icon: <CheckIcon/>,
  },
  {
        id: '2',
        label: 'Daily Report',
        icon: <List />,
    },
    {
        id: '3',
        label: 'Multi-Select',
        icon: <PlusCircleIcon />,
    },
    {
        id: '4',
        label: 'Copy Current Day',
        icon: <CopyIcon />,
    },
    {
        id: '5',
        label: 'Copy Previous Day',
        icon: <File/>,
    },
    {
        id: '6',
        label: 'Clear All Serving Sizes',
        icon: <MenuIcon />,
    },
    {
        id: '7',
        label: 'Delete All Diary Entries',
        icon: <Trash2 />,
    },
    {
        id: '8',
        label: 'Export Chart',
        icon: <Send />,
    }
]
interface DropdownMenuProps {
    items: MenuItem[];
    onItemClick?: (item: MenuItem) => void;
}

export default function DropdownMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

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
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Menu"
            >
                <MoreVertical size={20} className="text-gray-600" />
            </button>

            {isOpen && (
                <div
                    ref={menuRef}
                    className="absolute right-0 mt-2 w-65 bg-white rounded-lg shadow-lg border border-gray-200 z-10 py-1"
                >
                    {items.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleItemClick(item)}
                            className={`w-full px-4 py-2 text-left text-sm flex items-center justify-start gap-6 transition-colors 
                                    hover:bg-gray-100 active:bg-gray-100 text-gray-700`}
                        >
                            {item.icon && <span className="font-semibold text-lg text-gray-500">{item.icon}</span>}
                            <span className="font-semibold text-lg text-gray-500">{item.label}</span>
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
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-6">Dropdown Menu Example</h1>
                <div className="flex items-center gap-4">
                    <span className="text-gray-600">Click the menu button:</span>
                    <DropdownMenu />
                </div>
            </div>
        </div>
    );
}