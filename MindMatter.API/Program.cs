using Microsoft.Data.SqlClient;
using MindMatter.API.Data;
using Microsoft.EntityFrameworkCore;
using MindMatter.API.Models;
using MindMatter.API.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Service configuration
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<MMDbContext>(options => options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddScoped<IJournalEntryRepo, JournalRepo>();
builder.Services.AddAutoMapper(typeof(Program));

// Adds CORS service, as the front and back ends are on different ports for now
builder.Services.AddCors(options =>
{

    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173")  // React dev server URL
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });

});

var app = builder.Build();

app.UseCors("AllowReactApp");

// HTTP request pipeline configuration
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthorization();

// This is where the controllers are mapped to the routes
app.MapControllers();

// POST for gratitude log submissions
// SWITCH THIS OVER TO IRWIN'S MODEL AFTER PR APPROVAL
app.MapPost("/gratitude", async (GratitudeEntry entry, IConfiguration config) =>
{

    var connectionString = config.GetConnectionString("DefaultConnection");

    using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();

    var command = new SqlCommand(@"
        INSERT INTO GratitudeEntries (UserId, Date, Notice, Feeling)
        VALUES (@UserId, @Date, @Notice, @Feeling);
        SELECT SCOPE_IDENTITY();", connection);

    command.Parameters.AddWithValue("@UserId", entry.UserId);
    command.Parameters.AddWithValue("@Date", entry.Date ?? DateTime.Now);
    command.Parameters.AddWithValue("@Notice", entry.Notice ?? (object)DBNull.Value);
    command.Parameters.AddWithValue("@Feeling", entry.Feeling ?? (object)DBNull.Value);

    var result = await command.ExecuteScalarAsync();

    return Results.Created($"/gratitude/{result}", new { Id = result });

});

// POST for self-evidence reporting
// SWITCH THIS OVER TO IRWIN'S MODEL AFTER PR APPROVAL
app.MapPost("/evidence", async (EvidenceEntry entry, IConfiguration config) =>
{

    var connectionString = config.GetConnectionString("DefaultConnection");

    using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();
    var command = new SqlCommand(@"
        INSERT INTO EvidenceEntries (UserId, Date, Type, Description, ImageUrl, IsFavorite)
        VALUES (@UserId, @Date, @Type, @Description, @ImageUrl, @IsFavorite);
        SELECT SCOPE_IDENTITY();", connection);

    command.Parameters.AddWithValue("@UserId", entry.UserId);
    command.Parameters.AddWithValue("@Date", entry.Date);
    command.Parameters.AddWithValue("@Type", entry.Type ?? (object)DBNull.Value);
    command.Parameters.AddWithValue("@Description", entry.Description ?? (object)DBNull.Value);
    command.Parameters.AddWithValue("@ImageUrl", entry.ImageUrl ?? (object)DBNull.Value);
    command.Parameters.AddWithValue("@IsFavorite", entry.IsFavorite);

    var result = await command.ExecuteScalarAsync();
    return Results.Created($"/evidence/{result}", new
    {
        Id = result,
        entry.UserId,
        entry.Date,
        entry.Type,
        entry.Description,
        entry.ImageUrl,
        entry.IsFavorite
    });

});

// GET to retrieve all gratitude entries for a specific user
// SWITCH THIS OVER TO IRWIN'S MODEL AFTER PR APPROVAL
app.MapGet("/gratitude", async (string userId, IConfiguration config) =>
{

    var connectionString = config.GetConnectionString("DefaultConnection");

    using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();

    var command = new SqlCommand("SELECT Id, UserId, Date, Notice, Feeling FROM GratitudeEntries WHERE UserId = @UserId", connection);
    command.Parameters.AddWithValue("@UserId", userId);

    var results = new List<GratitudeEntry>();
    using var reader = await command.ExecuteReaderAsync();
    while (await reader.ReadAsync())
    {
        results.Add(new GratitudeEntry
        {
            Id = reader.GetInt32(0),
            UserId = reader.GetString(1),
            Date = reader.GetDateTime(2),
            Notice = reader.IsDBNull(3) ? null : reader.GetString(3),
            Feeling = reader.IsDBNull(4) ? null : reader.GetString(4)
        });
    }

    return Results.Ok(results);

});

// GET to retrieve all self-evidence entries for a specific user
// SWITCH THIS OVER TO IRWIN'S MODEL AFTER PR APPROVAL
app.MapGet("/evidence", async (string userId, IConfiguration config) =>
{

    var connectionString = config.GetConnectionString("DefaultConnection");
    using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();

    var command = new SqlCommand(@"
        SELECT Id, UserId, Date, Type, Description, ImageUrl, IsFavorite
        FROM EvidenceEntries WHERE UserId = @UserId
        ORDER BY Date DESC", connection);

    command.Parameters.AddWithValue("@UserId", userId);

    var results = new List<EvidenceEntry>();
    using var reader = await command.ExecuteReaderAsync();
    while (await reader.ReadAsync())
    {
        results.Add(new EvidenceEntry
        {
            Id = reader.GetInt32(0),
            UserId = reader.GetString(1),
            Date = reader.GetDateTime(2),
            Type = reader.GetString(3),
            Description = reader.GetString(4),
            ImageUrl = reader.IsDBNull(5) ? null : reader.GetString(5),
            IsFavorite = reader.GetBoolean(6)
        });
    }

    return Results.Ok(results);

});

// DELETE to remove self-evidence entry by ID
// SWITCH THIS OVER TO IRWIN'S MODEL AFTER PR APPROVAL
app.MapDelete("/evidence/{id:int}", async (int id, IConfiguration config) =>
{

    var connectionString = config.GetConnectionString("DefaultConnection");

    using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();

    var command = new SqlCommand("DELETE FROM EvidenceEntries WHERE Id = @Id", connection);
    command.Parameters.AddWithValue("@Id", id);
    var rowsAffected = await command.ExecuteNonQueryAsync();

    return rowsAffected > 0 ? Results.Ok() : Results.NotFound();

});

// PUT to update an existing gratitude entry by ID
// SWITCH THIS OVER TO IRWIN'S MODEL AFTER PR APPROVAL
app.MapPut("/gratitude/{id:int}", async (int id, GratitudeEntry updatedEntry, IConfiguration config) =>
{

    var connectionString = config.GetConnectionString("DefaultConnection");
    using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();

    var query = @"
        UPDATE GratitudeEntries
        SET Notice = @Notice, Feeling = @Feeling
        WHERE Id = @Id
    ";

    using var command = new SqlCommand(query, connection);
    command.Parameters.AddWithValue("@Id", id);
    command.Parameters.AddWithValue("@Notice", (object?)updatedEntry.Notice ?? DBNull.Value);
    command.Parameters.AddWithValue("@Feeling", (object?)updatedEntry.Feeling ?? DBNull.Value);

    var rowsAffected = await command.ExecuteNonQueryAsync();

    return rowsAffected > 0 ? Results.Ok(new { message = "Successful :D!!" }) : Results.NotFound();

});

// PUT to update an existing self-evidence entry by ID
// SWITCH THIS OVER TO IRWIN'S MODEL AFTER PR APPROVAL
app.MapPut("/evidence/{id:int}", async (int id, EvidenceEntry updatedEntry, IConfiguration config) =>
{

    var connectionString = config.GetConnectionString("DefaultConnection");
    using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();

    var command = new SqlCommand(@"
        UPDATE EvidenceEntries
        SET Type = @Type,
            Description = @Description,
            ImageUrl = @ImageUrl,
            IsFavorite = @IsFavorite
        WHERE Id = @Id", connection);

    command.Parameters.AddWithValue("@Id", id);
    command.Parameters.AddWithValue("@Type", updatedEntry.Type ?? (object)DBNull.Value);
    command.Parameters.AddWithValue("@Description", updatedEntry.Description ?? (object)DBNull.Value);
    command.Parameters.AddWithValue("@ImageUrl", updatedEntry.ImageUrl ?? (object)DBNull.Value);
    command.Parameters.AddWithValue("@IsFavorite", updatedEntry.IsFavorite);

    var rowsAffected = await command.ExecuteNonQueryAsync();

    return rowsAffected > 0 ? Results.Ok() : Results.NotFound();

});

/* TESTING */

// GET to test database connection
app.MapGet("/api/testdb/connection", () =>
{
    try
    {
        var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
        using var connection = new SqlConnection(connectionString);
        connection.Open();

        return Results.Ok("DB CONNECTION WORKS LETS GOHHH!");
    }
    catch (SqlException ex)
    {
        return Results.Problem($"Dafuq DB failed: {ex.Message}");
    }
});

app.Run();