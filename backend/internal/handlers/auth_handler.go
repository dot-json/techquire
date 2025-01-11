package handlers

import (
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
	"golang.org/x/crypto/bcrypt"

	"techquire-backend/internal/database"
	"techquire-backend/internal/models"
)

// LoginPayload matches the request body shape
type LoginPayload struct {
    Email    string `json:"email"`
    Password string `json:"password"`
}

func Login(c *fiber.Ctx) error {
    var req struct {
        Data LoginPayload `json:"data"`
    }
    if err := c.BodyParser(&req); err != nil {
        return c.Status(fiber.StatusBadRequest).SendString("Invalid request body")
    }

    // Find user by email
    var user models.User
    if err := database.DB.Where("email = ?", req.Data.Email).First(&user).Error; err != nil {
        return c.Status(fiber.StatusUnauthorized).SendString("Invalid email or password")
    }

    // Compare hashed password
    if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Data.Password)); err != nil {
        return c.Status(fiber.StatusUnauthorized).SendString("Invalid email or password")
    }

    // Create JWT
    token := jwt.New(jwt.SigningMethodHS256)
    claims := token.Claims.(jwt.MapClaims)
    claims["user_id"] = user.ID
    claims["exp"] = time.Now().Add(24 * time.Hour).Unix()

    secret := os.Getenv("JWT_SECRET")
    t, err := token.SignedString([]byte(secret))
    if err != nil {
        return c.Status(fiber.StatusInternalServerError).SendString("Could not sign token")
    }

    // Return user data + token
    return c.JSON(fiber.Map{
        "id":       user.ID,
        "email":    user.Email,
        "username": user.Username,
        "token":    t,
    })
}

// RegisterPayload for new users
type RegisterPayload struct {
    Email    string `json:"email"`
    Username string `json:"username"`
    Password string `json:"password"`
}

func Register(c *fiber.Ctx) error {
    var req struct {
        Data RegisterPayload `json:"data"`
    }
    if err := c.BodyParser(&req); err != nil {
        return c.Status(fiber.StatusBadRequest).SendString("Invalid request body")
    }

    // Check if email already in use
    var existing models.User
    if err := database.DB.Where("email = ?", req.Data.Email).First(&existing).Error; err == nil {
        return c.Status(fiber.StatusConflict).SendString("Email already in use")
    }

    // Hash password
    hashed, err := bcrypt.GenerateFromPassword([]byte(req.Data.Password), bcrypt.DefaultCost)
    if err != nil {
        return c.Status(fiber.StatusInternalServerError).SendString("Could not create user")
    }

    // Create new user
    newUser := models.User{
        Email:    req.Data.Email,
        Username: req.Data.Username,
        Password: string(hashed),
    }
    if err := database.DB.Create(&newUser).Error; err != nil {
        return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
    }

    // Optionally generate token right away
    token := jwt.New(jwt.SigningMethodHS256)
    claims := token.Claims.(jwt.MapClaims)
    claims["user_id"] = newUser.ID
    claims["exp"] = time.Now().Add(24 * time.Hour).Unix()

    t, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
    if err != nil {
        return c.Status(fiber.StatusInternalServerError).SendString("Could not sign token")
    }

    // Return user info + token
    return c.JSON(fiber.Map{
        "id":       newUser.ID,
        "email":    newUser.Email,
        "username": newUser.Username,
        "token":    t,
    })
}
