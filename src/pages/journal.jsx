import React, { useEffect, useState } from "react";

<h1 className="text-4xl text-pink-600">Hello Tailwind</h1>

const mockPrompts = [
  "When was the last time you felt at complete peace?",
  "What do you wish people would ask you more about?",
  "What is the life you envisioned for yourself? Are you living it?",
  "How much of yourself do you let others see?",
  "Describe yourself as though you were a character in a book.",
  "What is something you wish you could change about your life right now?"
];

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


  // Fetch previous entries on component mount
  useEffect(() => {
    async function fetchEntries() {
      try {
        const res = await fetch(`http://localhost:5068/journalentries?userId=${userId}`);
        if (!res.ok) throw new Error("Failed to fetch entries");
        const data = await res.json();
        setEntries(data);
      } catch (err) {
        console.error("Error fetching entries:", err);
      }
    }
    fetchEntries();
  }, []);

  // Generate a random prompt
  function handleGeneratePrompt() {
    const random = mockPrompts[Math.floor(Math.random() * mockPrompts.length)];
    setPrompt(random);
  }

  async function handleDelete(id) {

    console.log("Deleting ID:", id); // <--- Add this
    const confirm = window.confirm("Are you sure you want to delete this entry?");
    if (!confirm) return;

    try {
      const res = await fetch(`http://localhost:5068/journalentries/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");

      setEntries((prev) => prev.filter((entry) => entry.id !== id));
    } catch (err) {
      console.error("Error deleting entry:", err);
      alert("Failed to delete the entry.");
    }
  }

  // Save journal entry via POST API call
  async function handleSave() {
    if (!entry) return;

    const newEntry = {
      userId, // TODO: Replace with actual user logic later
      content: entry,
      mood: mood || null,
    };

    try {
      let response;

      if (isEditing) {
        response = await fetch(`http://localhost:5068/journalentries/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newEntry),
        });

        if (!response.ok) throw new Error("Failed to update entry");

        // Replace updated entry in list
        setEntries((prev) =>
          prev.map((e) => (e.id === editingId ? { ...e, ...newEntry, date: e.date } : e))
        );
      } else {
        response = await fetch("http://localhost:5068/journalentries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newEntry),
        });

        if (!response.ok) throw new Error("Failed to save entry");

        const savedEntry = await response.json();
        setEntries((prev) => [savedEntry, ...prev]);
      }

      setEntry("");
      setPrompt("");
      setIsEditing(false);
      setEditingId(null);
      setSaved(true);
    } catch (err) {
      console.error("Error saving/updating entry:", err);
      alert("Oops! Could not save your entry.");
    } finally {
      setTimeout(() => setSaved(false), 3000);
    }
  }


  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Move heading based on prompt state */}
      {prompt ? (
        <>
          <h1 className="text-3xl font-bold mb-2 text-black">Today’s Journal</h1>
          <div className="relative mb-6 rounded-xl bg-indigo-500 text-black p-4 overflow-auto">
            <p className="font-bold">Prompt:</p>
            <p className="mt-1 font-medium">{prompt}</p>
          </div>
        </>
      ) : (
        <h1 className="text-3xl font-bold mb-4 text-black">Today’s Journal</h1>
      )}


      <textarea
        className="w-full h-64 p-4 rounded-xl bg-gray-900 text-white resize-none border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        placeholder="Start writing here..."
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
      />


      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        {/* Left group: Mood meter + Save */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 bg-blue-400 px-4 py-2 rounded-lg text-black">
            <label className="whitespace-nowrap">Mood (1–10):</label>
            <input
              type="number"
              min={1}
              max={10}
              value={mood}
              onChange={(e) => setMood(Number(e.target.value))}
              className="p-1 rounded bg-blue-300 text-black w-16 hover:bg-blue-200"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={!entry}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            Save Entry
          </button>
        </div>

        {/* Right side: Generate Prompt */}
        <button
          onClick={handleGeneratePrompt}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
        >
          Generate Prompt
        </button>
      </div>


      {saved && (
        <p className="mt-4 text-green-400">Entry saved!</p>
      )}

      <h2 className="text-xl font-semibold mt-10 mb-4 text-white">Previous Entries</h2>
      {entries.length === 0 ? (
        <p className="text-gray-400">No entries yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <ul className="space-y-4">
            {entries.map(({ id, content, mood, date }) => {
              const isExpanded = expandedId === id;

              return (
                <li
                  key={id}
                  className="w-full flex flex-col justify-between gap-2 p-6 rounded-xl bg-gray-900 border border-gray-700 shadow-lg min-h-[160px] max-h-[400px] overflow-hidden"
                >
                  <div className="flex-1">
                    <p
                      className={`text-white break-words ${isExpanded ? "" : "line-clamp-5"
                        }`}
                    >
                      {content}
                    </p>
                    {content.length > 200 && (
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
                  <div className="flex gap-2 flex-shrink-0">
                    <button
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
                    <button
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


        </div>

      )}
    </div>
  );
}
