package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Location struct {
	Lat     float64 `bson:"lat" json:"lat"`
	Lng     float64 `bson:"lng" json:"lng"`
	Address string  `bson:"address,omitempty" json:"address,omitempty"`
}

type User struct {
	ID             primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Email          string            `bson:"email" json:"email"`
	Username       string            `bson:"username" json:"username"`
	Password       string            `bson:"password" json:"-"`
	Role           string            `bson:"role" json:"role"`
	IsVerified     bool              `bson:"isVerified" json:"isVerified"`
	ProfilePicture string            `bson:"profilePicture,omitempty" json:"profilePicture,omitempty"`
	Location       *Location         `bson:"location,omitempty" json:"location,omitempty"`
	Stats          *UserStats        `bson:"stats,omitempty" json:"stats,omitempty"`
	CreatedAt      time.Time         `bson:"createdAt" json:"createdAt"`
	UpdatedAt      time.Time         `bson:"updatedAt" json:"updatedAt"`
}

type UserProfile struct {
	ID             primitive.ObjectID `json:"id"`
	Email          string            `json:"email"`
	Username       string            `json:"username"`
	Role           string            `json:"role"`
	IsVerified     bool              `json:"isVerified"`
	ProfilePicture string            `json:"profilePicture,omitempty"`
	Location       *Location         `json:"location,omitempty"`
	CreatedAt      time.Time         `json:"createdAt"`
	Stats          UserStats         `json:"stats"`
}

type UserStats struct {
	IssuesCreated    int `json:"issuesCreated"`
	IssuesResolved   int `json:"issuesResolved"`
	CommentsPosted   int `json:"commentsPosted"`
	UpvotesReceived  int `json:"upvotesReceived"`
	DownvotesReceived int `json:"downvotesReceived"`
}

type AuthTokens struct {
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refreshToken"`
}

type LoginCredentials struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}
