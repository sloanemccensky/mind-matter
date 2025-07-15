using Microsoft.EntityFrameworkCore;
using MindMatter.API.Models;

namespace MindMatter.API.Data
{
    public class MMDbContext : DbContext
    {
        public MMDbContext(DbContextOptions<MMDbContext> options)
            : base(options) { }

        public DbSet<JournalEntry> JournalEntries { get; set; }
        public DbSet<GratitudeEntry> GratitudeEntries { get; set; }
        public DbSet<EvidenceEntry> EvidenceEntries { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<JournalEntry>().ToTable("JournalEntries");
            modelBuilder.Entity<GratitudeEntry>().ToTable("GratitudeEntries");
            modelBuilder.Entity<EvidenceEntry>().ToTable("EvidenceEntries");
        }
    }
}