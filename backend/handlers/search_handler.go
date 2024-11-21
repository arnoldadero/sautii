package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/arnoldadero/sautii/services"
)

func SearchIssues(searchService *services.SearchService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Parse query parameters
		query := r.URL.Query()
		
		// Parse pagination parameters
		page, _ := strconv.ParseInt(query.Get("page"), 10, 64)
		if page < 1 {
			page = 1
		}
		
		limit, _ := strconv.ParseInt(query.Get("limit"), 10, 64)
		if limit < 1 || limit > 100 {
			limit = 10
		}

		// Build search filters
		filters := services.SearchFilters{
			Query:      query.Get("query"),
			Categories: query["categories"],
			Priorities: query["priorities"],
			Statuses:   query["statuses"],
			Tags:       query["tags"],
			SortBy:     query.Get("sortBy"),
			SortOrder:  query.Get("sortOrder"),
			Page:       page,
			Limit:      limit,
		}

		// Parse location if provided
		if lat := query.Get("lat"); lat != "" {
			if lng := query.Get("lng"); lng != "" {
				if radius := query.Get("radius"); radius != "" {
					latFloat, _ := strconv.ParseFloat(lat, 64)
					lngFloat, _ := strconv.ParseFloat(lng, 64)
					radiusFloat, _ := strconv.ParseFloat(radius, 64)
					
					filters.Location = &struct {
						Lat    float64 `json:"lat"`
						Lng    float64 `json:"lng"`
						Radius float64 `json:"radius"`
					}{
						Lat:    latFloat,
						Lng:    lngFloat,
						Radius: radiusFloat,
					}
				}
			}
		}

		// Execute search
		result, err := searchService.Search(r.Context(), filters)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Return results
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(result)
	}
}

func GetSearchFacets(searchService *services.SearchService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var filters services.SearchFilters
		if err := json.NewDecoder(r.Body).Decode(&filters); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		// Set a small limit since we only need facets
		filters.Page = 1
		filters.Limit = 1

		// Execute search to get facets
		result, err := searchService.Search(r.Context(), filters)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Return only the facets
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(result.Facets)
	}
}
