package config

import (
    "database/sql"
    "fmt"
    "log"
    "os"

    "github.com/joho/godotenv"
    _ "github.com/jackc/pgx/v5/stdlib" // PostgreSQL driver
)

// Database is the global database connection
var Database *sql.DB

// InitDatabase initializes the database connection
func InitDatabase() {
    // Load environment variables from .env file
    err := godotenv.Load()
    if err != nil {
        log.Fatal("Error loading .env file")
    }

    dbHost := os.Getenv("DB_HOST")
    dbPort := os.Getenv("DB_PORT")
    dbUser := os.Getenv("DB_USER")
    dbPassword := os.Getenv("DB_PASSWORD")
    dbName := os.Getenv("DB_NAME")

    connStr := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable", dbUser, dbPassword, dbHost, dbPort, dbName)

    // Open the connection
    Database, err = sql.Open("pgx", connStr)
    if err != nil {
        log.Fatal("Failed to connect to the database:", err)
    }

    // Verify the connection
    err = Database.Ping()
    if err != nil {
        log.Fatal("Failed to ping the database:", err)
    }

    log.Println("Successfully connected to the database!")
}
