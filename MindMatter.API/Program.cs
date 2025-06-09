using Microsoft.Data.SqlClient;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using MindMatter.API.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add CORS service
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173")  // your React dev server URL
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

app.MapPost("/journalentries", async (JournalEntry entry, IConfiguration config) =>
{
    var connectionString = config.GetConnectionString("DefaultConnection");

    using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();

    var command = new SqlCommand(@"
        INSERT INTO JournalEntries (UserId, Date, Content, Mood) 
        VALUES (@UserId, @Date, @Content, @Mood);
        SELECT SCOPE_IDENTITY();
    ", connection);

    command.Parameters.AddWithValue("@UserId", (object?)entry.UserId ?? DBNull.Value);
    command.Parameters.AddWithValue("@Date", DateTime.Now);
    command.Parameters.AddWithValue("@Content", (object?)entry.Content ?? DBNull.Value);
    command.Parameters.AddWithValue("@Mood", (object?)entry.Mood ?? DBNull.Value);

    var result = await command.ExecuteScalarAsync();
    var newId = Convert.ToInt32(result);

    // Return the new ID as well
    return Results.Created($"/journalentries/{newId}", new { Id = newId, entry.UserId, entry.Content, entry.Mood, Date = DateTime.Now });
});

app.MapGet("/journalentries", async (string userId, IConfiguration config) =>
{
    var connectionString = config.GetConnectionString("DefaultConnection");

    using (var connection = new SqlConnection(connectionString))
    {
        await connection.OpenAsync();

        var command = new SqlCommand(@"
            SELECT * FROM JournalEntries WHERE UserId = @UserId
        ", connection);

        command.Parameters.AddWithValue("@UserId", userId);

        var reader = await command.ExecuteReaderAsync();
        var results = new List<JournalEntry>();

        while (await reader.ReadAsync())
        {
            results.Add(new JournalEntry
            {
                Id = reader.GetInt32(0),
                UserId = reader.GetString(1),
                Date = reader.GetDateTime(2),
                Content = reader.GetString(3),
                Mood = reader.IsDBNull(4) ? null : (int?)reader.GetInt32(4)
            });
        }

        return Results.Ok(results);
    }
});

app.MapDelete("/journalentries/{id:int}", async (int id, IConfiguration config) =>
{
    var connectionString = config.GetConnectionString("DefaultConnection");

    using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();

    var command = new SqlCommand("DELETE FROM JournalEntries WHERE Id = @Id", connection);
    command.Parameters.AddWithValue("@Id", id);

    var rowsAffected = await command.ExecuteNonQueryAsync();
    return rowsAffected > 0 ? Results.Ok() : Results.NotFound();
});

app.MapPut("/journalentries/{id}", async (int id, JournalEntry updatedEntry, IConfiguration config) =>
{
    var connectionString = config.GetConnectionString("DefaultConnection");

    using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();

    var command = new SqlCommand(@"
        UPDATE JournalEntries
        SET Content = @Content, Mood = @Mood
        WHERE Id = @Id
    ", connection);

    command.Parameters.AddWithValue("@Id", id);
    command.Parameters.AddWithValue("@Content", (object?)updatedEntry.Content ?? DBNull.Value);
    command.Parameters.AddWithValue("@Mood", (object?)updatedEntry.Mood ?? DBNull.Value);

    var rowsAffected = await command.ExecuteNonQueryAsync();

    return rowsAffected > 0 ? Results.Ok() : Results.NotFound();
});


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
        return Results.Problem($"Dafuq DB failed daWhoDatIs: {ex.Message}");
    }
});




app.Run();

