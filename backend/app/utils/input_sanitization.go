package utils

import (
    "regexp"
    "strings"
)

// SanitizeInput removes private details and spam from the input string
func SanitizeInput(input string) string {
    // Remove emails
    emailPattern := regexp.MustCompile(`[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}`)
    sanitized := emailPattern.ReplaceAllString(input, "[REDACTED]")

    // Remove phone numbers
    phonePattern := regexp.MustCompile(`\b\d{10,15}\b`)
    sanitized = phonePattern.ReplaceAllString(sanitized, "[REDACTED]")

    // Remove website URLs
    urlPattern := regexp.MustCompile(`https?://[^\s]+`)
    sanitized = urlPattern.ReplaceAllString(sanitized, "[REDACTED]")

    // Basic spam filtering (e.g., common spam phrases)
    spammyWords := []string{"free money", "win big", "click here"}
    for _, word := range spammyWords {
        sanitized = strings.ReplaceAll(sanitized, word, "[SPAM]")
    }

    return sanitized
}
