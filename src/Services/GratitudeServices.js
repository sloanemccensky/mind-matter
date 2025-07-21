const API = "http://localhost:5068";

export const fetchGratitudeEntries = async (userId) => {
    
    try {   

        const res = await fetch(`${API}/gratitude?userId=${userId}`);
        if (!res.ok) throw new Error("Failed2fetch your gratitude...");
        return await res.json();

    } catch (err) {

        console.error("Gratitoodius loading failed:", err);
        throw err;

    }

};

export const saveGratitudeEntry = async (entry, isUpdate) => {
    
    try {

        const res = await fetch(
            `${API}/gratitude${isUpdate ? `/${entry.id}` : ""}`,
            {
                method: isUpdate ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(entry),
            }
        );

        if (!res.ok) throw new Error("Failed to save gratitude entry.");
        return await res.json();

    } catch (err) {

        console.error("Error saving entry:", err);
        throw err;

    }
};