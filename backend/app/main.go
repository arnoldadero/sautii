package main

import (
	"log"
	"net/http"
	"sautii/config"
	"sautii/routes"

	"github.com/gorilla/mux"
)

func main() {
	// Initialize the database connection
	config.InitDatabase()

	// Create a new router
	router := mux.NewRouter()

	// Register application routes
	routes.RegisterRoutes(router)

	// Start the HTTP server
	log.Println("Server started on :8080")
	log.Fatal(http.ListenAndServe(":5432", router))
}
