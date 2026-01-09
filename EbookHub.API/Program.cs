using EbookHub.API.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "EbookHub API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] { }
        }
    });
});

// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidateAudience = true,
        ValidAudience = builder.Configuration["Jwt:Audience"],
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
    };
});

// Initialize Firebase Admin SDK
try
{
    var keyPath = Path.Combine(Directory.GetCurrentDirectory(), "serviceAccountKey.json");
    if (!File.Exists(keyPath))
    {
        // Try looking one level up (if running from bin folder or subfolder)
        keyPath = Path.Combine(Directory.GetParent(Directory.GetCurrentDirectory())?.FullName ?? "", "serviceAccountKey.json");
    }

    if (File.Exists(keyPath))
    {
        FirebaseAdmin.FirebaseApp.Create(new FirebaseAdmin.AppOptions
        {
            Credential = Google.Apis.Auth.OAuth2.GoogleCredential.FromFile(keyPath),
            ProjectId = builder.Configuration["Firebase:ProjectId"]
        });
        Console.WriteLine($"Firebase Admin SDK initialized using {keyPath} for project {builder.Configuration["Firebase:ProjectId"]}");
    }
    else
    {
        FirebaseAdmin.FirebaseApp.Create(new FirebaseAdmin.AppOptions
        {
            Credential = Google.Apis.Auth.OAuth2.GoogleCredential.GetApplicationDefault()
        });
        Console.WriteLine("Firebase Admin SDK initialized using Default Credentials");
    }
}
catch (Exception ex)
{
    Console.WriteLine($"Firebase Admin SDK initialization: {ex.Message}");
}

// CORS (Allow Angular frontend)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular",
        builder => builder.WithOrigins("http://localhost:4200", "http://localhost", "http://160.187.68.165", "http://160.187.68.165:4200")
                          .AllowAnyMethod()
                          .AllowAnyHeader());
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAngular");

// app.UseHttpsRedirection();

// Serve Static Files (PDFs)
var uploadsPath = Path.Combine(builder.Environment.ContentRootPath, "Uploads");
if (!Directory.Exists(uploadsPath))
{
    Directory.CreateDirectory(uploadsPath);
}
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads"
});

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Auto-migrate database
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    // This will create the database if it doesn't exist and apply any pending migrations
    // If you are not using Migrations, use dbContext.Database.EnsureCreated();
    // For now, using EnsureCreated for simplicity in a quick-start scenario, 
    // but ideally use Migrate() if migrations are present.
    try 
    {
        dbContext.Database.EnsureCreated();
    }
    catch (Exception ex)
    {
        // Log error or just continue, DB might not be ready yet
        Console.WriteLine($"Database initialization failed: {ex.Message}");
    }
}

app.Run();
