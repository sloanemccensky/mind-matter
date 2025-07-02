import React, { useEffect, useState } from "react";
import "../App.css";

const API = "http://localhost:5068"; // update this with env later

export default function Evidence({ userId }) {
    const [entries, setEntries] = useState([]);
    const [type, setType] = useState("Win");
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [isFavorite, setIsFavorite] = useState(false);
    const [filter, setFilter] = useState("All");

    useEffect(() => {
        fetch(`${API}/evidence?userId=${userId}`)
            .then((res) => res.json())
            .then(setEntries)
            .catch((err) => console.error("Failed to fetch evidence:", err));
    }, [userId]);

    async function submit(e) {
        e.preventDefault();
        if (!description.trim()) return;

        if (imageUrl.trim().startsWith("data:image")) {
            alert("Please paste a link to an image URL (starting with https)!!!");
            return;
        }

        const newEntry = {
            userId,
            date: new Date().toISOString(),
            type,
            description,
            imageUrl,
            isFavorite
        };

        try {
            const res = await fetch(`${API}/evidence`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newEntry),
            });

            if (!res.ok) throw new Error("Failed to save your entry!!");
            const saved = await res.json();
            setEntries((prev) => [saved, ...prev]);
            setDescription("");
            setImageUrl("");
            setType("Win");
            setIsFavorite(false);
        } catch (err) {
            console.error("Save error:", err);
            alert("Could not save your entry!!! Sloane...");
        }
    }

    const displayed = filter === "All"
        ? entries
        : entries.filter((e) => e.type === filter);

    // UPDATE WITH DELETE BUTTON + CONNECTION
    // add visualization of saved Evidence Type filter zzz
    // add: box glow for favorited entries, animations for hover / collection,
    // user-moveable blocks???
    return (
        <div className="bg-gradient-to-br from-violet-100 via-purple-200 to-yellow-100 min-h-screen pb-20">
            <header className="w-full tracking-wide py-5 bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-center shadow-md">
                <h1 className="text-3xl font-bold">Self-Evidence Board</h1>
                <p className="text-sm font-semibold mt-1">Collect triumphs from your journey</p>
            </header>

            <section className="max-w-5xl mx-auto px-4 mt-8">
                <form onSubmit={submit} className="bg-white rounded-xl shadow-md p-6 mb-8 space-y-4 border border-purple-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full rounded-md p-2 bg-purple-100 text-gray-700 border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        >
                            <option>Compliment</option>
                            <option>Win</option>
                            <option>Memory</option>
                            <option>Impulse</option>
                            <option>Reminder</option>
                        </select>
                        <input
                            type="text"
                            placeholder="Optional image URL..."
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            className="w-full rounded-md p-2 bg-yellow-100 text-gray-700 border border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                    </div>

                    <textarea
                        placeholder="Tell me a little about your galavanting..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full h-32 p-3 rounded-md bg-violet-50 text-gray-800 border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-400"
                    />

                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input
                                type="checkbox"
                                checked={isFavorite}
                                onChange={(e) => setIsFavorite(e.target.checked)}
                                className="accent-purple-500"
                            />
                            Mark as Highlight
                        </label>
                        <button
                            type="submit"
                            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-full font-medium shadow-md"
                        >
                            Save Entry
                        </button>
                    </div>
                </form>

                <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                    <h2 className="text-xl font-bold text-purple-800">Collected Evidence</h2>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="rounded-full px-4 py-1 bg-purple-100 text-purple-800 border border-purple-300"
                    >
                        <option value="All">All</option>
                        <option value="Compliment">Compliment</option>
                        <option value="Win">Win</option>
                        <option value="Memory">Memory</option>
                        <option value="Impulse">Impulse</option>
                        <option value="Reminder">Reminder</option>
                    </select>
                </div>

                <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                    {displayed.map((entry) => (
                        <div
                            key={entry.id}
                            className="break-inside-avoid p-4 bg-white rounded-xl shadow hover:shadow-xl border border-violet-200"
                        >
                            {entry.imageUrl && (
                                <img
                                    src={entry.imageUrl}
                                    alt="evidence visual"
                                    className="w-full rounded-md mb-4 max-h-64 object-cover shadow-sm"
                                    onError={(e) => e.target.style.display = 'none'} // da failsafe ... 
                                />
                            )}

                            <div className="text-gray-800 whitespace-pre-wrap">{entry.description}</div>
                            <div className="mt-6 text-sm text-gray-500 flex justify-between items-center">
                                <span>{new Date(entry.date).toLocaleDateString()}</span>
                                <div className="flex gap-2">
                                    {entry.isFavorite && <span className="text-yellow-500">Highlighted!</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
