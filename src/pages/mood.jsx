import React, { useEffect, useState } from "react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks, isToday } from "date-fns";
import "../App.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5068";

// List of emotions for user selection
const EMOTIONS = [
  "angry",
  "sad",
  "tired",
  "anxious",
  "neutral",
  "content",
  "happy",
  "excited",
  "grateful",
];

// Normalizes date to midnight (...zzz...) for consistent comparison
function normalizeDate(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Gets the CSS class based on mood value for the circle colors
const getMoodCircleColor = (mood) => {
  if (mood == null) return "bg-gradient-to-br from-gray-500 to-gray-700";
  if (mood <= 2) return "bg-gradient-to-br from-red-500 to-red-700";
  if (mood <= 4) return "bg-gradient-to-br from-yellow-500 to-yellow-700";
  if (mood <= 6) return "bg-gradient-to-br from-blue-500 to-blue-700";
  if (mood <= 8) return "bg-gradient-to-br from-green-500 to-green-700";
  return "bg-gradient-to-br from-pink-500 to-pink-700";
};

// Gets the CSS class based on mood value for the card backgrounds
function getMoodClass(mood) {
  if (mood == null) return "bg-gradient-to-br from-gray-400 to-gray-500";
  if (mood <= 2) return "bg-gradient-to-br from-red-400 to-red-500";
  if (mood <= 4) return "bg-gradient-to-br from-yellow-400 to-yellow-500";
  if (mood <= 6) return "bg-gradient-to-br from-blue-400 to-blue-500";
  if (mood <= 8) return "bg-gradient-to-br from-green-400 to-green-500";
  return "bg-gradient-to-br from-pink-400 to-pink-500";
}

// Gets the dark background color class for emotion display
// Making it look niiiiiiiiice
function getEmotionBgClass(mood) {
  if (mood == null) return "bg-gradient-to-br from-gray-500 to-gray-600";
  if (mood <= 2) return "bg-gradient-to-br from-red-500 to-red-600";
  if (mood <= 4) return "bg-gradient-to-br from-yellow-500 to-yellow-600";
  if (mood <= 6) return "bg-gradient-to-br from-blue-500 to-blue-600";
  if (mood <= 8) return "bg-gradient-to-br from-green-500 to-green-600";
  return "bg-gradient-to-br from-pink-500 to-pink-600";
}

// Gets the light background color class for the weekday titles
function getEmotionBgLightClass(mood) {
  if (mood == null) return "bg-gradient-to-br from-gray-100 to-gray-200";
  if (mood <= 2) return "bg-gradient-to-br from-red-100 to-red-200";
  if (mood <= 4) return "bg-gradient-to-br from-yellow-100 to-yellow-200";
  if (mood <= 6) return "bg-gradient-to-br from-blue-100 to-blue-200";
  if (mood <= 8) return "bg-gradient-to-br from-green-100 to-green-200";
  return "bg-gradient-to-br from-pink-100 to-pink-200";
}

// Gets the emoji representation of the mood
// KEEP IT CORNY
function getMoodEmoji(mood) {
  if (mood == null) return "🤔";
  if (mood <= 2) return "😞";
  if (mood <= 4) return "😕";
  if (mood <= 6) return "🙂";
  if (mood <= 8) return "😄";
  return "🤩";
}

// Gets the week as an array of dates for the user's view
function getWeekForDate(date) {
  return eachDayOfInterval({
    start: startOfWeek(date, { weekStartsOn: 0 }),
    end: endOfWeek(date, { weekStartsOn: 0 }),
  });
}

// Displays mood check-in interface for the user
// Allows them to log their mood and select an emotion for each day of the week
export default function Mood({ userId }) {
  const [moods, setMoods] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMood, setSelectedMood] = useState(5);
  const [selectedEmotions, setSelectedEmotions] = useState({});
  const [feedback, setFeedback] = useState("");
  const [weekStartDate, setWeekStartDate] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));

  // Load existing mood entries for the user
  useEffect(() => {
    // Fetch moods from the server for the given userId
    fetch(`${API}/journalentries?userId=${userId}`)
      // Filter to only include mood check-in entries  
      .then(res => res.json())
      .then(data => {
        setMoods(data.filter(entry => entry.content === "Mood check-in only."));
        // Populate selectedEmotions from loaded data
        const emotions = {};
        data.forEach(entry => {
          if (entry.content === "Mood check-in only." && entry.date && entry.emotion) {
            const key = normalizeDate(entry.date).getTime();
            emotions[key] = entry.emotion;
          }
        });
        setSelectedEmotions(emotions);
      })
      .catch(err => console.error("Error loading moods:", err));
  }, [userId]);

  // Find a mood entry for a specific date
  const findMoodEntryForDate = (date) => {
    const normalized = normalizeDate(date).getTime();
    return moods.find(m => normalizeDate(m.date).getTime() === normalized);
  };

  // Get the mood for a specific date, or null if no entry exists
  const getMoodForDate = (date) => {
    const entry = findMoodEntryForDate(date);
    return entry ? entry.mood : null;
  };

  // Get the emotion for a specific date, or an empty string if no entry exists
  const getEmotionForDate = (date) => {
    const key = normalizeDate(date).getTime();
    return selectedEmotions[key] || "";
  };

  // For below zzz
  const [selectedEmotion, setSelectedEmotion] = useState("");

  // Update selectedEmotion when selectedDate changes
  // This makes sure the input reflects the emotion for the currently selected date
  useEffect(() => {
    // When selectedDate changes, update selectedEmotion
    const key = normalizeDate(selectedDate).getTime();
    setSelectedEmotion(selectedEmotions[key] || "");
  }, [selectedDate, selectedEmotions]);

  // Handle mood logging for the selected date
  const handleLogMood = async () => {
    const existingEntry = findMoodEntryForDate(selectedDate);
    const key = normalizeDate(selectedDate).getTime();
    const emotion = selectedEmotion || "";
    const entryData = {
      userId,
      content: "Mood check-in only.",
      mood: selectedMood,
      emotion,
      date: selectedDate.toISOString(),
    };

    // If an entry already exists for this date, update it
    // Otherwise, create a new entry... PUT v. POST -> typical slogging
    try {
      if (existingEntry) {
        const res = await fetch(`${API}/journalentries/${existingEntry.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(entryData),
        });
        if (!res.ok) throw new Error("Failed to update mood!!");
        setMoods(prev =>
          prev.map(m =>
            m.id === existingEntry.id ? { ...m, mood: selectedMood, emotion, date: selectedDate.toISOString() } : m
          )
        );
        setSelectedEmotions(prev => ({ ...prev, [key]: emotion }));
        setFeedback("Your mood has been updated. Thanks for checking in!");
      } else {
        const res = await fetch(`${API}/journalentries`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(entryData),
        });
        if (!res.ok) throw new Error("Failed to log mood!! :(");
        const saved = await res.json();
        setMoods(prev => [...prev, saved]);
        setSelectedEmotions(prev => ({ ...prev, [key]: emotion }));
        setFeedback("Mood saved! Thank you for checking in.");
      }
      setTimeout(() => setFeedback(""), 2000);
    } catch (err) {
      console.error("Failed to save mood:", err);
      setFeedback("Couldn't save mood!! Please try again.");
      setTimeout(() => setFeedback(""), 2000);
    }
  };

  // Week navigation handlers
  const handlePrevWeek = () => {
    const newStart = subWeeks(weekStartDate, 1);
    setWeekStartDate(newStart);
    // If selectedDate is not in new week, set to first day of new week
    const weekDates = getWeekForDate(newStart);
    if (!weekDates.some(day => isSameDay(day, selectedDate))) {
      setSelectedDate(weekDates[0]);
    }
  };

  // Move to next week on the interface view
  const handleNextWeek = () => {
    const newStart = addWeeks(weekStartDate, 1);
    setWeekStartDate(newStart);
    // If selectedDate is not in new week, set to first day of new week
    const weekDates = getWeekForDate(newStart);
    if (!weekDates.some(day => isSameDay(day, selectedDate))) {
      setSelectedDate(weekDates[0]);
    }
  };

  // Gets all mood scores for the week + returns average score
  const week = getWeekForDate(weekStartDate);
  const weekMoods = week.map(getMoodForDate).filter(m => m != null);
  const averageMood = weekMoods.length ? (weekMoods.reduce((a, b) => a + b, 0) / weekMoods.length).toFixed(1) : "N/A";
  const isMoodValid = selectedMood >= 1 && selectedMood <= 10;

  // Interface rendering + design
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-blue-200 to-blue-50">
      <header className="w-full text-center py-5 bg-gradient-to-br from-blue-400 to-blue-500 shadow-md text-blue-950 font-bold tracking-wide">
        <h1 className="text-3xl font-bold text-blue-50">Mood Meter</h1>
        <p className="text-sm text-blue-100 mt-1">Track your mood and emotions throughout the week</p>
      </header>
      <div className="max-w-3xl mx-auto mt-4 px-6 py-5 bg-gradient-to-b from-blue-300 via-blue-300 to-blue-300 rounded-2xl shadow-lg">
        <div className="mb-5 text-gray-600">
          Select a day to begin.
        </div>
        <div className="relative flex items-center justify-between mb-5 bg-blue-50 p-3 rounded shadow">
          <button
            onClick={handlePrevWeek}
            className="px-3 py-1 rounded bg-indigo-100 hover:bg-gray-300 font-semibold transition shadow-md hover:shadow-lg z-10"
          >
            Previous
          </button>

          <div className="absolute left-1/2 transform -translate-x-1/2 text-lg font-semibold text-gray-800">
            {format(weekStartDate, "MMM dd")} – {format(endOfWeek(weekStartDate, { weekStartsOn: 0 }), "MMM dd")}
          </div>

          <button
            onClick={handleNextWeek}
            className="px-3 py-1 rounded bg-indigo-100 hover:bg-gray-300 font-semibold transition shadow-md hover:shadow-lg z-10"
          >
            Next
          </button>
        </div>

        <div className="mb-6 p-4 rounded-xl shadow-md bg-gradient-to-br from-indigo-100 via-blue-100 to-indigo-200">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {week.map((day) => {
              const mood = getMoodForDate(day);
              const isSelected = isSameDay(day, selectedDate);
              const emotion = getEmotionForDate(day);
              return (
                <div
                  key={day}
                  onClick={() => setSelectedDate(day)}
                  className={`rounded-lg p-4 text-center cursor-pointer transition shadow-md hover:shadow-lg wobble ${getMoodClass(mood)} ${isSelected ? "ring-2 ring-indigo-600" : ""}`}
                >
                  <div className={`text-sm font-bold text-black rounded px-1.5 py-0.4 inline-block ${getEmotionBgLightClass(mood)} ${isToday(day) ? "bg-yellow-200" : ""}`}>
                    {format(day, "EEE")}
                  </div>
                  <div className="text-xs text-gray-800">{format(day, "MM/dd")}</div>
                  <div className="relative inline-block w-9 h-9 mt-1.5 mb-1">
                    <div className={`w-full h-full flex items-center justify-center text-sm font-bold text-white rounded-full ${getMoodCircleColor(mood)}`}>
                      {mood ?? "—"}
                    </div>
                    <div className="absolute -bottom-1.5 -right-1.5 bg-white rounded-full p-.2 shadow text-[14px]">
                      {getMoodEmoji(mood)}
                    </div>
                  </div>
                  <div className={`mt-2 text-xs font-semibold text-white px-2 py-1 rounded ${getEmotionBgClass(mood)}`}>
                    <span className="capitalize">{emotion || "N/A"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="w-80 mx-auto text-lg text-gray-800 font-semibold rounded shadow-md hover:shadow-lg transition border mb-8 px-4 py-2.5 bg-blue-50">
          This Week's Average: <span className="font-bold">{averageMood}</span>
        </div>

        <div className="mb-6 p-6 rounded-xl bg-gradient-to-br from-indigo-100 via-blue-50 to-indigo-200 shadow-md">
          <div className="flex items-center justify-center gap-4 mb-2">
            <label htmlFor="moodInput" className="mb-1 font-semibold text-indigo-600">Mood (1–10):</label>
            <input
              id="moodInput"
              type="number"
              min={1}
              max={10}
              value={selectedMood}
              onChange={(e) => setSelectedMood(Number(e.target.value))}
              className="w-24 p-2 text-center rounded-lg border border-gray-300 shadow-md bg-gradient-to-br from-white to-gray-100 focus:ring-indigo-400"
            />

            <label htmlFor="emotionPicker" className="mb-1 font-semibold text-indigo-600">Emotion:</label>
            <select
              id="emotionPicker"
              value={selectedEmotion}
              onChange={(e) => setSelectedEmotion(e.target.value)}
              className="p-2 rounded-lg border border-gray-300 shadow-md bg-gradient-to-br from-white to-gray-100"
            >
              <option value="">Select emotion</option>
              {EMOTIONS.map(em => (
                <option key={em} value={em}>
                  {em.charAt(0).toUpperCase() + em.slice(1)}
                </option>
              ))}
            </select>

            <button
              onClick={handleLogMood}
              disabled={!isMoodValid}
              className={`px-4 py-2 rounded-lg transition shadow-md hover:shadow-lg ml-2 ${isMoodValid ? "bg-indigo-400 text-white hover:bg-indigo-600" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}>
              Log Mood
            </button>
          </div>
          {feedback && (<div className="mt-4 text-green-700 font-semibold text-center">{feedback}</div>)}
        </div>
      </div>
    </div>
  );
}
