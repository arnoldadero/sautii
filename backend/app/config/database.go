package config

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/jackc/pgx/v5/stdlib" // PostgreSQL driver
)

// Database is the global database connection
var Database *sql.DB

// InitDatabase initializes the database connection
func InitDatabase() {
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")

	// Construct the database connection string
	connStr := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable", dbUser, dbPassword, dbHost, dbPort, dbName)

	// Open the connection
	var err error
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
