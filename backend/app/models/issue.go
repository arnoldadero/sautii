package models

import (
	"time"
)

// Issue represents an issue submitted by a user
type Issue struct {
	ID          int64     `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Category    string    `json:"category"`
	MediaURL    string    `json:"media_url,omitempty"` // Can be image, video, or audio
	CreatedAt   time.Time `json:"created_at"`
	Location    string    `json:"location"`
	IsAnonymous bool      `json:"is_anonymous"`
}
