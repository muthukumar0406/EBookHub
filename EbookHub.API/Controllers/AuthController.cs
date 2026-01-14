using EbookHub.API.Data;
using EbookHub.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace EbookHub.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly AppDbContext _context;

        public AuthController(IConfiguration configuration, AppDbContext context)
        {
            _configuration = configuration;
            _context = context;
        }

        [HttpPost("admin-login")]
        public IActionResult AdminLogin([FromBody] LoginRequest request)
        {
            if (request.Username == "Muthukumar" && request.Password == "Admin@kumar")
            {
                var token = GenerateJwtToken("Muthukumar", "Admin", -1); // -1 or special ID for admin
                return Ok(new { Token = token, Role = "Admin", Username = "Muthukumar" });
            }
            return Unauthorized("Invalid admin credentials");
        }

        [HttpPost("google-login")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest request)
        {
            if (string.IsNullOrEmpty(request.IdToken))
            {
                return BadRequest("ID Token is required");
            }

            try
            {
                // Verify the ID token using Firebase Admin SDK
                var decodedToken = await FirebaseAdmin.Auth.FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(request.IdToken);
                var uid = decodedToken.Uid;
                // Get claims
                var email = decodedToken.Claims.ContainsKey("email") ? decodedToken.Claims["email"].ToString() : request.Email;
                var name = decodedToken.Claims.ContainsKey("name") ? decodedToken.Claims["name"].ToString() : request.Name;

                if (string.IsNullOrEmpty(email))
                {
                    return BadRequest("Email could not be retrieved from token");
                }

                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
                if (user == null)
                {
                    user = new User
                    {
                        Email = email,
                        Name = name ?? "User",
                        GoogleId = uid, // or request.GoogleId
                        Role = "User"
                    };
                    _context.Users.Add(user);
                    await _context.SaveChangesAsync();
                }

                // Generate our own JWT for the app session
                var token = GenerateJwtToken(user.Email, "User", user.Id);
                return Ok(new { Token = token, Role = "User", Username = user.Name, UserId = user.Id });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Auth] Token verification failed: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"[Auth] Inner error: {ex.InnerException.Message}");
                }
                return Unauthorized(new { Error = "Token verification failed", Details = ex.Message });
            }
        }

        private string GenerateJwtToken(string username, string role, int userId)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, username),
                new Claim(ClaimTypes.Name, username),
                new Claim(ClaimTypes.Role, role),
                new Claim("UserId", userId.ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    public class LoginRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class GoogleLoginRequest
    {
        public string IdToken { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty; // Sent from frontend for simplicity in this demo
        public string Name { get; set; } = string.Empty;
        public string GoogleId { get; set; } = string.Empty;
    }
}

