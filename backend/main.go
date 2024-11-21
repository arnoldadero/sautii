package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/arnoldadero/sautii/handlers"
	"github.com/arnoldadero/sautii/middleware"
	"github.com/arnoldadero/sautii/services"
	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type CreateIssueRequest struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Location    struct {
		Latitude  float64 `json:"latitude"`
		Longitude float64 `json:"longitude"`
		Address   string  `json:"address"`
	} `json:"location"`
	IsAnonymous bool     `json:"isAnonymous"`
	Tags        []string `json:"tags"`
}

type CreateIssueResponse struct {
	ID          string                   `json:"id"`
	Title       string                   `json:"title"`
	Description string                   `json:"description"`
	Category    string                   `json:"category"`
	Prediction  *services.CategoryPrediction `json:"prediction"`
}

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Fatal("Error loading .env file")
	}

	// Set up MongoDB connection
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	mongoURI := os.Getenv("MONGODB_URI")
	if mongoURI == "" {
		log.Fatal("MONGODB_URI environment variable is not set")
	}

	clientOptions := options.Client().ApplyURI(mongoURI)
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatal(err)
	}

	// Ping the database
	if err = client.Ping(ctx, nil); err != nil {
		log.Fatal(err)
	}

	fmt.Println("Connected to MongoDB!")

	db := client.Database("sautii")

	// Set up router
	r := mux.NewRouter()
	setupRoutes(r, db)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Server is running on port %s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}

func setupRoutes(r *mux.Router, db *mongo.Database) {
	// Initialize services
	authService := services.NewAuthService(db, os.Getenv("JWT_SECRET"), os.Getenv("REFRESH_SECRET"))
	issueService := services.NewIssueService(db)
	searchService := services.NewSearchService(db)
	aiService := services.NewAIService()

	// Middleware
	r.Use(middleware.Cors)
	r.Use(middleware.Auth(authService))

	// API routes
	api := r.PathPrefix("/api").Subrouter()

	// Auth routes
	auth := api.PathPrefix("/auth").Subrouter()
	auth.HandleFunc("/register", handlers.Register(authService)).Methods("POST")
	auth.HandleFunc("/login", handlers.Login(authService)).Methods("POST")
	auth.HandleFunc("/refresh", handlers.RefreshToken(authService)).Methods("POST")
	auth.HandleFunc("/logout", handlers.Logout(authService)).Methods("POST")
	auth.HandleFunc("/change-password", handlers.ChangePassword(authService)).Methods("POST")
	auth.HandleFunc("/profile", handlers.GetProfile(authService)).Methods("GET")

	// Issue routes
	api.HandleFunc("/issues", handlers.CreateIssue(issueService, aiService)).Methods("POST")
	api.HandleFunc("/issues", handlers.SearchIssues(searchService)).Methods("GET")
	api.HandleFunc("/issues/{id}", handlers.GetIssue(issueService)).Methods("GET")
	api.HandleFunc("/issues/{id}", handlers.UpdateIssue(issueService)).Methods("PUT")
	api.HandleFunc("/issues/{id}/vote", handlers.VoteOnIssue(issueService)).Methods("POST")
	api.HandleFunc("/issues/{id}/comments", handlers.AddComment(issueService)).Methods("POST")

	// Search routes
	api.HandleFunc("/search/issues", handlers.SearchIssues(searchService)).Methods("POST")
	api.HandleFunc("/search/facets", handlers.GetSearchFacets(searchService)).Methods("POST")

	// Static file serving
	r.PathPrefix("/").Handler(http.FileServer(http.Dir("./static")))
}
