package services

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/arnoldadero/sautii/models"
	"github.com/dgrijalva/jwt-go"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	userCollection  *mongo.Collection
	tokenCollection *mongo.Collection
	jwtSecret      string
	refreshSecret  string
}

type TokenClaims struct {
	UserID string `json:"userId"`
	Role   string `json:"role"`
	jwt.StandardClaims
}

type RefreshToken struct {
	ID        primitive.ObjectID `bson:"_id,omitempty"`
	UserID    primitive.ObjectID `bson:"userId"`
	Token     string            `bson:"token"`
	ExpiresAt time.Time         `bson:"expiresAt"`
	CreatedAt time.Time         `bson:"createdAt"`
}

func NewAuthService(db *mongo.Database, jwtSecret, refreshSecret string) *AuthService {
	return &AuthService{
		userCollection:  db.Collection("users"),
		tokenCollection: db.Collection("refresh_tokens"),
		jwtSecret:      jwtSecret,
		refreshSecret:  refreshSecret,
	}
}

func (s *AuthService) Register(ctx context.Context, email, username, password string) (*models.User, error) {
	// Check if user already exists
	exists, err := s.userExists(ctx, email)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, errors.New("user with this email already exists")
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %v", err)
	}

	// Create user
	user := &models.User{
		ID:         primitive.NewObjectID(),
		Email:      email,
		Username:   username,
		Password:   string(hashedPassword),
		Role:       "user",
		IsVerified: false,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	// Insert user into database
	_, err = s.userCollection.InsertOne(ctx, user)
	if err != nil {
		return nil, fmt.Errorf("failed to create user: %v", err)
	}

	return user, nil
}

func (s *AuthService) Login(ctx context.Context, email, password string) (*models.AuthTokens, error) {
	// Find user
	var user models.User
	err := s.userCollection.FindOne(ctx, bson.M{"email": email}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, errors.New("invalid email or password")
		}
		return nil, err
	}

	// Verify password
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		return nil, errors.New("invalid email or password")
	}

	// Generate tokens
	accessToken, err := s.generateAccessToken(user.ID.Hex(), user.Role)
	if err != nil {
		return nil, err
	}

	refreshToken, err := s.generateRefreshToken(user.ID)
	if err != nil {
		return nil, err
	}

	return &models.AuthTokens{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}

func (s *AuthService) RefreshToken(ctx context.Context, refreshToken string) (*models.AuthTokens, error) {
	// Verify refresh token
	var storedToken RefreshToken
	err := s.tokenCollection.FindOne(ctx, bson.M{"token": refreshToken}).Decode(&storedToken)
	if err != nil {
		return nil, errors.New("invalid refresh token")
	}

	// Check if token is expired
	if time.Now().After(storedToken.ExpiresAt) {
		return nil, errors.New("refresh token expired")
	}

	// Find user
	var user models.User
	err = s.userCollection.FindOne(ctx, bson.M{"_id": storedToken.UserID}).Decode(&user)
	if err != nil {
		return nil, err
	}

	// Generate new tokens
	accessToken, err := s.generateAccessToken(user.ID.Hex(), user.Role)
	if err != nil {
		return nil, err
	}

	newRefreshToken, err := s.generateRefreshToken(user.ID)
	if err != nil {
		return nil, err
	}

	// Delete old refresh token
	_, err = s.tokenCollection.DeleteOne(ctx, bson.M{"_id": storedToken.ID})
	if err != nil {
		return nil, err
	}

	return &models.AuthTokens{
		AccessToken:  accessToken,
		RefreshToken: newRefreshToken,
	}, nil
}

func (s *AuthService) Logout(ctx context.Context, refreshToken string) error {
	_, err := s.tokenCollection.DeleteOne(ctx, bson.M{"token": refreshToken})
	return err
}

func (s *AuthService) VerifyAccessToken(tokenString string) (*TokenClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &TokenClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(s.jwtSecret), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*TokenClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}

func (s *AuthService) generateAccessToken(userID, role string) (string, error) {
	claims := TokenClaims{
		UserID: userID,
		Role:   role,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: time.Now().Add(15 * time.Minute).Unix(),
			IssuedAt:  time.Now().Unix(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.jwtSecret))
}

func (s *AuthService) generateRefreshToken(userID primitive.ObjectID) (string, error) {
	// Generate random token
	token := primitive.NewObjectID().Hex()

	// Store refresh token
	refreshToken := RefreshToken{
		ID:        primitive.NewObjectID(),
		UserID:    userID,
		Token:     token,
		ExpiresAt: time.Now().Add(7 * 24 * time.Hour), // 7 days
		CreatedAt: time.Now(),
	}

	_, err := s.tokenCollection.InsertOne(context.Background(), refreshToken)
	if err != nil {
		return "", err
	}

	return token, nil
}

func (s *AuthService) userExists(ctx context.Context, email string) (bool, error) {
	count, err := s.userCollection.CountDocuments(ctx, bson.M{"email": email})
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

func (s *AuthService) GetUserByID(ctx context.Context, id primitive.ObjectID) (*models.User, error) {
	var user models.User
	err := s.userCollection.FindOne(ctx, bson.M{"_id": id}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, errors.New("user not found")
		}
		return nil, err
	}
	return &user, nil
}

func (s *AuthService) UpdateUser(ctx context.Context, userID primitive.ObjectID, updates bson.M) error {
	updates["updatedAt"] = time.Now()
	_, err := s.userCollection.UpdateOne(ctx, bson.M{"_id": userID}, bson.M{"$set": updates})
	return err
}

func (s *AuthService) ChangePassword(ctx context.Context, userID primitive.ObjectID, currentPassword, newPassword string) error {
	// Get user
	user, err := s.GetUserByID(ctx, userID)
	if err != nil {
		return err
	}

	// Verify current password
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(currentPassword))
	if err != nil {
		return errors.New("current password is incorrect")
	}

	// Hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash password: %v", err)
	}

	// Update password
	return s.UpdateUser(ctx, userID, bson.M{"password": string(hashedPassword)})
}
