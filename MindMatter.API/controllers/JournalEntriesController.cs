using Microsoft.AspNetCore.Mvc;
using MindMatter.API.Repositories;
using MindMatter.API.ViewModels;
using MindMatter.API.Models;
using AutoMapper;

namespace MindMatter.API.Controllers;

// Create, retrieve, update, delete journal entries
[ApiController]
[Route("journalentries")]
public class JournalEntriesController : ControllerBase
{
    private readonly IJournalEntryRepo _repository;
    private readonly IMapper _mapper;

    public JournalEntriesController(IJournalEntryRepo repository, IMapper mapper)
    {

        _repository = repository;
        _mapper = mapper;

    }

    [HttpGet]
    public async Task<IActionResult> GetByUser([FromQuery] string userId)
    {

        var entries = await _repository.GetByUserIdAsync(userId);
        var results = _mapper.Map<List<JournalViewVM>>(entries);

        return Ok(results);

    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] JournalCreateVM dto)
    {

        var entry = _mapper.Map<JournalEntry>(dto);
        var created = await _repository.CreateAsync(entry);
        var result = _mapper.Map<JournalViewVM>(created);

        return CreatedAtAction(nameof(GetByUser), new { userId = result.UserId }, result);

    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] JournalCreateVM dto)
    {

        var updatedEntry = _mapper.Map<JournalEntry>(dto);
        var result = await _repository.UpdateAsync(id, updatedEntry);
        if (result == null) return NotFound();
        var viewResult = _mapper.Map<JournalViewVM>(result);

        return Ok(viewResult);

    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {

        var deleted = await _repository.DeleteAsync(id);

        return deleted ? Ok() : NotFound();

    }
}