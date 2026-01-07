using System.ComponentModel.DataAnnotations;

namespace EbookHub.API.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required]
        public string Email { get; set; } = string.Empty;

        public string Name { get; set; } = string.Empty;

        // For Google Auth users, this will be their Google Subject ID
        public string? GoogleId { get; set; }
        
        // "Admin" or "User"
        public string Role { get; set; } = "User";
    }
}
