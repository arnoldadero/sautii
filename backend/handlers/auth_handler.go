package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/arnoldadero/sautii/models"
	"github.com/arnoldadero/sautii/services"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type RegisterRequest struct {
	Email    string `json:"email"`
	Username string `json:"username"`
	Password string `json:"password"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type RefreshRequest struct {
	RefreshToken string `json:"refreshToken"`
}

type ChangePasswordRequest struct {
	CurrentPassword string `json:"currentPassword"`
	NewPassword    string `json:"newPassword"`
}

func Register(authService *services.AuthService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req RegisterRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		// Validate input
		if req.Email == "" || req.Username == "" || req.Password == "" {
			http.Error(w, "Email, username, and password are required", http.StatusBadRequest)
			return
		}

		// Register user
		user, err := authService.Register(r.Context(), req.Email, req.Username, req.Password)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// Return user without password
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(models.UserProfile{
			ID:         user.ID,
			Email:      user.Email,
			Username:   user.Username,
			Role:       user.Role,
			IsVerified: user.IsVerified,
			CreatedAt:  user.CreatedAt,
		})
	}
}

func Login(authService *services.AuthService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req LoginRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		// Validate input
		if req.Email == "" || req.Password == "" {
			http.Error(w, "Email and password are required", http.StatusBadRequest)
			return
		}

		// Login user
		tokens, err := authService.Login(r.Context(), req.Email, req.Password)
		if err != nil {
			http.Error(w, err.Error(), http.StatusUnauthorized)
			return
		}

		// Return tokens
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(tokens)
	}
}

func RefreshToken(authService *services.AuthService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req RefreshRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		// Validate input
		if req.RefreshToken == "" {
			http.Error(w, "Refresh token is required", http.StatusBadRequest)
			return
		}

		// Refresh tokens
		tokens, err := authService.RefreshToken(r.Context(), req.RefreshToken)
		if err != nil {
			http.Error(w, err.Error(), http.StatusUnauthorized)
			return
		}

		// Return new tokens
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(tokens)
	}
}

func Logout(authService *services.AuthService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req RefreshRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		// Logout user
		if err := authService.Logout(r.Context(), req.RefreshToken); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
	}
}

func ChangePassword(authService *services.AuthService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req ChangePasswordRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		// Get user ID from context
		userIDStr := r.Context().Value("userId").(string)
		userID, err := primitive.ObjectIDFromHex(userIDStr)
		if err != nil {
			http.Error(w, "Invalid user ID", http.StatusBadRequest)
			return
		}

		// Change password
		err = authService.ChangePassword(r.Context(), userID, req.CurrentPassword, req.NewPassword)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		w.WriteHeader(http.StatusOK)
	}
}

func GetProfile(authService *services.AuthService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Get user ID from context
		userIDStr := r.Context().Value("userId").(string)
		userID, err := primitive.ObjectIDFromHex(userIDStr)
		if err != nil {
			http.Error(w, "Invalid user ID", http.StatusBadRequest)
			return
		}

		// Get user
		user, err := authService.GetUserByID(r.Context(), userID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}

		// Return user profile
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(models.UserProfile{
			ID:             user.ID,
			Email:          user.Email,
			Username:       user.Username,
			Role:           user.Role,
			IsVerified:     user.IsVerified,
			ProfilePicture: user.ProfilePicture,
			Location:       user.Location,
			CreatedAt:      user.CreatedAt,
		})
	}
}
