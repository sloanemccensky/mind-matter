using AutoMapper;
using MindMatter.API.Models;
using MindMatter.API.ViewModels;

namespace MindMatter.API.MappingProfiles;

// AutoMapper profile for mapping between JournalEntry and JournalViewVM
public class JournalProf : Profile
{
    public JournalProf()
    {
        CreateMap<JournalEntry, JournalViewVM>();
        CreateMap<JournalCreateVM, JournalEntry>();
    }
}