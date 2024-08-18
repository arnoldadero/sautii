package controllers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sautii/config"
	"sautii/models"
	"sautii/utils"
	"time"
)

// CreateIssue handles the creation of a new issue
func CreateIssue(w http.ResponseWriter, r *http.Request) {
	// Parse the incoming JSON request
	var issue models.Issue
	err := json.NewDecoder(r.Body).Decode(&issue)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Validate the issue content
	if issue.Title == "" || issue.Description == "" || issue.Category == "" {
		http.Error(w, "Missing required fields", http.StatusBadRequest)
		return
	}

	// Sanitize inputs (remove private details and spam)
	issue.Description = utils.SanitizeInput(issue.Description)
	issue.Title = utils.SanitizeInput(issue.Title)

	// Add timestamp
	issue.CreatedAt = time.Now()

	// Get the user's IP address from the request (for demonstration purposes)
	userIP := r.RemoteAddr

	// Get the location based on the IP address
	location, err := utils.GetLocationByIP(userIP)
	if err == nil {
		issue.Location = fmt.Sprintf("%s, %s, %s", location.City, location.Region, location.Country)
	} else {
		issue.Location = "Unknown Location"
	}

	// Insert the issue into the database
	query := `INSERT INTO issues (title, description, category, media_url, created_at, location, is_anonymous)
              VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`

	err = config.Database.QueryRow(query, issue.Title, issue.Description, issue.Category, issue.MediaURL, issue.CreatedAt, issue.Location, issue.IsAnonymous).Scan(&issue.ID)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	// Respond with the created issue
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(issue)
}
