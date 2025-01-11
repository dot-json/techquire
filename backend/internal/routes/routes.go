package routes

import (
	"github.com/gofiber/fiber/v2"

	"techquire-backend/internal/handlers"
)

func SetupRoutes(app *fiber.App) {
    // Public routes
    app.Post("/auth", handlers.Login)
    app.Post("/register", handlers.Register)

    // Example protected route
    // app.Get("/profile", middleware.JWTProtected(), handlers.Profile)
}
