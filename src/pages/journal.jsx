import React, { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5068";

// Mock prompts for the journal
// Switch to LLM-customized based on previous entries later
const mockPrompts = [
  "When was the last time you felt at complete peace?",
  "What do you wish people would ask you more about?",
  "What is the life you envisioned for yourself? Are you living it?",
  "How much of yourself do you let others see?",
  "Describe yourself as though you were a character in a book.",
  "What is something you wish you could change about your life right now?"
];

// Journal component
export default function Journal({ userId }) {
  const [entries, setEntries] = useState([]);
  const [entry, setEntry] = useState("");
  const [prompt, setPrompt] = useState("");
  const [mood, setMood] = useState(5);
  const [saved, setSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  // Handle toggling expanded state for longerrrrr entries
  function toggleExpand(id) {
    setExpandedId(expandedId === id ? null : id);
  }

  // Fetch journal entries for the user
  // Filter out entries that are just mood check-ins
  useEffect(() => {
    fetch(`${API}/journalentries?userId=${userId}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch entries");
        return res.json();
      })
      .then((data) => {
        const filtered = data.filter(entry => entry.content !== "Mood check-in only.");
        setEntries(filtered);
      })
      .catch(err => console.error("Error fetching entries:", err));
  }, [userId]);

  function handleGeneratePrompt() {
    const random = mockPrompts[Math.floor(Math.random() * mockPrompts.length)];
    setPrompt(random);
  }

  // Delete a journal entry
  // Confirm deletion with user first
  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this journal entry? This action cannot be undone.")) {
      return;
    }
    try {
      const res = await fetch(`${API}/journalentries/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete entry");
      setEntries((prev) => prev.filter((entry) => entry.id !== id));
    } catch (err) {
      console.error("Error deleting entry:", err);
      alert("Sorry, something went wrong while deleting your entry!");
    }
  }

  // Save or update the journal entry
  // If editing, update the existing entry
  // Otherwise, create a new one
  async function handleSave() {
    if (!entry.trim()) return;
    const entryData = {
      userId: userId,
      content: entry,
      mood: mood || 5,
      date: new Date().toISOString()
    };
    try {
      let res;
      if (isEditing) {
        res = await fetch(`${API}/journalentries/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(entryData),
        });
        if (!res.ok) throw new Error("update fail");
        setEntries((prev) =>
          prev.map((e) => e.id === editingId ? { ...e, ...entryData, date: e.date } : e)
        );
      } else {
        res = await fetch(`${API}/journalentries`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(entryData),
        });
        if (!res.ok) throw new Error("save fail");
        const saved = await res.json();
        setEntries((prev) => [saved, ...prev]);
      }
      setEntry("");
      setPrompt("");
      setIsEditing(false);
      setEditingId(null);
      setSaved(true);
    } catch (err) {
      console.error("save error:", err);
      alert("Could not save your entry, sorry :(");
    } finally {
      setTimeout(() => setSaved(false), 3000);
    }
  }

  return (
    <div className="bg-gradient-to-br from-rose-100 via-pink-100 to-rose-300 min-h-screen">
      <div>
        <header className="w-full text-center py-5 bg-gradient-to-br from-rose-400 to-rose-500 shadow-md text-rose-800 font-bold text-2xl tracking-wide">
          <h1 className="text-3xl font-bold text-rose-50">Dear Diary</h1>
          <p className="text-sm text-rose-50 mt-1">Explore yourself with a personal journal</p>
        </header>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-4 rounded-2xl bg-rose-200 mt-6 shadow-lg">
        <header>
          {prompt && (
            <div className="relative mb-6 rounded-2xl bg-rose-300 text-gray-800 p-4 shadow-md">
              <p className="font-semibold">Prompt:</p>
              <p className="mt-1 italic">{prompt}</p>
            </div>
          )}
        </header>

        <div className="bg-rose-300 p-4 rounded-2xl shadow-md">
          <textarea
            className="w-full h-64 p-4 rounded-2xl bg-rose-50 text-gray-800 resize-none border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400 shadow-lg"
            placeholder="What’s on your mind today?"
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
          />

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 bg-rose-400 px-4 py-2 rounded-full text-rose-950 shadow-md">
                <label htmlFor="mood" className="whitespace-nowrap font-semibold">Mood (1–10):</label>
                <input
                  id="mood"
                  type="number"
                  min={1}
                  max={10}
                  value={mood}
                  onChange={(e) => setMood(Number(e.target.value))}
                  className="p-1 rounded bg-rose-100 text-gray-700 w-16 text-center hover:bg-rose-50"
                />
              </div>
              <button
                onClick={handleSave}
                disabled={!entry.trim()}
                className="bg-emerald-400 text-white font-semibold px-4 py-2 rounded-full hover:bg-emerald-500 disabled:opacity-50 shadow-md"
              >
                {isEditing ? "Update Entry" : "Save Entry"}
              </button>
            </div>
            <button
              onClick={handleGeneratePrompt}
              className="bg-rose-200 text-rose-950 font-semibold px-4 py-2 rounded-full hover:bg-rose-400 shadow-md"
            >
              Generate Prompt
            </button>
          </div>
        </div>

        {saved && (
          <p className="mt-8 text-lg text-rose-800 font-semibold">Entry saved!</p>
        )}

        <section>
          <h2 className="text-2xl font-bold mt-10 mb-6 text-rose-50 p-3 bg-gradient-to-br from-rose-400 to-rose-600 rounded-2xl">Previous Entries</h2>
          {entries.length === 0 ? (
            <p className="text-gray-400 italic">You haven’t written anything yet!!</p>
          ) : (
            <ul className="space-y-6">
              {entries.map(({ id, content, mood, date }) => {
                const isExpanded = expandedId === id;
                const showToggle = content.length > 200;
                return (
                  <li
                    key={id}
                    className="transition-all duration-500 ease-in-out w-full flex flex-col relative p-6 rounded-2xl bg-white border border-pink-200 shadow-md hover:shadow-xl"
                    style={{ paddingBottom: "3.5rem" }}
                  >
                    <div>
                      <p className={`text-gray-800 whitespace-pre-wrap break-words w-full ${isExpanded ? "" : "overflow-hidden max-h-40"}`}>
                        {content}
                      </p>
                      {showToggle && (
                        <button
                          onClick={() => toggleExpand(id)}
                          className="text-pink-500 text-sm mt-2 hover:underline"
                        >
                          {isExpanded ? "Show Less" : "Show More"}
                        </button>
                      )}
                      <div className="mt-2 text-sm text-gray-500">
                        <span>Mood: {mood}</span> · <span>{new Date(date).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="absolute left-5 bottom-3 flex gap-4">
                      <button
                        onClick={() => {
                          setEntry(content);
                          setMood(mood);
                          setIsEditing(true);
                          setEditingId(id);
                        }}
                        className="text-yellow-500 hover:underline text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(id)}
                        className="text-red-500 hover:underline text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
