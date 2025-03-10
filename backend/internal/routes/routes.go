package routes

import (
	"github.com/gofiber/fiber/v2"

	"techquire-backend/internal/handlers"
	"techquire-backend/internal/middleware"
)

func SetupRoutes(app *fiber.App) {
    // Public routes
    app.Post("/auth", handlers.Login)
    app.Post("/register", handlers.Register)
    app.Post("/check-auth", handlers.CheckAuth)

    app.Get("/users/:username", handlers.GetUser)

    app.Post("/posts", handlers.CreatePost)
    app.Get("/posts", middleware.OptionalAuth(), handlers.GetPosts)
    app.Get("/posts/:post_id", middleware.OptionalAuth(), handlers.GetPost)
    app.Post("/posts/:post_id/metoo", middleware.JWTProtected(), handlers.ToggleMetoo)
}
