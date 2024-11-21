package services

import (
	"context"
	"time"

	"github.com/arnoldadero/sautii/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type IssueService struct {
	issueCollection *mongo.Collection
}

func NewIssueService(db *mongo.Database) *IssueService {
	return &IssueService{
		issueCollection: db.Collection("issues"),
	}
}

func (s *IssueService) CreateIssue(ctx context.Context, issue *models.Issue) error {
	issue.CreatedAt = time.Now()
	issue.UpdatedAt = time.Now()
	
	_, err := s.issueCollection.InsertOne(ctx, issue)
	return err
}

func (s *IssueService) GetIssue(ctx context.Context, id primitive.ObjectID) (*models.Issue, error) {
	var issue models.Issue
	err := s.issueCollection.FindOne(ctx, bson.M{"_id": id}).Decode(&issue)
	if err != nil {
		return nil, err
	}
	return &issue, nil
}

func (s *IssueService) UpdateIssue(ctx context.Context, id primitive.ObjectID, updates bson.M) error {
	updates["updatedAt"] = time.Now()
	_, err := s.issueCollection.UpdateOne(ctx, bson.M{"_id": id}, bson.M{"$set": updates})
	return err
}

func (s *IssueService) VoteOnIssue(ctx context.Context, issueID primitive.ObjectID, userID primitive.ObjectID, voteType string) error {
	var update bson.M
	if voteType == "up" {
		update = bson.M{
			"$addToSet": bson.M{"votes.up": userID},
			"$pull":     bson.M{"votes.down": userID},
		}
	} else {
		update = bson.M{
			"$addToSet": bson.M{"votes.down": userID},
			"$pull":     bson.M{"votes.up": userID},
		}
	}
	
	_, err := s.issueCollection.UpdateOne(ctx, bson.M{"_id": issueID}, update)
	return err
}

func (s *IssueService) AddComment(ctx context.Context, issueID primitive.ObjectID, comment *models.Comment) error {
	comment.CreatedAt = time.Now()
	comment.UpdatedAt = time.Now()
	
	_, err := s.issueCollection.UpdateOne(ctx, 
		bson.M{"_id": issueID},
		bson.M{"$push": bson.M{"comments": comment}},
	)
	return err
}
