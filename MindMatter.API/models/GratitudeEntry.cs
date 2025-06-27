namespace MindMatter.API.Models
{
    public class GratitudeEntry
    {
        public int Id { get; set; }
        public string? UserId { get; set; }
        public DateTime? Date { get; set; }
        public string? Notice { get; set; }
        public string? Feeling { get; set; }
    }
}
