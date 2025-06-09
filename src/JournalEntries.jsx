import React, { useEffect, useState } from "react";

export default function JournalEntries({userId}) {
  const [entries, setEntries] = useState([]);
  const [content, setContent] = useState("");
  const [mood, setMood] = useState(5);

  // Fetch entries from API
  useEffect(() => {
    fetch(`http://localhost:5068/journalentries?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => setEntries(data))
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  // Handle adding a new journal entry
  const handleAddEntry = async () => {
    const newEntry = { userId: "user123", content, mood: Number(mood) };

    try {
      const res = await fetch("http://localhost:5068/journalentries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEntry),
      });

      if (res.ok) {
        const savedEntry = await res.json();
        setEntries((prev) => [...prev, savedEntry]);
        setContent("");
        setMood(5);
      } else {
        console.error("Failed to save entry");
      }
    } catch (error) {
      console.error("Error saving entry:", error);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Journal Entries</h2>
      <ul className="mb-6">
        {entries.map((entry) => (
          <li key={entry.id} className="mb-2 p-2 border rounded">
            <p>{entry.content}</p>
            <small>Mood: {entry.mood}</small>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-2">
        <textarea
          rows={3}
          placeholder="Write something..."
          className="p-2 border rounded"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <input
          type="number"
          min={1}
          max={10}
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          className="p-2 border rounded w-20"
          placeholder="Mood (1-10)"
        />
        <button
          onClick={handleAddEntry}
          className="bg-pink-500 text-white py-2 rounded hover:bg-pink-600"
        >
          Add Entry
        </button>
      </div>
    </div>
  );
}
