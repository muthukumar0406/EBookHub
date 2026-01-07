using EbookHub.API.Data;
using EbookHub.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace EbookHub.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class HighlightsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public HighlightsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("{bookId}")]
        public async Task<ActionResult<IEnumerable<Highlight>>> GetHighlights(int bookId)
        {
            var userId = int.Parse(User.FindFirst("UserId")?.Value ?? "0");
            return await _context.Highlights
                .Where(h => h.BookId == bookId && h.UserId == userId)
                .OrderBy(h => h.PageNumber)
                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Highlight>> SaveHighlight([FromBody] HighlightDto dto)
        {
            var userId = int.Parse(User.FindFirst("UserId")?.Value ?? "0");

            var highlight = new Highlight
            {
                BookId = dto.BookId,
                UserId = userId,
                SelectedText = dto.SelectedText,
                Note = dto.Note,
                PageNumber = dto.PageNumber,
                CreatedAt = DateTime.UtcNow
            };

            _context.Highlights.Add(highlight);
            await _context.SaveChangesAsync();

            return Ok(highlight);
        }
    }

    public class HighlightDto
    {
        public int BookId { get; set; }
        public string SelectedText { get; set; } = string.Empty;
        public string? Note { get; set; }
        public int? PageNumber { get; set; }
    }
}
