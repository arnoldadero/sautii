package routes

import (
    "net/http"
    "sautii/backend/app/controllers"

    "github.com/gorilla/mux"
)

// RegisterRoutes registers all application routes
func RegisterRoutes(router *mux.Router) {
    // Issue creation route
    router.HandleFunc("/api/issues", controllers.CreateIssue).Methods("POST")

    // Additional routes can be added here...
}
