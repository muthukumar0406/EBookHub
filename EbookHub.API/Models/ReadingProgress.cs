using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EbookHub.API.Models
{
    public class ReadingProgress
    {
        public int Id { get; set; }

        public int BookId { get; set; }
        public Book? Book { get; set; }

        public int UserId { get; set; }
        public User? User { get; set; }

        [Required]
        public int LastReadPage { get; set; }

        public DateTime LastReadAt { get; set; } = DateTime.UtcNow;
    }
}
