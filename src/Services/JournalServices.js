const API = "http://localhost:5068";

export async function fetchJournalEntries(userId) {

    const res = await fetch(`${API}/journalentries?userId=${userId}`);
    if (!res.ok) throw new Error("Failed2fetch");
    return res.json();

}

export async function createJournalEntry(data) {

    const res = await fetch(`${API}/journalentries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed2save");

    return res.json();

}

export async function updateJournalEntry(id, data) {

    const res = await fetch(`${API}/journalentries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed2update");

}

export async function deleteJournalEntry(id) {

    const res = await fetch(`${API}/journalentries/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed2delete");

}