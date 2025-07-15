using Microsoft.EntityFrameworkCore;
using MindMatter.API.Data;
using MindMatter.API.Models;

namespace MindMatter.API.Repositories;

public class JournalRepo : IJournalEntryRepo
{
    private readonly MMDbContext _context;

    public JournalRepo(MMDbContext context)
    {
        _context = context;
    }

    public async Task<List<JournalEntry>> GetByUserIdAsync(string userId)
    {

        return await _context.JournalEntries
            .Where(j => j.UserId == userId)
            .OrderBy(j => j.Date)
            .ToListAsync();

    }

    public async Task<JournalEntry> CreateAsync(JournalEntry entry)
    {

        entry.Date ??= DateTime.Now;
        _context.JournalEntries.Add(entry);
        await _context.SaveChangesAsync();

        return entry;

    }

    public async Task<JournalEntry?> UpdateAsync(int id, JournalEntry updated)
    {

        var entry = await _context.JournalEntries.FindAsync(id);
        if (entry == null) return null;
        entry.Content = updated.Content ?? entry.Content;
        entry.Mood = updated.Mood;
        entry.Emotion = updated.Emotion ?? entry.Emotion;
        await _context.SaveChangesAsync();

        return entry;

    }

    public async Task<bool> DeleteAsync(int id)
    {

        var entry = await _context.JournalEntries.FindAsync(id);
        if (entry == null) return false;
        _context.JournalEntries.Remove(entry);
        await _context.SaveChangesAsync();

        return true;

    }
}