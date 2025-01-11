package handlers

import (
	"techquire-backend/internal/database"
	"techquire-backend/internal/models"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// Profile returns the currently authenticated user's information.
func Profile(c *fiber.Ctx) error {
    // This assumes you're using JWT middleware that sets "user_id" in c.Locals.
    // If "user_id" is missing or invalid, return 401.
    userID, ok := c.Locals("user_id").(float64)
    if !ok {
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
            "error": "Invalid or missing user_id in token",
        })
    }

    // Look up the user in the database
    var user models.User
    if err := database.DB.First(&user, uint(userID)).Error; err != nil {
        if err == gorm.ErrRecordNotFound {
            return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
                "error": "User not found",
            })
        }
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to retrieve user",
        })
    }

    // Return user data (omit sensitive fields like the password)
    return c.JSON(fiber.Map{
        "id":       user.ID,
        "email":    user.Email,
        "username": user.Username,
        // Don't return user.Password (it's hashed and not needed by the client)
    })
}

// UpdateProfile lets the authenticated user update certain fields (e.g. username).
func UpdateProfile(c *fiber.Ctx) error {
    userID, ok := c.Locals("user_id").(float64)
    if !ok {
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
            "error": "Invalid or missing user_id in token",
        })
    }

    // Parse incoming request for updated fields
    var payload struct {
        Username *string `json:"username"`
        // Add more fields as needed (e.g., bio, profilePicture, etc.)
    }
    if err := c.BodyParser(&payload); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Invalid request body",
        })
    }

    // Retrieve the user from DB
    var user models.User
    if err := database.DB.First(&user, uint(userID)).Error; err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to retrieve user",
        })
    }

    // Update fields if present in request
    if payload.Username != nil && *payload.Username != "" {
        user.Username = *payload.Username
    }

    // Save updated user
    if err := database.DB.Save(&user).Error; err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to update user",
        })
    }

    // Return updated info
    return c.JSON(fiber.Map{
        "id":       user.ID,
        "email":    user.Email,
        "username": user.Username,
    })
}
