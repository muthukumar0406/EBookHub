using System.ComponentModel.DataAnnotations;

namespace EbookHub.API.Models
{
    public class Book
    {
        public int Id { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string FileName { get; set; } = string.Empty;

        public DateTime UploadDate { get; set; } = DateTime.UtcNow;
    }
}
