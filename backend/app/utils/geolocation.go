package utils

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// Location represents the user's geolocation data
type Location struct {
	City    string `json:"city"`
	Region  string `json:"region"`
	Country string `json:"country"`
}

// GetLocationByIP fetches the location based on the user's IP address
func GetLocationByIP(ip string) (Location, error) {
	var location Location
	url := fmt.Sprintf("https://ipinfo.io/%s/json", ip)

	// Make the request to the IP geolocation API
	resp, err := http.Get(url)
	if err != nil {
		return location, err
	}
	defer resp.Body.Close()

	// Decode the JSON response
	if err := json.NewDecoder(resp.Body).Decode(&location); err != nil {
		return location, err
	}

	return location, nil
}
