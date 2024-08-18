package main

import (
	"log"
	"net/http"
	"sautii/backend/app/routes"

	"github.com/gorilla/mux"
)

func main() {
	router := mux.NewRouter()

	// Register application routes
	routes.RegisterRoutes(router)

	// Start the HTTP server
	log.Println("Server started on :8080")
	log.Fatal(http.ListenAndServe(":8080", router))
}
