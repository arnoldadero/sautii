package controllers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"sautii/backend/app/config"
	"sautii/backend/app/models"
	"sautii/backend/app/utils"
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

	// Add additional details
	issue.CreatedAt = time.Now()
	issue.IsAnonymous = true // By default, issues are anonymous

	// Insert the issue into the database
	query := `INSERT INTO issues (title, description, category, media_url, created_at, location, is_anonymous)
              VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`

	err = config.Database.QueryRow(query, issue.Title, issue.Description, issue.Category, issue.MediaURL, issue.CreatedAt, issue.Location, issue.IsAnonymous).Scan(&issue.ID)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Failed to create issue", http.StatusInternalServerError)
		} else {
			http.Error(w, "Database error", http.StatusInternalServerError)
		}
		return
	}

	// Respond with the created issue
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(issue)
}
