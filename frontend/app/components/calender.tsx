'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchMealActivity } from '../store/features/activitySlice';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const dateKey = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const dateFromKey = (value: string) => {
    const [year, month, day] = value.split('-').map(Number);
    return year && month && day ? new Date(year, month - 1, day) : new Date();
};

export default function DatePicker() {
    const dispatch = useAppDispatch();
    const selectedDate = useAppSelector((state) => state.activity.current.selectedDate);
    const loading = useAppSelector((state) => state.activity.loading);
    const [showCalendar, setShowCalendar] = useState(false);
    const [calendarDate, setCalendarDate] = useState(new Date());

    const dateObj = dateFromKey(selectedDate || dateKey(new Date()));

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
        dispatch(fetchMealActivity(dateKey(newDate)));
    };

    const handleNextDay = () => {
        const newDate = new Date(dateObj);
        newDate.setDate(newDate.getDate() + 1);
        dispatch(fetchMealActivity(dateKey(newDate)));
    };

    const handleDateSelect = (day: number) => {
        const newDate = new Date(calendarDate);
        newDate.setDate(day);
        dispatch(fetchMealActivity(dateKey(newDate)));
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
            <div className="flex items-center gap-0 sm:gap-1">
                <button
                    type="button"
                    onClick={handlePrevDay}
                    disabled={loading}
                    className="btn btn-ghost h-8 min-h-8 w-8 min-w-8 p-0 sm:h-11 sm:min-h-11 sm:w-11 sm:min-w-11"
                    aria-label="Previous day"
                >
                    <ChevronLeft className="h-5 w-5 sm:h-7 sm:w-7" />
                </button>

                <button
                    type="button"
                    onClick={() => {
                        setCalendarDate(dateObj);
                        setShowCalendar(!showCalendar);
                    }}
                    className="btn btn-ghost min-h-8 px-1 text-[0.7rem] sm:min-h-11 sm:px-2 sm:text-sm"
                    aria-expanded={showCalendar}
                    aria-haspopup="dialog"
                >
                    {loading ? 'Loading...' : formatDate(dateObj)}
                </button>

                <button
                    type="button"
                    onClick={handleNextDay}
                    disabled={loading}
                    className="btn btn-ghost h-8 min-h-8 w-8 min-w-8 p-0 sm:h-11 sm:min-h-11 sm:w-11 sm:min-w-11"
                    aria-label="Next day"
                >
                    <ChevronRight className="h-5 w-5 sm:h-7 sm:w-7" />
                </button>
            </div>

            {showCalendar && (
                <div className="card absolute top-full left-1/2 z-10 mt-2 w-[min(18.75rem,calc(100vw-1rem))] -translate-x-1/2 p-3" role="dialog" aria-label="Choose a date">
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
