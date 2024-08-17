package controllers

import (
    "encoding/json"
    "net/http"
    "sautii-process/backend/models"
    "sautii-process/backend/utils"
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

    // Save the issue to the database (mocked here for simplicity)
    // In a real application, you would interact with the database
    issue.ID = time.Now().UnixNano() // Mocking ID with timestamp

    // Respond with the created issue
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(issue)
}
