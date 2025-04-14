package routes

import (
	"github.com/gofiber/fiber/v2"

	"techquire-backend/internal/handlers"
	"techquire-backend/internal/middleware"
)

func SetupRoutes(app *fiber.App) {
    app.Post("/auth", handlers.Login)
    app.Post("/register", handlers.Register)
    app.Post("/check-auth", handlers.CheckAuth)

    app.Get("/users/:username", handlers.GetUser)
    app.Get("/users/:user_id/posts", middleware.OptionalAuth(), handlers.GetUserPosts)
    app.Put("/users/update-username", middleware.JWTProtected(), handlers.UpdateUsername)
    app.Put("/users/update-password", middleware.JWTProtected(), handlers.UpdatePassword)
    app.Put("/users/update-role", middleware.JWTProtected(), handlers.UpdateUserRole)
    app.Put("/users/update-profile-picture", middleware.JWTProtected(), handlers.UpdateProfilePicture)

    app.Post("/posts", middleware.JWTProtected(), handlers.CreatePost)
    app.Delete("/posts/:post_id", middleware.JWTProtected(), handlers.DeletePost)
    app.Put("/posts/:post_id", middleware.JWTProtected(), handlers.EditPost)
    app.Delete("/posts/:post_id/picture/:picture_url", middleware.JWTProtected(), handlers.DeletePostPicture)
    app.Get("/posts", middleware.OptionalAuth(), handlers.GetPosts)
    app.Get("/posts/:post_id", middleware.OptionalAuth(), handlers.GetPost)
    app.Post("/posts/:post_id/metoo", middleware.JWTProtected(), handlers.ToggleMetoo)
    app.Post("/posts/:post_id/watchlist", middleware.JWTProtected(), handlers.ToggleWatchlist)
    app.Post("/posts/:post_id/comment", middleware.JWTProtected(), handlers.CreateComment)
    app.Delete("/posts/comment/:comment_id", middleware.JWTProtected(), handlers.DeleteComment)
    app.Post("/posts/comment/:comment_id/react", middleware.JWTProtected(), handlers.React)
    app.Put("/posts/comment/:comment_id/solution", middleware.JWTProtected(), handlers.ToggleMarkCommentAsSolution)

    app.Static("/uploads", "./uploads")
}
