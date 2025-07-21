const API = "http://localhost:5068";

export async function fetchMoodEntries(userId) {

    const res = await fetch(`${API}/journalentries?userId=${userId}`);
    if (!res.ok) throw new Error("Failed to fetch mood entries!!!");
    const data = await res.json();

    return data.filter(entry => entry.content === "Mood check-in only.");

}

export async function updateMoodEntry(entryId, entryData) {

    const res = await fetch(`${API}/journalentries/${entryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entryData),
    });

    if (!res.ok) throw new Error("Failed to update your mood entry...");

    return res.json();

}

export async function createMoodEntry(entryData) {

    const res = await fetch(`${API}/journalentries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entryData),
    });

    if (!res.ok) throw new Error("Failed to create your mood entry... shloane...");

    return res.json();

}