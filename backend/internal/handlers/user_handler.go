package handlers

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"techquire-backend/internal/database"
	"techquire-backend/internal/models"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// publicUserData represents the public user data
type publicUserData struct {
    ID                uint   `json:"id"`
    Username          string `json:"username"`
    Role              string `json:"role"`
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
        Role:              user.Role,
        ProfilePictureURL: user.ProfilePictureURL,
        Reputation:        user.Reputation,
        NumberOfPosts:     user.NumberOfPosts,
        NumberOfSolutions: user.NumberOfSolutions,
    }

    return c.JSON(publicUser)
}

// UpdateUsername updates the username of the authenticated user
func UpdateUsername(c *fiber.Ctx) error {
    // Get user ID from the JWT token
    var userID uint
    if userIDFloat, ok := c.Locals("user_id").(float64); ok {
        userID = uint(userIDFloat)
    } else {
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
            "error": "Authentication required",
        })
    }

    var newUsername struct {
        Username string `json:"username"`
    }
    if err := c.BodyParser(&newUsername); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Invalid request body",
        })
    }

    if newUsername.Username == "" {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Username cannot be empty",
        })
    }

    // Check if the new username is already taken
    var existingUser models.User
    if err := database.DB.Where("username = ?", newUsername.Username).First(&existingUser).Error; err != nil {
        if err != gorm.ErrRecordNotFound {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "error": "Failed to update username",
            })
        }
    } else {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Username is already taken",
        })
    }

    // Update the username
    if err := database.DB.Model(&models.User{}).Where("id = ?", userID).Update("username", newUsername.Username).Error; err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to update username",
        })
    }

    return c.JSON(fiber.Map{
        "username": newUsername.Username,
    })
}

// UpdatePassword updates the password of the authenticated user
func UpdatePassword(c *fiber.Ctx) error {
    // Get user ID from the JWT token
    var userID uint
    if userIDFloat, ok := c.Locals("user_id").(float64); ok {
        userID = uint(userIDFloat)
    } else {
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
            "error": "Authentication required",
        })
    }

    // Get old and new password from the request body
    var passwords struct {
        OldPassword string `json:"password"`
        NewPassword string `json:"new_password"`
    }
    if err := c.BodyParser(&passwords); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Invalid request body",
        })
    }

    // Check if old password is empty
    if passwords.OldPassword == "" {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Password cannot be empty",
        })
    }

    // Get the user
    var user models.User
    if err := database.DB.Where("id = ?", userID).First(&user).Error; err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to get user",
        })
    }

    // Compare the old password
    if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(passwords.OldPassword)); err != nil {
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
            "error": "Invalid password",
        })
    }

    if passwords.NewPassword == "" {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Password cannot be empty",
        })
    }

    // Check length of password
    if len(passwords.NewPassword) < 6 || len(passwords.NewPassword) > 24 {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Password must be between 6 and 24 characters",
        })
    }

    // Hash the new password
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(passwords.NewPassword), bcrypt.DefaultCost)
    if err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to hash password",
        })
    }

    // Update the password
    if err := database.DB.Model(&models.User{}).Where("id = ?", userID).Update("password", hashedPassword).Error; err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to update password",
        })
    }

    return c.JSON(fiber.Map{
        "message": "Password updated successfully",
    })
}

// UpdateUserRole updates the role of a user
func UpdateUserRole(c *fiber.Ctx) error {
    // Get user ID from the JWT token
    var userID uint
    if userIDFloat, ok := c.Locals("user_id").(float64); ok {
        userID = uint(userIDFloat)
    } else {
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
            "error": "Authentication required",
        })
    }

    // Get the user
    var user models.User
    if err := database.DB.Where("id = ?", userID).First(&user).Error; err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to get user",
        })
    }

    // Check if the user is an admin
    if user.Role != "admin" {
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
            "error": "Unauthorized",
        })
    }

    // Get the user ID from the request body
    var userRole struct {
        UserID uint   `json:"user_id"`
        Role   string `json:"role"`
    }
    if err := c.BodyParser(&userRole); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Invalid request body",
        })
    }

    validRoles := []string{"user", "moderator", "admin"}
    validRole := false
    for _, role := range validRoles {
        if userRole.Role == role {
            validRole = true
            break
        }
    }
    if !validRole {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Invalid role",
        })
    }

    // Get the user to update
    var userToUpdate models.User
    if err := database.DB.Where("id = ?", userRole.UserID).First(&userToUpdate).Error; err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to get user",
        })
    }

    // Update the role
    if err := database.DB.Model(&models.User{}).Where("id = ?", userRole.UserID).Update("role", userRole.Role).Error; err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to update role",
        })
    }

    return c.JSON(fiber.Map{
        "message": "Role updated successfully",
    })
}

// UpdateProfilePicture handles uploading a new profile picture
func UpdateProfilePicture(c *fiber.Ctx) error {
    // Get user ID from token
    userIDFloat, ok := c.Locals("user_id").(float64)
    if !ok {
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
            "error": "Unauthorized",
        })
    }
    userID := uint(userIDFloat)

    // Get file from form
    file, err := c.FormFile("profile_picture")
    if err != nil {
        log.Printf("Form file error: %v", err)
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "No file provided",
        })
    }

    // Check file size (limit to 2MB)
    if file.Size > 2*1024*1024 {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "File too large (max 2MB)",
        })
    }

    // Check file type
    contentType := file.Header.Get("Content-Type")
    if contentType != "image/jpeg" && contentType != "image/png" && contentType != "image/webp" {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Invalid file type. Only JPEG, PNG, and WebP are allowed",
        })
    }

    // Use static directory path (pre-created in Docker)
    uploadsDir := "./static/uploads/profile_pictures"

    // Generate unique filename
    filename := fmt.Sprintf("%d_%s", userID, uuid.New().String())
    fileExt := filepath.Ext(file.Filename)
    if fileExt == "" {
        // Default to jpg if extension missing
        fileExt = ".jpg"
    }
    filename = filename + fileExt
    filePath := filepath.Join(uploadsDir, filename)

    // Save file
    if err := c.SaveFile(file, filePath); err != nil {
        log.Printf("Error saving file: %v", err)
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to save file: " + err.Error(),
        })
    }

    // Generate URL - updated to match the static file serving path
    profilePictureURL := fmt.Sprintf("/static/uploads/profile_pictures/%s", filename)

    // Update user in database
    var user models.User
    if err := database.DB.First(&user, userID).Error; err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "User not found",
        })
    }

    // Delete old profile picture if it exists
    if user.ProfilePictureURL != nil && *user.ProfilePictureURL != "" {
        oldFilePath := "." + *user.ProfilePictureURL
        
        // Check if file exists before trying to delete
        if _, err := os.Stat(oldFilePath); err == nil {
            if err := os.Remove(oldFilePath); err != nil {
                // Log but don't fail if old file can't be deleted
                log.Printf("Warning: Could not delete old profile picture: %v", err)
            } else {
                log.Printf("Successfully deleted old profile picture: %s", oldFilePath)
            }
        } else {
            log.Printf("Old profile picture not found at %s", oldFilePath)
        }
    }

    // Update user's profile picture URL
    user.ProfilePictureURL = &profilePictureURL
    if err := database.DB.Save(&user).Error; err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to update profile picture in database",
        })
    }

    log.Printf("Profile picture updated successfully for user %d: %s", userID, profilePictureURL)
    return c.JSON(fiber.Map{
        "profile_picture_url": profilePictureURL,
    })
}