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
    // Parse the login payload directly from the request body
    var loginPayload LoginPayload
    if err := c.BodyParser(&loginPayload); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Invalid request body",
        })
    }

    // Find user by email
    var user models.User
    if err := database.DB.Where("email = ?", loginPayload.Email).First(&user).Error; err != nil {
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
            "error": "User with email not found",
        })
    }

    // Compare hashed password
    if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(loginPayload.Password)); err != nil {
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
            "error": "Invalid password",
        })
    }

    // Create JWT with MapClaims - same approach as in debug routes
    token := jwt.New(jwt.SigningMethodHS256)
    claims := token.Claims.(jwt.MapClaims)
    claims["user_id"] = float64(user.ID)  // Store as float64 for consistency
    claims["exp"] = time.Now().Add(24 * time.Hour).Unix()
    claims["iat"] = time.Now().Unix()

    secret := os.Getenv("JWT_SECRET")
    if secret == "" {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "JWT_SECRET not set",
        })
    }

    // Sign the token
    t, err := token.SignedString([]byte(secret))
    if err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Could not sign token",
        })
    }

    // Return user data + token
    return c.JSON(fiber.Map{
        "id":       user.ID,
        "email":    user.Email,
        "username": user.Username,
        "profile_picture_url": user.ProfilePictureURL,
        "role":     user.Role,
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
    // Parse the register payload directly from the request body
    var registerPayload RegisterPayload
    if err := c.BodyParser(&registerPayload); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Invalid request body",
        })
    }

    // Validate input
    if registerPayload.Email == "" || registerPayload.Username == "" || registerPayload.Password == "" {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Email, username, and password are required",
        })
    }

    // Check length of username
    if len(registerPayload.Username) < 3 || len(registerPayload.Username) > 24 {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Username must be between 3 and 24 characters",
        })
    }

    // Check length of password
    if len(registerPayload.Password) < 6 || len(registerPayload.Password) > 24 {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Password must be between 6 and 24 characters",
        })
    }

    // Check if email already in use
    var existing models.User
    if err := database.DB.Where("email = ?", registerPayload.Email).First(&existing).Error; err == nil {
        return c.Status(fiber.StatusConflict).JSON(fiber.Map{
            "error": "Email already in use",
        })
    }

    // Check if username already in use
    if err := database.DB.Where("username = ?", registerPayload.Username).First(&existing).Error; err == nil {
        return c.Status(fiber.StatusConflict).JSON(fiber.Map{
            "error": "Username already in use",
        })
    }

    // Hash password
    hashed, err := bcrypt.GenerateFromPassword([]byte(registerPayload.Password), bcrypt.DefaultCost)
    if err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Could not create user",
        })
    }

    // Create new user
    newUser := models.User{
        Email:    registerPayload.Email,
        Username: registerPayload.Username,
        Password: string(hashed),
    }
    if err := database.DB.Create(&newUser).Error; err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": err.Error(),
        })
    }

    // Return user info + token
    return c.JSON(fiber.Map{
        "message": "Registration successful",
    })
}

// CheckAuth refreshes auth state
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
        "profile_picture_url": user.ProfilePictureURL,
        "role":     user.Role,
    })
}