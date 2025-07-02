public class EvidenceEntry
{
    public int Id { get; set; }
    public string UserId { get; set; }
    public DateTime Date { get; set; }
    public string Type { get; set; } // "Compliment", "Win", etc.
    public string Description { get; set; }
    public string? ImageUrl { get; set; } // Will hold file path or URL
    public bool IsFavorite { get; set; }
}
