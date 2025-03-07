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

    // Validate input
    if req.Data.Email == "" || req.Data.Username == "" || req.Data.Password == "" {
        return c.Status(fiber.StatusBadRequest).SendString("Empty field in request body")
    }

    // Check length of username
    if len(req.Data.Username) < 3 || len(req.Data.Username) > 24 {
        return c.Status(fiber.StatusBadRequest).SendString("Username must be between 3 and 24 characters")
    }

    // Check length of password
    if len(req.Data.Password) < 6 || len(req.Data.Password) > 24 {
        return c.Status(fiber.StatusBadRequest).SendString("Password must be between 6 and 24 characters")
    }

    // Check if email already in use
    var existing models.User
    if err := database.DB.Where("email = ?", req.Data.Email).First(&existing).Error; err == nil {
        return c.Status(fiber.StatusConflict).SendString("Email already in use")
    }

    // Check if username already in use
    if err := database.DB.Where("username = ?", req.Data.Username).First(&existing).Error; err == nil {
        return c.Status(fiber.StatusConflict).SendString("Username already in use")
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

// CheckAuth is a middleware to check for a valid JWT
func CheckAuth(c *fiber.Ctx) error {
    // Get token from header
    auth := c.Get("Authorization")
    if auth == "" {
        return c.Status(fiber.StatusUnauthorized).SendString("Missing Authorization header")
    }

    // Parse token
    token := auth[7:]
    claims := jwt.MapClaims{}
    t, err := jwt.ParseWithClaims(token, claims, func(token *jwt.Token) (interface{}, error) {
        return []byte(os.Getenv("JWT_SECRET")), nil
    })
    if err != nil || !t.Valid {
        return c.Status(fiber.StatusUnauthorized).SendString("Invalid token")
    }

    // Retrieve user ID from claims
    userID := claims["user_id"]

    // Fetch user from database
    var user models.User
    if err := database.DB.First(&user, userID).Error; err != nil {
        return c.Status(fiber.StatusUnauthorized).SendString("User not found")
    }

    // Return user data
    return c.JSON(fiber.Map{
        "id":       user.ID,
        "email":    user.Email,
        "username": user.Username,
    })
}