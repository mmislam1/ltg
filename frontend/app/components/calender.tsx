'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setSelectedDate } from '../store/features/activitySlice';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function DatePicker() {
    const dispatch = useAppDispatch();
    const selectedDate = useAppSelector((state) => state.activity.current.selectedDate);
    const [showCalendar, setShowCalendar] = useState(false);
    const [calendarDate, setCalendarDate] = useState(new Date());

    const dateObj = selectedDate ? new Date(selectedDate) : new Date();

    useEffect(() => {
        if (!selectedDate) {
            const today = new Date().toISOString().split('T')[0];
            dispatch(setSelectedDate(today));
        }
    }, [dispatch, selectedDate]);

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
        console.log(newDate.toISOString())
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
                    type="button"
                    onClick={handlePrevDay}
                    className="btn btn-ghost btn-icon"
                    aria-label="Previous day"
                >
                    <ChevronLeft size={30} />
                </button>

                <button
                    type="button"
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="btn btn-ghost px-2 text-xs md:text-sm"
                    aria-expanded={showCalendar}
                    aria-haspopup="dialog"
                >
                    {formatDate(dateObj)}
                </button>

                <button
                    type="button"
                    onClick={handleNextDay}
                    className="btn btn-ghost btn-icon"
                    aria-label="Next day"
                >
                    <ChevronRight size={30} />
                </button>
            </div>

            {showCalendar && (
                <div className="card absolute top-full left-1/3 z-10 mt-2 w-75 -translate-x-1/2 p-3" role="dialog" aria-label="Choose a date">
                    <div className="flex items-center justify-between mb-4">
                        <button type="button" onClick={handlePrevMonth} className="btn btn-ghost btn-icon btn-icon-sm" aria-label="Previous month">
                            <ChevronLeft size={20} />
                        </button>
                        <div className="text-center font-bold min-w-[150px]">
                            {calendarDate.toLocaleDateString('en-US', {
                                month: 'long',
                                year: 'numeric',
                            })}
                        </div>
                        <button type="button" onClick={handleNextMonth} className="btn btn-ghost btn-icon btn-icon-sm" aria-label="Next month">
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-2 mb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                            <div key={day} className="flex h-10 w-10 items-center justify-center text-sm font-semibold text-muted">
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
                                type="button"
                                key={day}
                                onClick={() => handleDateSelect(day)}
                                className={`btn btn-icon btn-icon-sm text-sm ${dateObj.getDate() === day && dateObj.getMonth() === calendarDate.getMonth() && dateObj.getFullYear() === calendarDate.getFullYear()
                                    ? 'btn-primary'
                                    : 'btn-ghost'
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
