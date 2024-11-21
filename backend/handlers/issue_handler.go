package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/arnoldadero/sautii/models"
	"github.com/arnoldadero/sautii/services"
	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func CreateIssue(issueService *services.IssueService, aiService *services.AIService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var issue models.Issue
		if err := json.NewDecoder(r.Body).Decode(&issue); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// Get user ID from context (set by auth middleware)
		userID, ok := r.Context().Value("userID").(primitive.ObjectID)
		if !ok {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		issue.CreatedBy = userID

		// Predict category using AI service if not provided
		if issue.Category == "" {
			prediction, err := aiService.PredictCategory(issue.Title, issue.Description)
			if err == nil && prediction != nil {
				issue.Category = prediction.Category
			}
		}

		if err := issueService.CreateIssue(r.Context(), &issue); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(issue)
	}
}

func GetIssue(issueService *services.IssueService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		id, err := primitive.ObjectIDFromHex(vars["id"])
		if err != nil {
			http.Error(w, "Invalid issue ID", http.StatusBadRequest)
			return
		}

		issue, err := issueService.GetIssue(r.Context(), id)
		if err != nil {
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}

		json.NewEncoder(w).Encode(issue)
	}
}

func UpdateIssue(issueService *services.IssueService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		id, err := primitive.ObjectIDFromHex(vars["id"])
		if err != nil {
			http.Error(w, "Invalid issue ID", http.StatusBadRequest)
			return
		}

		var updates map[string]interface{}
		if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		if err := issueService.UpdateIssue(r.Context(), id, updates); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
	}
}

func VoteOnIssue(issueService *services.IssueService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		issueID, err := primitive.ObjectIDFromHex(vars["id"])
		if err != nil {
			http.Error(w, "Invalid issue ID", http.StatusBadRequest)
			return
		}

		var vote struct {
			Type string `json:"type"` // "up" or "down"
		}
		if err := json.NewDecoder(r.Body).Decode(&vote); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		userID, ok := r.Context().Value("userID").(primitive.ObjectID)
		if !ok {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		if err := issueService.VoteOnIssue(r.Context(), issueID, userID, vote.Type); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
	}
}

func AddComment(issueService *services.IssueService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		issueID, err := primitive.ObjectIDFromHex(vars["id"])
		if err != nil {
			http.Error(w, "Invalid issue ID", http.StatusBadRequest)
			return
		}

		var comment models.Comment
		if err := json.NewDecoder(r.Body).Decode(&comment); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		userID, ok := r.Context().Value("userID").(primitive.ObjectID)
		if !ok {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		comment.CreatedBy = userID
		comment.ID = primitive.NewObjectID()

		if err := issueService.AddComment(r.Context(), issueID, &comment); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(comment)
	}
}
