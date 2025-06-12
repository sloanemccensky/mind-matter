using System;

namespace MindMatter.API.Models
{
    public class JournalEntry
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public DateTime? Date { get; set; }
        public string Content { get; set; }
        public int? Mood { get; set; }
        public string Emotion { get; set; }
    }
}
