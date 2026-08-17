using EonsApi.Data;
using EonsApi.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// ---- EF Core / SQL Server -------------------------------------------------
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddScoped<SettingsService>();
builder.Services.AddScoped<OrderService>();

// ---- Cookie auth (replaces PHP's session_name('eons_sess') + $_SESSION) ---
// Same cookie name/flags as api/db.php: httponly, SameSite=Lax.
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.Name = "eons_sess";
        options.Cookie.HttpOnly = true;
        // SameSite=None (not Lax) + Secure so the cookie survives being set
        // by an HTTPS API and read back by an Angular dev server that may be
        // running on plain HTTP (localhost:4200) — Chrome's "schemeful
        // same-site" rules treat http://localhost and https://localhost as
        // different sites, so Lax silently drops the cookie in that setup.
        // None+Secure is the standard fix for cross-origin dev cookies; it
        // still requires HTTPS on the API side, which we already have.
        options.Cookie.SameSite = SameSiteMode.None;
        options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
        options.ExpireTimeSpan = TimeSpan.FromDays(7);
        options.SlidingExpiration = true;

        // This is a JSON API, not a page-rendering app — on 401/403 return the
        // status code instead of the default redirect-to-login-page behaviour
        // (which is what a browser-facing cookie auth handler does by default).
        options.Events.OnRedirectToLogin = ctx =>
        {
            ctx.Response.StatusCode = 401;
            return Task.CompletedTask;
        };
        options.Events.OnRedirectToAccessDenied = ctx =>
        {
            ctx.Response.StatusCode = 403;
            return Task.CompletedTask;
        };
    });

builder.Services.AddAuthorization();

// ---- CORS for the Angular dev server (ng serve on :4200) ------------------
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();
builder.Services.AddCors(opt =>
{
    opt.AddPolicy("Angular", policy =>
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials()); // required so the auth cookie is sent cross-origin
});

builder.Services.AddControllers();

// Interactive API docs, dev-only — browse to /swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    // Root URL now redirects to Swagger instead of showing a bare 404 —
    // this is exactly what you hit at https://localhost:44361/ before.
    app.MapGet("/", () => Results.Redirect("/swagger"));
}

app.UseCors("Angular");

// Serve /uploads/<file> as static files (30-day cache), same intent as
// upload.php's generated .htaccess. Scripts can't land here since
// UploadController always re-encodes to .jpg regardless of input type,
// so there's no script-execution risk to block the way PHP had to.
var uploadsDir = Path.Combine(builder.Environment.ContentRootPath, "uploads");
Directory.CreateDirectory(uploadsDir);
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(uploadsDir),
    RequestPath = "/uploads",
    OnPrepareResponse = ctx =>
    {
        ctx.Context.Response.Headers.CacheControl = "public, max-age=2592000"; // 30 days
    }
});

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
