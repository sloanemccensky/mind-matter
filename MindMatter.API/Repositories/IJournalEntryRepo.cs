using MindMatter.API.Models;

namespace MindMatter.API.Repositories;

public interface IJournalEntryRepo
{
    Task<List<JournalEntry>> GetByUserIdAsync(string userId);
    Task<JournalEntry> CreateAsync(JournalEntry entry);
    Task<JournalEntry?> UpdateAsync(int id, JournalEntry updatedEntry);
    Task<bool> DeleteAsync(int id);
}