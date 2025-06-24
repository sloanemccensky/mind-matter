using Microsoft.Data.SqlClient;
using MindMatter.API.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

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

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection();

// POST to create new entries
app.MapPost("/journalentries", async (JournalEntry entry, IConfiguration config) =>
{

    // Get the connection string in order to conect to the database
    // and insert the new journal entry
    var connectionString = config.GetConnectionString("DefaultConnection");

    // Using the connection string, open a connection to the database
    // and execute the SQL command to insert the new journal entry
    using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();

    var entryDate = entry.Date ?? DateTime.Now;

    // Prepare the SQL command to insert the new journal entry
    // and return the new ID of the entry
    var command = new SqlCommand(@"
        INSERT INTO JournalEntries (UserId, Date, Content, Mood, Emotion) 
        VALUES (@UserId, @Date, @Content, @Mood, @Emotion);
        SELECT SCOPE_IDENTITY();
    ", connection);

    // Add parameters to the command to prevent SQL injection
    command.Parameters.AddWithValue("@UserId", (object?)entry.UserId ?? DBNull.Value);
    command.Parameters.AddWithValue("@Date", (object?)entry.Date ?? DateTime.Now);
    command.Parameters.AddWithValue("@Content", (object?)entry.Content ?? DBNull.Value);
    command.Parameters.AddWithValue("@Mood", (object?)entry.Mood ?? DBNull.Value);
    command.Parameters.AddWithValue("@Emotion", (object?)entry.Emotion ?? DBNull.Value);

    var result = await command.ExecuteScalarAsync();
    var newId = Convert.ToInt32(result);

    // Return the new ID as well
    return Results.Created($"/journalentries/{newId}", new { Id = newId, entry.UserId, entry.Content, entry.Mood, Date = entryDate });
});

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


// GET to retrieve all entries for a specific user
app.MapGet("/journalentries", async (string userId, IConfiguration config) =>
{

    var connectionString = config.GetConnectionString("DefaultConnection");

    using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();

    var command = new SqlCommand(
        "SELECT Id, UserId, Date, Content, Mood, Emotion FROM JournalEntries WHERE UserId = @UserId",
        connection);
    command.Parameters.AddWithValue("@UserId", userId);

    var results = new List<JournalEntry>();
    using var reader = await command.ExecuteReaderAsync();

    while (await reader.ReadAsync())
    {
        // Console.WriteLine($"Retrieved Entry: {reader.GetDateTime(2)}");

        results.Add(new JournalEntry
        {
            Id = reader.GetInt32(0),
            UserId = reader.GetString(1),
            Date = reader.GetDateTime(2),
            Content = reader.GetString(3),
            Mood = reader.IsDBNull(4) ? null : (int?)reader.GetInt32(4),
            Emotion = reader.IsDBNull(5) ? null : reader.GetString(5)
        });
    }

    return Results.Ok(results);

});

// GET to retrieve all gratitude entries for a specific user
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


// DELETE to remove an entry by ID
app.MapDelete("/journalentries/{id:int}", async (int id, IConfiguration config) =>
{

    var connectionString = config.GetConnectionString("DefaultConnection");

    using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();

    using var command = new SqlCommand("DELETE FROM JournalEntries WHERE Id = @Id", connection);
    command.Parameters.AddWithValue("@Id", id);

    var rowsAffected = await command.ExecuteNonQueryAsync();
    return rowsAffected > 0 ? Results.Ok() : Results.NotFound();

});

// PUT to update an existing entry by ID
app.MapPut("/journalentries/{id:int}", async (int id, JournalEntry updatedEntry, IConfiguration config) =>
{

    var connectionString = config.GetConnectionString("DefaultConnection");

    using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();

    var query = @"
        UPDATE JournalEntries
        SET Content = @Content, Mood = @Mood, Emotion = @Emotion
        WHERE Id = @Id
    ";

    using var command = new SqlCommand(query, connection);
    command.Parameters.AddWithValue("@Id", id);
    command.Parameters.AddWithValue("@Content", (object?)updatedEntry.Content ?? DBNull.Value);
    command.Parameters.AddWithValue("@Mood", (object?)updatedEntry.Mood ?? DBNull.Value);
    command.Parameters.AddWithValue("@Emotion", (object?)updatedEntry.Emotion ?? DBNull.Value);

    var rowsAffected = await command.ExecuteNonQueryAsync();
    return rowsAffected > 0 ? Results.Ok() : Results.NotFound();

});

// PUT to update an existing gratitude entry by ID
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