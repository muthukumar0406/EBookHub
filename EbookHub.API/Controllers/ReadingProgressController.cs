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
    public class ReadingProgressController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReadingProgressController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("{bookId}")]
        public async Task<ActionResult<ReadingProgress>> GetProgress(int bookId)
        {
            var userId = int.Parse(User.FindFirst("UserId")?.Value ?? "0");
            var progress = await _context.ReadingProgresses
                .FirstOrDefaultAsync(p => p.BookId == bookId && p.UserId == userId);

            if (progress == null)
            {
                return NotFound();
            }

            return Ok(progress);
        }

        [HttpPost]
        public async Task<ActionResult<ReadingProgress>> SaveProgress([FromBody] ProgressDto dto)
        {
            var userId = int.Parse(User.FindFirst("UserId")?.Value ?? "0");

            var progress = await _context.ReadingProgresses
                .FirstOrDefaultAsync(p => p.BookId == dto.BookId && p.UserId == userId);

            if (progress == null)
            {
                progress = new ReadingProgress
                {
                    BookId = dto.BookId,
                    UserId = userId,
                    LastReadPage = dto.LastReadPage,
                    LastReadAt = DateTime.UtcNow
                };
                _context.ReadingProgresses.Add(progress);
            }
            else
            {
                progress.LastReadPage = dto.LastReadPage;
                progress.LastReadAt = DateTime.UtcNow;
                _context.ReadingProgresses.Update(progress);
            }

            await _context.SaveChangesAsync();

            return Ok(progress);
        }
    }

    public class ProgressDto
    {
        public int BookId { get; set; }
        public int LastReadPage { get; set; }
    }
}
