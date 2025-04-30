package middleware

import (
	"log"
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
)

// JWTProtected middleware that protects routes with JWT authentication
func JWTProtected() fiber.Handler {
    return func(c *fiber.Ctx) error {
        // Get Authorization header
        authHeader := c.Get("Authorization")
        
        // If no auth header, return unauthorized
        if authHeader == "" {
            return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
                "error": "Authentication required",
            })
        }
        
        // Check format: "Bearer <token>"
        if !strings.HasPrefix(authHeader, "Bearer ") {
            return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
                "error": "Invalid authentication format",
            })
        }
        
        token := authHeader[7:]
        
        // Get JWT secret
        secret := os.Getenv("JWT_SECRET")
        if secret == "" {
            log.Println("ERROR: JWT_SECRET is not set")
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "error": "Server misconfiguration",
            })
        }
        
        claims := jwt.MapClaims{}
        t, err := jwt.ParseWithClaims(token, claims, func(token *jwt.Token) (interface{}, error) {
            return []byte(secret), nil
        })
        
        if err != nil || !t.Valid {
            return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
                "error": "Invalid or expired token",
            })
        }
        
        userID := claims["user_id"]
        if userID == nil {
            return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
                "error": "Invalid token: missing user_id",
            })
        }
        
        // Store user_id in context
        c.Locals("user_id", userID)
        
        return c.Next()
    }
}

// OptionalAuth middleware that attempts to authenticate but doesn't require it
// Continues processing even if authentication fails
func OptionalAuth() fiber.Handler {
    return func(c *fiber.Ctx) error {
        // Get Authorization header
        authHeader := c.Get("Authorization")
        
        // No auth header, continue without auth
        if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
            return c.Next()
        }
        
        token := authHeader[7:]
        
        // Get JWT secret
        secret := os.Getenv("JWT_SECRET")
        if secret == "" {
            return c.Next() // Continue without auth if no secret
        }
        
        claims := jwt.MapClaims{}
        t, err := jwt.ParseWithClaims(token, claims, func(token *jwt.Token) (interface{}, error) {
            return []byte(secret), nil
        })
        
        // If there's an error, continue without auth
        if err != nil {
            log.Printf("Optional auth: %v", err)
            return c.Next()
        }
        
        // If token is valid, extract userID
        if t.Valid {
            if userID, exists := claims["user_id"]; exists && userID != nil {
                c.Locals("user_id", userID)
            }
        }
        
        return c.Next()
    }
}