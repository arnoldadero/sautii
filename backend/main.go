package main

import (
	"log"
	"net/http"

	"github.com/gorilla/mux"
)


// This is the main function that starts the server
func main() {
	// Create a new router from the Gorilla mux package
	r := mux.NewRouter()

	// Handle the "/issue" route with the HTTP POST method and the CreateIssueHandler function
	// This means that when a POST request is made to "/issue", the CreateIssueHandler function will be called
	r.HandleFunc("/issue", CreateIssueHandler).Methods("POST")

	// Handle the "/" route with the HTTP GET method and the HomeHandler function
	// This means that when a GET request is made to "/", the HomeHandler function will be called
	r.HandleFunc("/", HomeHandler).Methods("GET")

	// Print a message to the console indicating that the server is running on port 8080
	log.Println("Server is running on port 8080")

	// Start the server and listen for incoming requests on port 8080
	// This function will block until an error occurs, so it is placed last in the main function
	log.Fatal(http.ListenAndServe(":8080", r))
}

// Handler for creating an issue
func CreateIssueHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Issue created successfully"))
}

// Home handler for GET requests
func HomeHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Welcome to the SAUTII API"))
}
