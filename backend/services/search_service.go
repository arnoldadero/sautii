package services

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/arnoldadero/sautii/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type SearchService struct {
	issueCollection *mongo.Collection
}

type SearchFilters struct {
	Query      string     `json:"query,omitempty"`
	Categories []string   `json:"categories,omitempty"`
	Priorities []string   `json:"priorities,omitempty"`
	Statuses   []string   `json:"statuses,omitempty"`
	StartDate  *time.Time `json:"startDate,omitempty"`
	EndDate    *time.Time `json:"endDate,omitempty"`
	Tags       []string   `json:"tags,omitempty"`
	Location   *struct {
		Lat    float64 `json:"lat"`
		Lng    float64 `json:"lng"`
		Radius float64 `json:"radius"` // in kilometers
	} `json:"location,omitempty"`
	SortBy    string `json:"sortBy,omitempty"`
	SortOrder string `json:"sortOrder,omitempty"`
	Page      int64  `json:"page"`
	Limit     int64  `json:"limit"`
}

type SearchResult struct {
	Issues []models.Issue         `json:"issues"`
	Total  int64                 `json:"total"`
	Facets map[string]Facets     `json:"facets"`
}

type Facets struct {
	Categories map[string]int64 `json:"categories"`
	Priorities map[string]int64 `json:"priorities"`
	Statuses   map[string]int64 `json:"statuses"`
	Tags       map[string]int64 `json:"tags"`
}

func NewSearchService(db *mongo.Database) *SearchService {
	return &SearchService{
		issueCollection: db.Collection("issues"),
	}
}

func (s *SearchService) Search(ctx context.Context, filters SearchFilters) (*SearchResult, error) {
	pipeline := []bson.M{}

	// Match stage for filtering
	matchStage := bson.M{}
	
	// Full-text search
	if filters.Query != "" {
		matchStage["$text"] = bson.M{
			"$search": filters.Query,
			"$caseSensitive": false,
			"$diacriticSensitive": false,
		}
	}

	// Category filter
	if len(filters.Categories) > 0 {
		matchStage["category"] = bson.M{"$in": filters.Categories}
	}

	// Priority filter
	if len(filters.Priorities) > 0 {
		matchStage["priority"] = bson.M{"$in": filters.Priorities}
	}

	// Status filter
	if len(filters.Statuses) > 0 {
		matchStage["status"] = bson.M{"$in": filters.Statuses}
	}

	// Date range filter
	if filters.StartDate != nil || filters.EndDate != nil {
		dateFilter := bson.M{}
		if filters.StartDate != nil {
			dateFilter["$gte"] = filters.StartDate
		}
		if filters.EndDate != nil {
			dateFilter["$lte"] = filters.EndDate
		}
		matchStage["createdAt"] = dateFilter
	}

	// Tags filter
	if len(filters.Tags) > 0 {
		matchStage["tags"] = bson.M{"$all": filters.Tags}
	}

	// Location filter
	if filters.Location != nil {
		matchStage["location"] = bson.M{
			"$geoWithin": bson.M{
				"$centerSphere": []interface{}{
					[]float64{filters.Location.Lng, filters.Location.Lat},
					filters.Location.Radius / 6371, // Convert km to radians
				},
			},
		}
	}

	if len(matchStage) > 0 {
		pipeline = append(pipeline, bson.M{"$match": matchStage})
	}

	// Facet stage for aggregating counts
	facetStage := bson.M{
		"$facet": bson.M{
			"categories": []bson.M{
				{"$group": bson.M{"_id": "$category", "count": bson.M{"$sum": 1}}},
			},
			"priorities": []bson.M{
				{"$group": bson.M{"_id": "$priority", "count": bson.M{"$sum": 1}}},
			},
			"statuses": []bson.M{
				{"$group": bson.M{"_id": "$status", "count": bson.M{"$sum": 1}}},
			},
			"tags": []bson.M{
				{"$unwind": "$tags"},
				{"$group": bson.M{"_id": "$tags", "count": bson.M{"$sum": 1}}},
			},
			"total": []bson.M{
				{"$count": "count"},
			},
			"issues": []bson.M{
				{"$sort": s.getSortStage(filters.SortBy, filters.SortOrder)},
				{"$skip": (filters.Page - 1) * filters.Limit},
				{"$limit": filters.Limit},
			},
		},
	}

	pipeline = append(pipeline, facetStage)

	// Execute aggregation
	cursor, err := s.issueCollection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, fmt.Errorf("failed to execute search: %v", err)
	}
	defer cursor.Close(ctx)

	var results []bson.M
	if err := cursor.All(ctx, &results); err != nil {
		return nil, fmt.Errorf("failed to decode search results: %v", err)
	}

	if len(results) == 0 {
		return &SearchResult{
			Issues: []models.Issue{},
			Total:  0,
			Facets: make(map[string]Facets),
		}, nil
	}

	// Process results
	result := results[0]
	searchResult := &SearchResult{
		Issues: make([]models.Issue, 0),
		Facets: s.processFacets(result),
	}

	// Process total count
	if totalArr, ok := result["total"].([]interface{}); ok && len(totalArr) > 0 {
		if totalDoc, ok := totalArr[0].(bson.M); ok {
			searchResult.Total = totalDoc["count"].(int64)
		}
	}

	// Process issues
	if issues, ok := result["issues"].([]interface{}); ok {
		for _, issue := range issues {
			var issueModel models.Issue
			bsonBytes, _ := bson.Marshal(issue)
			bson.Unmarshal(bsonBytes, &issueModel)
			searchResult.Issues = append(searchResult.Issues, issueModel)
		}
	}

	return searchResult, nil
}

func (s *SearchService) getSortStage(sortBy, sortOrder string) bson.D {
	order := 1
	if strings.ToLower(sortOrder) == "desc" {
		order = -1
	}

	switch strings.ToLower(sortBy) {
	case "votes":
		return bson.D{{Key: "voteCount", Value: order}, {Key: "createdAt", Value: -1}}
	case "priority":
		return bson.D{{Key: "priority", Value: order}, {Key: "createdAt", Value: -1}}
	default: // date
		return bson.D{{Key: "createdAt", Value: order}}
	}
}

func (s *SearchService) processFacets(result bson.M) map[string]Facets {
	facets := make(map[string]Facets)
	
	// Helper function to process facet counts
	processFacetCounts := func(facetName string) map[string]int64 {
		counts := make(map[string]int64)
		if facetArr, ok := result[facetName].([]interface{}); ok {
			for _, item := range facetArr {
				if itemMap, ok := item.(bson.M); ok {
					id := itemMap["_id"].(string)
					count := itemMap["count"].(int64)
					counts[id] = count
				}
			}
		}
		return counts
	}

	// Process each facet type
	facets["categories"] = Facets{Categories: processFacetCounts("categories")}
	facets["priorities"] = Facets{Priorities: processFacetCounts("priorities")}
	facets["statuses"] = Facets{Statuses: processFacetCounts("statuses")}
	facets["tags"] = Facets{Tags: processFacetCounts("tags")}

	return facets
}
