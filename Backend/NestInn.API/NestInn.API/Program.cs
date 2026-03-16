using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using NestInn.API.Data;
using System.Text;
using CloudinaryDotNet;
using QuestPDF.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

QuestPDF.Settings.License = LicenseType.Community;


builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration
    .GetConnectionString("DefaultConnection")));


var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"]!;

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(secretKey))
    };

   
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            context.Token = context.Request.Cookies["nestinn_token"];
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();


builder.Services.AddCors(options =>
{
    options.AddPolicy("NestInnPolicy", policy =>
    {
        policy.WithOrigins(
            "http://localhost:4200",
            "http://localhost:4201")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var cloudName = builder.Configuration["Cloudinary:CloudName"];
var apiKey = builder.Configuration["Cloudinary:ApiKey"];
var apiSecret = builder.Configuration["Cloudinary:ApiSecret"];

if (string.IsNullOrWhiteSpace(cloudName) ||
    string.IsNullOrWhiteSpace(apiKey) ||
    string.IsNullOrWhiteSpace(apiSecret))
{
    throw new Exception("Cloudinary configuration missing in appsettings.json");
}

var account = new Account(cloudName, apiKey, apiSecret);
var cloudinary = new Cloudinary(account);

builder.Services.AddSingleton(cloudinary);


builder.Services.AddSignalR();


builder.Services.AddControllers();


builder.Services.AddScoped<NestInn.API.Services.Interfaces.IAuthService,
    NestInn.API.Services.Implementations.AuthService>();

builder.Services.AddScoped<NestInn.API.Services.Interfaces.IPropertyService,
    NestInn.API.Services.Implementations.PropertyService>();

builder.Services.AddScoped<NestInn.API.Services.Interfaces.IBookingService,
    NestInn.API.Services.Implementations.BookingService>();

builder.Services.AddScoped<NestInn.API.Services.Interfaces.IMessageService,
    NestInn.API.Services.Implementations.MessageService>();

builder.Services.AddScoped<NestInn.API.Services.Interfaces.IPaymentService,
    NestInn.API.Services.Implementations.PaymentService>();

builder.Services.AddScoped<NestInn.API.Services.Interfaces.IEmailService,
    NestInn.API.Services.Implementations.EmailService>();

builder.Services.AddScoped<NestInn.API.Services.Interfaces.ICeoService,
    NestInn.API.Services.Implementations.CeoService>();

builder.Services.AddScoped<NestInn.API.Helpers.JwtHelper>();


builder.Services.AddOpenApi();


builder.Services.AddDirectoryBrowser();

var app = builder.Build();


if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseStaticFiles();
app.UseCors("NestInnPolicy");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();



app.Run();