'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setSelectedDate } from '../store/features/activitySlice';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function DatePicker() {
    const dispatch = useAppDispatch();
    const selectedDate = useAppSelector((state) => state.activity.selectedDate);
    const [showCalendar, setShowCalendar] = useState(false);
    const [calendarDate, setCalendarDate] = useState(new Date());

    const dateObj = selectedDate ? new Date(selectedDate) : new Date();

    if (!selectedDate) {
        const today = new Date().toISOString().split('T')[0];
        dispatch(setSelectedDate(today));
    }

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const handlePrevDay = () => {
        const newDate = new Date(dateObj);
        newDate.setDate(newDate.getDate() - 1);
        dispatch(setSelectedDate(newDate.toISOString().split('T')[0]));
    };

    const handleNextDay = () => {
        const newDate = new Date(dateObj);
        newDate.setDate(newDate.getDate() + 1);
        dispatch(setSelectedDate(newDate.toISOString().split('T')[0]));
    };

    const handleDateSelect = (day: number) => {
        const newDate = new Date(calendarDate);
        newDate.setDate(day);
        dispatch(setSelectedDate(newDate.toISOString().split('T')[0]));
        setShowCalendar(false);
    };

    const handlePrevMonth = () => {
        setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1));
    };

    const handleNextMonth = () => {
        setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1));
    };

    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const daysInMonth = getDaysInMonth(calendarDate);
    const firstDay = getFirstDayOfMonth(calendarDate);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const emptyDays = Array.from({ length: firstDay }, () => null);

    return (
        <div className="relative inline-block">
            <div className="flex items-center gap-1">
                <button
                    onClick={handlePrevDay}
                    className="p-1 hover:bg-gray-200 rounded"
                >
                    <ChevronLeft size={30} />
                </button>

                <button
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="px-1 py-2 rounded hover:bg-gray-100 text-gray-600 font-bold text-md"
                >
                    {formatDate(dateObj)}
                </button>

                <button
                    onClick={handleNextDay}
                    className="p-1 hover:bg-gray-200 rounded"
                >
                    <ChevronRight size={30} />
                </button>
            </div>

            {showCalendar && (
                <div className="absolute top-full mt-2 bg-white border border-gray-500 rounded-lg shadow-lg p-4 z-10 w-70 left-1/2 -translate-x-1/2">
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-200 rounded">
                            <ChevronLeft size={20} />
                        </button>
                        <div className="text-center font-bold min-w-[150px]">
                            {calendarDate.toLocaleDateString('en-US', {
                                month: 'long',
                                year: 'numeric',
                            })}
                        </div>
                        <button onClick={handleNextMonth} className="p-1 hover:bg-gray-200 rounded">
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-2 mb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                            <div key={day} className="w-10 h-10 flex items-center justify-center text-md font-semibold text-gray-500">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        {emptyDays.map((_, i) => (
                            <div key={`empty-${i}`} className="w-10 h-10" />
                        ))}
                        {days.map((day) => (
                            <button
                                key={day}
                                onClick={() => handleDateSelect(day)}
                                className={`w-10 h-10 flex items-center justify-center rounded text-md font-semibold text-gray-500 ${dateObj.getDate() === day && dateObj.getMonth() === calendarDate.getMonth() && dateObj.getFullYear() === calendarDate.getFullYear()
                                    ? 'bg-blue-500 text-white'
                                    : 'hover:bg-gray-200'
                                    }`}
                            >
                                {day}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}