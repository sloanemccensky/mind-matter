import React, { useState, useEffect } from "react";
import { format, addDays, subDays, isToday, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const Gratitude = ({ userId }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [entries, setEntries] = useState({});
    const [inputStates, setInputStates] = useState({});
    const [editingStates, setEditingStates] = useState({});
    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    const entry = entries[formattedDate];
    const input = inputStates[formattedDate] || { notice: "", feeling: "" };
    const editing = editingStates[formattedDate];
    const isEntryToday = isToday(selectedDate);
    const [isTypingDone, setIsTypingDone] = useState(false);
    const startOfSelectedMonth = startOfMonth(selectedDate);
    const endOfSelectedMonth = endOfMonth(selectedDate);

    useEffect(() => {
        // Reset when the date changes
        setIsTypingDone(false);
    }, [selectedDate]);

    const calendarClicka = (date) => {
        setSelectedDate(date);
    };

    const API = "http://localhost:5068";

    // AYO uhhhh this is for any input changes for the notice and feeling fields
    const onInput = (date, field, value) => {
        setInputStates((prev) => ({
            ...prev,
            [date]: {
                ...prev[date],
                [field]: value,
            },
        }));
    };

    // Day nav bar dat ...
    const toPrevDay = () => {
        setSelectedDate((prev) => subDays(prev, 1));
    };

    const toNextDay = () => {
        setSelectedDate((prev) => addDays(prev, 1));
    };

    // Checks if an entry exists for the date, and either updates or creates a new one
    const save = async (date) => {

        const input = inputStates[date] || { notice: "", feeling: "" };
        const existingEntry = entries[date];

        const infoDat = {
            userId,
            date,
            notice: input.notice,
            feeling: input.feeling,
        };

        try {
            const res = await fetch(
                `${API}/gratitude${existingEntry ? `/${existingEntry.id}` : ""}`,
                {
                    method: existingEntry ? "PUT" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(infoDat),
                }
            );

            if (res.ok) {
                const result = await res.json();
                const id = result.id || (existingEntry && existingEntry.id);
                setEntries((prev) => ({ ...prev, [date]: { ...infoDat, id } }));
                setEditingStates((prev) => ({ ...prev, [date]: false }));
                setInputStates((prev) => ({
                    ...prev,
                    [date]: { notice: infoDat.notice, feeling: infoDat.feeling },
                }));
            } else {
                console.error("Save failed!!! Call Sloane.");
            }
        } catch (err) {
            console.error("Error saving dat entry:", err);
        }

    };

    const allDaysInMonth = eachDayOfInterval({
        start: startOfSelectedMonth,
        end: endOfSelectedMonth,
    });

    const loggedDaysCount = allDaysInMonth.filter((day) => {
        const key = format(day, "yyyy-MM-dd");
        return entries[key];
    }).length;

    const filledPercentage = Math.round((loggedDaysCount / allDaysInMonth.length) * 100);

    // GO FISH my deelizzus entries from the API
    useEffect(() => {
        const fetchEntries = async () => {
            try {
                const res = await fetch(`${API}/gratitude?userId=${userId}`);
                const data = await res.json();

                const formatted = {};
                const inputs = {};
                const editing = {};

                data.forEach((entry) => {
                    const dateKey = format(new Date(entry.date), "yyyy-MM-dd");
                    formatted[dateKey] = entry;
                    inputs[dateKey] = {
                        notice: entry.notice,
                        feeling: entry.feeling,
                    };
                    editing[dateKey] = false;
                });

                setEntries(formatted);
                setInputStates(inputs);
                setEditingStates(editing);

            } catch (err) {
                console.error("Gratitoodius loading failed:", err);
            }
        };

        fetchEntries();

    }, [userId]);

    return (
        <div className="w-full min-h-screen bg-gradient-to-b from-cyan-50 via-cyan-200 to-cyan-50 gratitude-log-container">

            <header className="py-5 w-full text-center font-bold tracking-wide shadow-md bg-gradient-to-br from-cyan-500 to-cyan-600">
                <h1 className="text-cyan-50 text-3xl font-bold">Gratitude Log</h1>
                <p className="mt-1 text-sm text-cyan-50">Explore the beauty of smaller moments</p>
            </header>

            <div className="mt-2 py-3 px-6 text-center">
                <div className="flex flex-col items-center gap-1">
                    <div className="text-cyan-900 font-semibold text-sm">
                        Gratitude Level – {loggedDaysCount}/{allDaysInMonth.length} days logged
                    </div>
                    <div className="w-full max-w-xs h-4 bg-cyan-200 rounded-full overflow-hidden shadow-inner">
                        <div
                            className={`h-full transition-all duration-500 ${filledPercentage >= 75 ? "bg-emerald-400" : "bg-yellow-300"}`}
                            style={{ width: `${Math.min(filledPercentage, 100)}%` }}
                        ></div>
                    </div>
                    {filledPercentage >= 75 && (
                        <div className="text-cyan-600 font-bold text-sm mt-1">
                            Monthly Goal Achieved!
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-gradient-to-r from-cyan-300 via-cyan-200 to-cyan-300 flex flex-col lg:flex-row justify-center items-stretch gap-6 px-4 mt-2 py-4 mb-4 max-w-screen-lg mx-auto rounded-lg shadow-lg w-full h-auto">

                <div className="calendar-wrap self-stretch bg-cyan-50 rounded-lg shadow-md p-4 flex items-center justify-center">
                    <Calendar
                        onChange={calendarClicka}
                        value={selectedDate}
                        tileClassName={({ date }) => {
                            const key = format(date, "yyyy-MM-dd");
                            return entries[key] ? "has-entry" : "";
                        }}
                        className="custom-calendar"
                    />
                </div>

                <div className="w-full max-w-xl bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-lg shadow-lg px-6 py-6 flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-4 py-4 px-4 bg-cyan-50 rounded-lg shadow-md">
                        <button
                            onClick={toPrevDay}
                            className="rounded px-4 py-2 font-semibold bg-cyan-300 hover:bg-slate-300 transition shadow"
                        >
                            Prev
                        </button>

                        <div className="text-center flex-1">
                            <span className="text-lg font-semibold text-gray-800">{format(selectedDate, "MMMM d, yyyy")}</span>
                        </div>

                        <button
                            onClick={toNextDay}
                            className="rounded px-4 py-2 font-semibold bg-cyan-300 hover:bg-slate-300 transition shadow"
                        >
                            Next
                        </button>
                    </div>

                    <div className="flex-1 flex items-center justify-center mt-4">
                        <div className={`w-full h-full flex flex-col justify-between gratitude-card max-w-md transition-all duration-300 ease-in-out ${entry ? "filled-entry" : ""}`}>


                            <h3 className={`card-title ${isEntryToday ? "today" : ""} ${isTypingDone ? "typing-done" : ""}`} onAnimationEnd={() => setIsTypingDone(true)}>
                                {isEntryToday ? "Today" : format(selectedDate, "EEEE")}
                            </h3>

                            {entry && !editing ? (
                                <div className="entry-content">

                                    <div className="gratitude-badge">Collected!</div>

                                    <div className="gratitude-line-style">
                                        <p className="gratitude-line-1"><strong>I Noticed:</strong> {entry.notice}</p>
                                    </div>

                                    <div className="gratitude-line-style">
                                        <p className="gratitude-line-2"><strong>I Felt:</strong> {entry.feeling}</p>
                                    </div>

                                    <button className="edit-btn" onClick={() => { setEditingStates((prev) => ({ ...prev, [formattedDate]: true })); }}>
                                        Edit
                                    </button>
                                </div>
                            ) : (
                                <div className="entry-form">

                                    <div className="input-wrapper">
                                        <input
                                            className="gratitude-input-1"
                                            type="text"
                                            maxLength={75}
                                            placeholder="Today I noticed..."
                                            value={input.notice}
                                            onChange={(e) => onInput(formattedDate, "notice", e.target.value)}
                                        />
                                        <span className="char-pill">{(input.notice || "").length}/75</span>
                                    </div>

                                    <div className="input-wrapper">
                                        <input
                                            className="gratitude-input-2"
                                            type="text"
                                            maxLength={75}
                                            placeholder="It made me feel..."
                                            value={input.feeling}
                                            onChange={(e) => onInput(formattedDate, "feeling", e.target.value)}
                                        />
                                        <span className="char-pill">{(input.feeling || "").length}/75</span>
                                    </div>


                                    <button
                                        className="save-btn"
                                        onClick={() => save(formattedDate)}
                                    >
                                        Submit
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="h-10"></div>
        </div>
    );
};

export default Gratitude;
