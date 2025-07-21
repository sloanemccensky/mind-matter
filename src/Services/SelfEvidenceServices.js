const API = "http://localhost:5068"; // need to go through and replace with env later

export const fetchEvidenceEntries = async (userId) => {

    try {

        const res = await fetch(`${API}/evidence?userId=${userId}`);
        if (!res.ok) throw new Error("Failed to fetch evidence entries.");
        return await res.json();

    } catch (err) {

        console.error("Fetch error:", err);
        throw err;

    }

};

export const saveEvidenceEntry = async (entry) => {

    try {

        const res = await fetch(`${API}/evidence`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(entry),
        });

        if (!res.ok) throw new Error("Failed to save evidence entry.");
        return await res.json();

    } catch (err) {

        console.error("Save error:", err);
        throw err;

    }

};

export const deleteEvidenceEntry = async (id) => {

    try {

        const res = await fetch(`${API}/evidence/${id}`, {
            method: "DELETE",
        });

        if (!res.ok) throw new Error("Failed to delete evidence entry.");
        return true;

    } catch (err) {

        console.error("Delete error:", err);
        throw err;

    }

};