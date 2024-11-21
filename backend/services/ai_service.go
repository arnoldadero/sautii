package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
)

type AIService struct {
	apiKey string
}

type CategoryPrediction struct {
	Category    string  `json:"category"`
	Confidence  float64 `json:"confidence"`
	Explanation string  `json:"explanation"`
}

func NewAIService() *AIService {
	return &AIService{
		apiKey: os.Getenv("OPENAI_API_KEY"),
	}
}

func (s *AIService) PredictCategory(title, description string) (*CategoryPrediction, error) {
	// Prepare the prompt for GPT
	prompt := fmt.Sprintf(`Analyze the following community issue and categorize it into one of these categories:
Categories: INFRASTRUCTURE, SAFETY, ENVIRONMENT, COMMUNITY, HEALTHCARE, EDUCATION, SECURITY, GOVERNANCE, ECONOMY, SOCIAL

Title: %s
Description: %s

Provide the response in JSON format with the following fields:
- category: The most appropriate category from the list above
- confidence: A number between 0 and 1 indicating confidence in the categorization
- explanation: A brief explanation of why this category was chosen

Response should be valid JSON.`, title, description)

	// Prepare the request to OpenAI API
	requestBody := map[string]interface{}{
		"model": "gpt-3.5-turbo",
		"messages": []map[string]string{
			{
				"role":    "system",
				"content": "You are an AI assistant that helps categorize community issues. Respond only with valid JSON.",
			},
			{
				"role":    "user",
				"content": prompt,
			},
		},
		"temperature": 0.3,
	}

	requestJSON, err := json.Marshal(requestBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %v", err)
	}

	// Make request to OpenAI API
	req, err := http.NewRequest("POST", "https://api.openai.com/v1/chat/completions", bytes.NewBuffer(requestJSON))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", s.apiKey))

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %v", err)
	}
	defer resp.Body.Close()

	var response struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, fmt.Errorf("failed to decode response: %v", err)
	}

	if len(response.Choices) == 0 {
		return nil, fmt.Errorf("no response from AI service")
	}

	// Parse the AI response
	var prediction CategoryPrediction
	if err := json.Unmarshal([]byte(response.Choices[0].Message.Content), &prediction); err != nil {
		return nil, fmt.Errorf("failed to parse AI response: %v", err)
	}

	return &prediction, nil
}
