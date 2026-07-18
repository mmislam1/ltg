'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchMealActivity } from '../store/features/activitySlice';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

const dateKey = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const dateFromKey = (value: string) => {
    const [year, month, day] = value.split('-').map(Number);
    return year && month && day ? new Date(year, month - 1, day) : new Date();
};

const dateKeyInTimezone = (date: Date, timezone?: string) => {
    if (!timezone) return dateKey(date);
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(date);
    const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value;
    return `${value('year')}-${value('month')}-${value('day')}`;
};

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const isSameDate = (first: Date, second: Date) =>
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate();

export default function DatePicker({ maxDate }: { maxDate?: string } = {}) {
    const dispatch = useAppDispatch();
    const selectedDate = useAppSelector((state) => state.activity.current.selectedDate);
    const loading = useAppSelector((state) => state.activity.loading);
    const userTimezone = useAppSelector((state) => state.auth.user?.timezone);
    const [showCalendar, setShowCalendar] = useState(false);
    const [calendarDate, setCalendarDate] = useState(new Date());

    const todayKey = maxDate || dateKeyInTimezone(new Date(), userTimezone);
    const dateObj = dateFromKey(selectedDate || todayKey);
    const today = dateFromKey(todayKey);
    const isTodayOrLater = dateObj >= today;
    const canGoNextMonth =
        calendarDate.getFullYear() < today.getFullYear() ||
        (calendarDate.getFullYear() === today.getFullYear() && calendarDate.getMonth() < today.getMonth());

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const selectedDayLabel = dateObj.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
    });

    const calendarMonthLabel = calendarDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
    });

    const handlePrevDay = () => {
        const newDate = new Date(dateObj);
        newDate.setDate(newDate.getDate() - 1);
        dispatch(fetchMealActivity(dateKey(newDate)));
    };

    const handleNextDay = () => {
        if (isTodayOrLater) return;
        const newDate = new Date(dateObj);
        newDate.setDate(newDate.getDate() + 1);
        dispatch(fetchMealActivity(dateKey(newDate)));
    };

    const handleDateSelect = (day: number) => {
        const newDate = new Date(calendarDate);
        newDate.setDate(day);
        if (newDate > today) return;
        dispatch(fetchMealActivity(dateKey(newDate)));
        setShowCalendar(false);
    };

    const handlePrevMonth = () => {
        setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1));
    };

    const handleNextMonth = () => {
        if (!canGoNextMonth) return;
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
        <div className="relative inline-flex min-w-0">
            <div className="grid w-full grid-cols-[2rem_minmax(7.75rem,1fr)_2rem] items-center rounded-xl border border-line bg-surface p-1 shadow-sm sm:grid-cols-[2.25rem_minmax(10.5rem,1fr)_2.25rem]">
                <button
                    type="button"
                    onClick={handlePrevDay}
                    disabled={loading}
                    className="btn btn-ghost h-8 min-h-8 w-8 min-w-8 rounded-lg p-0 sm:h-9 sm:min-h-9 sm:w-9 sm:min-w-9"
                    aria-label="Previous day"
                >
                    <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>

                <button
                    type="button"
                    onClick={() => {
                        setCalendarDate(dateObj);
                        setShowCalendar(!showCalendar);
                    }}
                    className="group min-w-0 cursor-pointer rounded-lg px-2 py-1.5 text-center transition hover:bg-brand-soft"
                    aria-expanded={showCalendar}
                    aria-haspopup="dialog"
                >
                    <span className="flex min-w-0 items-center justify-center gap-1.5 text-sm font-bold leading-5 text-ink group-hover:text-brand-active">
                        <CalendarDays className="h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
                        <span className="truncate tabular-nums">{loading ? 'Loading...' : formatDate(dateObj)}</span>
                    </span>
                    <span className="mt-0.5 hidden truncate text-[0.68rem] font-semibold leading-4 text-muted group-hover:text-brand-active sm:block">
                        {selectedDayLabel}
                    </span>
                </button>

                <button
                    type="button"
                    onClick={handleNextDay}
                    disabled={loading || isTodayOrLater}
                    className="btn btn-ghost h-8 min-h-8 w-8 min-w-8 rounded-lg p-0 sm:h-9 sm:min-h-9 sm:w-9 sm:min-w-9"
                    aria-label="Next day"
                >
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
            </div>

            {showCalendar && (
                <div className="absolute left-0 top-full z-10 mt-3 w-[min(20rem,calc(100vw-1rem))] rounded-xl border border-line bg-surface p-3 shadow-xl shadow-ink/10 sm:left-1/2 sm:-translate-x-1/2 sm:p-4" role="dialog" aria-label="Choose a date">
                    <div className="mb-3 flex items-center justify-between gap-3 rounded-lg bg-canvas p-2">
                        <button type="button" onClick={handlePrevMonth} className="btn btn-ghost btn-icon btn-icon-sm rounded-lg" aria-label="Previous month">
                            <ChevronLeft size={18} />
                        </button>
                        <div className="min-w-0 text-center">
                            <div className="truncate text-base font-bold leading-5 text-ink">
                                {calendarMonthLabel}
                            </div>
                            <div className="mt-0.5 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-muted">
                                Select date
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleNextMonth}
                            disabled={!canGoNextMonth}
                            className="btn btn-ghost btn-icon btn-icon-sm rounded-lg"
                            aria-label="Next month"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>

                    <div className="mb-1 grid grid-cols-7 gap-1">
                        {dayNames.map((day) => (
                            <div key={day} className="flex h-8 items-center justify-center text-[0.68rem] font-bold uppercase tracking-wide text-muted">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {emptyDays.map((_, i) => (
                            <div key={`empty-${i}`} className="h-9" />
                        ))}
                        {days.map((day) => {
                            const cellDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day);
                            const isSelected = isSameDate(dateObj, cellDate);
                            const isToday = isSameDate(today, cellDate);
                            const isFuture = cellDate > today;

                            return (
                                <button
                                    type="button"
                                    key={day}
                                    onClick={() => handleDateSelect(day)}
                                    disabled={isFuture}
                                    aria-current={isToday ? 'date' : undefined}
                                    aria-pressed={isSelected}
                                    className={`relative grid h-9 min-h-9 w-full place-items-center rounded-lg p-0 text-sm font-bold tabular-nums transition ${
                                        isSelected
                                            ? 'bg-brand text-on-brand shadow-sm'
                                            : isToday
                                                ? 'bg-brand-soft text-brand-active'
                                                : 'text-ink hover:bg-brand-soft hover:text-brand-active'
                                    }`}
                                >
                                    {day}
                                    {isToday && !isSelected && (
                                        <span className="absolute bottom-1 h-1 w-1 rounded-full bg-brand" aria-hidden="true" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
