package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"

	"techquire-backend/internal/database"
	"techquire-backend/internal/models"
	"techquire-backend/internal/routes"
)

func main() {
    if err := godotenv.Load(); err != nil {
        log.Println("Warning: .env file not found, using environment variables")
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
        AllowOrigins: "http://localhost:5173",
        AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
        AllowHeaders: "Content-Type, Authorization",
    }))

    //  (Optional) More specific config
    //  app.Use(cors.New(cors.Config{
    //      AllowOrigins: "http://localhost:3000, https://myapp.com",
    //      AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
    //      AllowHeaders: "Content-Type, Authorization",
    //  }))

    // 5. Setup routes
    routes.SetupRoutes(app)

    // 6. Start server
    log.Fatal(app.Listen(":8080"))
}
