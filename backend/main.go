package main

import (
	"log"
	"os"
	"path/filepath"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"

	"techquire-backend/internal/database"
	"techquire-backend/internal/models"
	"techquire-backend/internal/routes"
)

func main() {
    // Get current directory
    cwd, err := os.Getwd()
    if err != nil {
        log.Printf("Warning: Could not determine current directory: %v", err)
    } else {
        log.Printf("Current working directory: %s", cwd)
    }

    // Try to load .env from current directory first
    err = godotenv.Load()
    if err != nil {
        // If that fails, try explicit path in the backend folder
        backendEnvPath := filepath.Join(cwd, ".env")
        err = godotenv.Load(backendEnvPath)
        if err != nil {
            log.Printf("Warning: .env file not found at %s, using environment variables", backendEnvPath)
        } else {
            log.Printf("Loaded environment from %s", backendEnvPath)
        }
    } else {
        log.Println("Loaded environment from default location")
    }

    // Print JWT_SECRET length (without revealing the actual secret)
    secretLen := len(os.Getenv("JWT_SECRET"))
    if secretLen > 0 {
        log.Printf("JWT_SECRET is set (length: %d)", secretLen)
    } else {
        log.Printf("WARNING: JWT_SECRET is not set!")
    }

    // 1. Connect DB
    database.ConnectDB()

    // 2. Auto-migrate models
    database.DB.AutoMigrate(&models.User{})

    // 3. Initialize Fiber
    app := fiber.New()

    // 4. Enable CORS - simplest usage (allows all origins, methods, etc.)
    app.Use(cors.New(cors.Config{
        // Either * or list all front-end origins
        AllowOrigins: "*",
        AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
        AllowHeaders: "Content-Type, Authorization, ngrok-skip-browser-warning",
    }))

    //  (Optional) More specific config
    //  app.Use(cors.New(cors.Config{
    //      AllowOrigins: "http://localhost:3000, https://myapp.com",
    //      AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
    //      AllowHeaders: "Content-Type, Authorization",
    //  }))

    // Check for static directories
    staticDirs := []string{"./static/uploads/profile_pictures", "./static/uploads/attached_pictures"}
    for _, dir := range staticDirs {
        if _, err := os.Stat(dir); os.IsNotExist(err) {
            log.Printf("Warning: Static directory %s does not exist, creating it...", dir)
            err := os.MkdirAll(dir, os.ModePerm)
            if err != nil {
                log.Printf("Error creating directory %s: %v", dir, err)
            } else {
                log.Printf("Static directory %s created successfully", dir)
            }
        } else {
            log.Printf("Static directory %s exists", dir)
        }
    }

    // Set up static file serving
    app.Static("/static", "./static")

    // 5. Setup routes
    routes.SetupRoutes(app)

    // 6. Start server
    log.Fatal(app.Listen(":8080"))
}
