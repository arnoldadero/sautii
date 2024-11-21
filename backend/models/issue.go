package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Issue struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Title       string            `bson:"title" json:"title"`
	Description string            `bson:"description" json:"description"`
	Category    string            `bson:"category" json:"category"`
	Priority    string            `bson:"priority" json:"priority"`
	Status      string            `bson:"status" json:"status"`
	Location    *Location         `bson:"location,omitempty" json:"location,omitempty"`
	CreatedBy   primitive.ObjectID `bson:"createdBy" json:"createdBy"`
	AssignedTo  primitive.ObjectID `bson:"assignedTo,omitempty" json:"assignedTo,omitempty"`
	Tags        []string          `bson:"tags,omitempty" json:"tags,omitempty"`
	Votes       struct {
		Up   []primitive.ObjectID `bson:"up,omitempty" json:"up,omitempty"`
		Down []primitive.ObjectID `bson:"down,omitempty" json:"down,omitempty"`
	} `bson:"votes" json:"votes"`
	Comments  []Comment  `bson:"comments,omitempty" json:"comments,omitempty"`
	CreatedAt time.Time `bson:"createdAt" json:"createdAt"`
	UpdatedAt time.Time `bson:"updatedAt" json:"updatedAt"`
}

type Comment struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Content   string            `bson:"content" json:"content"`
	CreatedBy primitive.ObjectID `bson:"createdBy" json:"createdBy"`
	CreatedAt time.Time         `bson:"createdAt" json:"createdAt"`
	UpdatedAt time.Time         `bson:"updatedAt" json:"updatedAt"`
}
