namespace MindMatter.API.ViewModels;

public class JournalCreateVM
{
    public string UserId { get; set; } = default!;
    public string Content { get; set; } = default!;
    public int? Mood { get; set; }
    public string? Emotion { get; set; }
    public DateTime? Date { get; set; }
}