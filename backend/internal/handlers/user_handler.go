package handlers

import (
	"techquire-backend/internal/database"
	"techquire-backend/internal/models"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// publicUserData represents the public user data
type publicUserData struct {
    ID                uint   `json:"id"`
    Username          string `json:"username"`
    ProfilePictureURL *string `json:"profile_picture_url"`
    Reputation        int    `json:"reputation"`
    NumberOfPosts     int    `json:"number_of_posts"`
    NumberOfSolutions int    `json:"number_of_solutions"`
}

// GetUser returns the public user data for a given username
func GetUser(c *fiber.Ctx) error {
    username := c.Params("username")

    var user models.User
    if err := database.DB.Where("username = ?", username).First(&user).Error; err != nil {
        if err == gorm.ErrRecordNotFound {
            return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
                "error": "User not found",
            })
        }
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to get user",
        })
    }

    publicUser := publicUserData{
        ID:                user.ID,
        Username:          user.Username,
        ProfilePictureURL: user.ProfilePictureURL,
        Reputation:        user.Reputation,
        NumberOfPosts:     user.NumberOfPosts,
        NumberOfSolutions: user.NumberOfSolutions,
    }

    return c.JSON(publicUser)
}
