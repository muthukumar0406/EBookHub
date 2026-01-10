using EbookHub.API.Data;
using EbookHub.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EbookHub.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BooksController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public BooksController(AppDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        [HttpGet]
        [Authorize] // Both Admin and User can view
        public async Task<ActionResult<IEnumerable<Book>>> GetBooks([FromQuery] string? search)
        {
            var query = _context.Books.AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(b => b.Title.Contains(search));
            }

            return await query.OrderByDescending(b => b.UploadDate).ToListAsync();
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<Book>> GetBook(int id)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null) return NotFound();
            return book;
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UploadBook([FromForm] IFormFile file, [FromForm] IFormFile? coverImage, [FromForm] string title, [FromForm] string author)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            // Save file to disk
            var uploadsFolder = Path.Combine(_environment.ContentRootPath, "Uploads");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var uniqueFileName = Guid.NewGuid().ToString() + "_" + file.FileName;
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            string? uniqueCoverName = null;
            if (coverImage != null && coverImage.Length > 0)
            {
                uniqueCoverName = Guid.NewGuid().ToString() + "_" + coverImage.FileName;
                var coverPath = Path.Combine(uploadsFolder, uniqueCoverName);
                using (var stream = new FileStream(coverPath, FileMode.Create))
                {
                    await coverImage.CopyToAsync(stream);
                }
            }

            var book = new Book
            {
                Title = title,
                Author = author,
                FileName = uniqueFileName,
                CoverImageName = uniqueCoverName,
                UploadDate = DateTime.UtcNow
            };

            _context.Books.Add(book);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetBook), new { id = book.Id }, book);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteBook(int id)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null) return NotFound();

            // Delete file from disk
            var filePath = Path.Combine(_environment.ContentRootPath, "Uploads", book.FileName);
            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
            }

            if (!string.IsNullOrEmpty(book.CoverImageName))
            {
                var coverPath = Path.Combine(_environment.ContentRootPath, "Uploads", book.CoverImageName);
                if (System.IO.File.Exists(coverPath))
                {
                    System.IO.File.Delete(coverPath);
                }
            }

            _context.Books.Remove(book);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
