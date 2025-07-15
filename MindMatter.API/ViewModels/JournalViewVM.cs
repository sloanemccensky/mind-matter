namespace MindMatter.API.ViewModels;

public class JournalViewVM
{
    public int Id { get; set; }
    public string UserId { get; set; } = default!;
    public DateTime? Date { get; set; }
    public string Content { get; set; } = default!;
    public int? Mood { get; set; }
    public string? Emotion { get; set; }
}