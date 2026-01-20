using EbookHub.API.Data;
using EbookHub.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EbookHub.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SketchesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SketchesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("{bookId}/{pageNumber}")]
        public async Task<ActionResult<IEnumerable<Sketch>>> GetSketches(int bookId, int pageNumber)
        {
            var userId = int.Parse(User.FindFirst("UserId")?.Value ?? "0");
            return await _context.Sketches
                .Where(s => s.BookId == bookId && s.UserId == userId && s.PageNumber == pageNumber)
                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Sketch>> SaveSketch([FromBody] SketchDto dto)
        {
            var userId = int.Parse(User.FindFirst("UserId")?.Value ?? "0");

            // We might want to allow multiple sketches or just one per page. 
            // The requirement says "Save sketch", let's replace existing for simplicity if it's the same page.
            var existing = await _context.Sketches
                .FirstOrDefaultAsync(s => s.BookId == dto.BookId && s.UserId == userId && s.PageNumber == dto.PageNumber);

            if (existing != null)
            {
                existing.CanvasData = dto.CanvasData;
                _context.Sketches.Update(existing);
                await _context.SaveChangesAsync();
                return Ok(existing);
            }

            var sketch = new Sketch
            {
                BookId = dto.BookId,
                UserId = userId,
                PageNumber = dto.PageNumber,
                CanvasData = dto.CanvasData,
                CreatedAt = DateTime.UtcNow
            };

            _context.Sketches.Add(sketch);
            await _context.SaveChangesAsync();

            return Ok(sketch);
        }
    }

    public class SketchDto
    {
        public int BookId { get; set; }
        public int PageNumber { get; set; }
        public string CanvasData { get; set; } = string.Empty;
    }
}
