using System.ComponentModel.DataAnnotations;

namespace EbookHub.API.Models
{
    public class Sketch
    {
        public int Id { get; set; }

        public int BookId { get; set; }
        public Book? Book { get; set; }

        public int UserId { get; set; }
        public User? User { get; set; }

        public int PageNumber { get; set; }

        [Required]
        public string CanvasData { get; set; } = string.Empty; // Storing the sketch data (JSON or Base64)

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
