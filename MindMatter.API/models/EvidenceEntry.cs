namespace MindMatter.API.Models
{
    public class EvidenceEntry
    {
        public int Id { get; set; }
        public required string UserId { get; set; }
        public DateTime Date { get; set; }
        public string? Type { get; set; } // "Compliment", "Win", etc.
        public string? Description { get; set; }
        public string? ImageUrl { get; set; } // only accepts image URL
        public bool IsFavorite { get; set; }
    }

}