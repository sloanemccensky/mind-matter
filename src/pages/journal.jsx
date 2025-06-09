import React, { useEffect, useState } from "react";

<h1 className="text-4xl text-pink-600">Hello Tailwind</h1>

// SloaneMynd prompt ideas
const mockPrompts = [
  "When was the last time you felt at complete peace?",
  "What do you wish people would ask you more about?",
  "What is the life you envisioned for yourself? Are you living it?",
  "How much of yourself do you let others see?",
  "Describe yourself as though you were a character in a book.",
  "What is something you wish you could change about your life right now?"
];

// Journaling component for mind//matter
export default function Journal({ userId }) {
  const [entries, setEntries] = useState([]);
  const [entry, setEntry] = useState("");
  const [prompt, setPrompt] = useState("");
  const [mood, setMood] = useState(5);
  const [saved, setSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  function toggleExpand(id) {
    setExpandedId(expandedId === id ? null : id);
  }

  // Fetch previous entries from API
  useEffect(() => {
    fetch(`http://localhost:5068/journalentries?userId=${userId}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch entries");
        return res.json();
      })
      .then(setEntries)
      .catch(err => console.error("Error fetching entries:", err));
  }, [userId]);

  // Generate a random prompt from the SloaneCatalog
  function handleGeneratePrompt() {
    const random = mockPrompts[Math.floor(Math.random() * mockPrompts.length)];
    setPrompt(random);
  }

  // This function deletes a journal entry by ID from the API
  // and updates the local state to remove the deleted entry
  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this journal entry? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:5068/journalentries/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete entry");

      setEntries((prev) => prev.filter((entry) => entry.id !== id));
    } catch (err) {
      console.error("Error deleting entry:", err);
      alert("Sorry, something went wrong while deleting your entry!");
    }
  }

  // Save the journal entry with a POST API call
  async function handleSave() {

    if (!entry.trim()) {
      // Don't save if empty !!
      return;
    }

    const entryData = {
      userId: userId,
      content: entry,
      mood: mood || 5, // Default schmood if not entered
      date: new Date().toISOString()
    };

    try {
      let res;
      if (isEditing) {
        // For handling eexisting entry updates
        res = await fetch(`http://localhost:5068/journalentries/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(entryData),
        });
        if (!res.ok) throw new Error("update fail");

        setEntries((prev) =>
          prev.map((e) =>
            e.id === editingId ? { ...e, ...entryData, date: e.date } : e
          )
        );

      } else {
        // For handling brand new entries
        res = await fetch("http://localhost:5068/journalentries", {
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
      // For handling errors during save / update
      console.error("save error:", err);
      alert("Could not save your entry, sorry :(");
    } finally {
      setTimeout(() => setSaved(false), 3000);
    }

  }

  // Prompt + text entry area + their buttons
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <header>
        <h1 className="text-3xl font-bold mb-6 text-black">Today’s Journal</h1>
        {prompt && (
          <div className="relative mb-6 rounded-xl bg-indigo-400 text-black p-4 overflow-auto">
            <p className="font-bold">Prompt:</p>
            <p className="mt-1 font-medium">{prompt}</p>
          </div>
        )}
      </header>

      <textarea
        className="w-full h-64 p-4 rounded-xl bg-gray-900 text-white resize-none border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        placeholder="Start writing here..."
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
      />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 bg-blue-400 px-4 py-2 rounded-lg text-black">
            <label htmlFor="mood" className="whitespace-nowrap">Mood (1–10):</label>
            <input
              id="mood"
              type="number"
              min={1}
              max={10}
              value={mood}
              onChange={(e) => setMood(Number(e.target.value))}
              className="p-1 rounded bg-blue-300 text-black w-16 hover:bg-blue-200"
            />
          </div>
          <button // Save button
            onClick={handleSave}
            disabled={!entry.trim()}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {isEditing ? "Update Entry" : "Save Entry"}
          </button>
        </div>
        <button // Generate Prompt button
          onClick={handleGeneratePrompt}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
        >
          Generate Prompt
        </button>
      </div>

      {saved && (
        <p className="mt-4 text-green-400">Entry saved!</p>
      )}

      <section>
        <h2 className="text-2xl font-bold mt-10 mb-4 text-black">Previous Entries</h2>
        {entries.length === 0 ? (
          <p className="text-gray-400">No entries yet.</p>
        ) : (
          <ul className="space-y-4">
            {entries.map(({ id, content, mood, date }) => {
              const isExpanded = expandedId === id;
              const showToggle = content.length > 200;
              return (
                <li
                  key={id}
                  className="w-full flex flex-col relative p-6 rounded-xl bg-gray-900 border border-gray-700 shadow-lg min-h-[160px] max-h-[400px] overflow-hidden"
                  style={{ paddingBottom: "3.5rem" }} // extra space for buttons
                >
                  <div>
                    <p className={`text-white break-words ${isExpanded ? "" : "line-clamp-5"}`}>
                      {content}
                    </p>
                    {showToggle && (
                      <button
                        onClick={() => toggleExpand(id)}
                        className="text-indigo-400 text-sm mt-1 hover:underline"
                      >
                        {isExpanded ? "Show Less" : "Show More"}
                      </button>
                    )}
                    <div className="mt-2 text-sm text-gray-400">
                      <span>Mood: {mood}</span> ·{" "}
                      <span>{new Date(date).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="absolute left-5 bottom-3 flex gap-2">
                    <button // Edit button
                      onClick={() => {
                        setEntry(content);
                        setMood(mood);
                        setIsEditing(true);
                        setEditingId(id);
                      }}
                      className="text-yellow-400 hover:underline text-sm"
                    >
                      Edit
                    </button>
                    <button // Delete button
                      onClick={() => handleDelete(id)}
                      className="text-red-400 hover:text-red-600 text-sm"
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
  );
}
