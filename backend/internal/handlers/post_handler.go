package handlers

import (
	"log"
	"techquire-backend/internal/database"
	"techquire-backend/internal/models"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// CreatePost handles the creation of a new post
func CreatePost(c *fiber.Ctx) error {
    // Get user ID from the JWT token
    userID, ok := c.Locals("user_id").(uint)
    if !ok {
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
            "error": "Unauthorized or invalid token",
        })
    }

    // Parse the request body
    var postRequest struct {
        Title   string `json:"title"`
        Content string `json:"content"`
    }
    
    if err := c.BodyParser(&postRequest); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Failed to parse request body",
        })
    }

    // Validate the post data
    if postRequest.Title == "" || postRequest.Content == "" {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Title and content are required",
        })
    }

    // Create the post with the user ID from the token
    post := models.Post{
        Title:   postRequest.Title,
        Content: postRequest.Content,
        UserID:  userID,
    }

    // Create the post in the database
    if err := database.DB.Create(&post).Error; err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to create post",
        })
    }

    return c.Status(fiber.StatusCreated).JSON(post)
}

// GetPost handles retrieving a single post by its ID
func GetPost(c *fiber.Ctx) error {
    postID := c.Params("post_id")

    var post models.Post
    // Preload the Comments relationship to get an accurate count
    if err := database.DB.Preload("Comments").First(&post, postID).Error; err != nil {
        if err == gorm.ErrRecordNotFound {
            return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
                "error": "Post not found",
            })
        }
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to retrieve post",
        })
    }

    // Fetch user separately
    var user models.User
    if err := database.DB.First(&user, post.UserID).Error; err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to retrieve user associated with post",
        })
    }

    // Initialize flags for metoo and watchlist
    var isMetoo bool = false
    var isWatchlisted bool = false
    var metooCount int64 = 0
    
    // Count total metoos for this post
    database.DB.Model(&models.MeToo{}).Where("post_id = ?", post.ID).Count(&metooCount)
    
    // Check if current user is authenticated
    if userID, ok := c.Locals("user_id").(uint); ok && userID > 0 {
        // Check if current user has a metoo
        var meTooEntry models.MeToo
        isMetoo = database.DB.Where("post_id = ? AND user_id = ?", post.ID, userID).First(&meTooEntry).Error == nil
        
        // Check if current user has watchlisted this post
        var watchCount int64
        database.DB.Table("user_watchlist").Where("user_id = ? AND post_id = ?", userID, post.ID).Count(&watchCount)
        isWatchlisted = watchCount > 0
    }

    // Initialize the response without solution
    response := fiber.Map{
        "id":             post.ID,
        "title":          post.Title,
        "content":        post.Content,
        "created_at":     post.CreatedAt,
        "updated_at":     post.UpdatedAt,
        "comment_count":  len(post.Comments),
        "is_metoo":       isMetoo,
        "metoo_count":    metooCount,
        "is_watchlisted": isWatchlisted,
        "user": fiber.Map{
            "id":       user.ID,
            "username": user.Username,
        },
    }

    // Fetch solution if it exists
    var solution models.Comment
    if err := database.DB.Where("post_id = ? AND is_solution = ?", post.ID, true).First(&solution).Error; err == nil {
        // Only add solution data if a solution was found (no error)
        var solver models.User
        if err := database.DB.First(&solver, solution.UserID).Error; err == nil {
            // Add solution data to post
            response["solution"] = fiber.Map{
                "id":         solution.ID,
                "content":    solution.Content,
                "created_at": solution.CreatedAt,
                "user": fiber.Map{
                    "id":       solver.ID,
                    "username": solver.Username,
                },
            }
        }
    }

    return c.JSON(response)
}

// GetPosts handles retrieving a list of posts
// Can optionally filter by user_id query parameter
func GetPosts(c *fiber.Ctx) error {
    // Check if a user_id query parameter is provided
    userIDParam := c.Query("user_id")
    
    // Initialize the database query
    query := database.DB.Preload("Comments")
    
    // If userID is provided, filter by that user
    if userIDParam != "" {
        query = query.Where("user_id = ?", userIDParam)
    }
    
    // Execute the query
    var posts []models.Post
    if err := query.Find(&posts).Error; err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to retrieve posts",
        })
    }

	// Get user ID from the JWT token
	var userID uint
	if userIDFloat, ok := c.Locals("user_id").(float64); ok {
        userID = uint(userIDFloat)
	} else {
		userID = 0
	}

    // Create response objects
    var response []fiber.Map
    for _, post := range posts {
        var user models.User
        if err := database.DB.First(&user, post.UserID).Error; err != nil {
            log.Printf("Error fetching user for post %d: %v", post.ID, err)
            continue
        }

        // Initialize flags for metoo and watchlist
        var isMetoo bool = false
        var isWatchlisted bool = false
        var metooCount int64 = 0
        
        // Count total metoos for this post
        database.DB.Model(&models.MeToo{}).Where("post_id = ?", post.ID).Count(&metooCount)
        
        // Check if current user is authenticated
        if userID > 0 {
            // Check if current user has a metoo
            var meTooEntry models.MeToo
            isMetoo = database.DB.Where("post_id = ? AND user_id = ?", post.ID, userID).First(&meTooEntry).Error == nil
            
            // Check if current user has watchlisted this post
            var watchCount int64
            database.DB.Table("user_watchlist").Where("user_id = ? AND post_id = ?", userID, post.ID).Count(&watchCount)
            isWatchlisted = watchCount > 0
        }

        // Initialize the post data without solution
        postData := fiber.Map{
            "id":             post.ID,
            "title":          post.Title,
            "content":        post.Content,
            "created_at":     post.CreatedAt,
            "updated_at":     post.UpdatedAt,
            "comment_count":  len(post.Comments),
            "is_metoo":       isMetoo,
            "metoo_count":    metooCount,
            "is_watchlisted": isWatchlisted,
            "user": fiber.Map{
                "id":       user.ID,
                "username": user.Username,
            },
        }

        // Fetch solution if it exists
        var solution models.Comment
        if err := database.DB.Where("post_id = ? AND is_solution = ?", post.ID, true).First(&solution).Error; err == nil {
            // Only add solution data if a solution was found (no error)
            var solver models.User
            if err := database.DB.First(&solver, solution.UserID).Error; err == nil {
                // Add solution data to post
                postData["solution"] = fiber.Map{
                    "id":         solution.ID,
                    "content":    solution.Content,
                    "created_at": solution.CreatedAt,
                    "user": fiber.Map{
                        "id":       solver.ID,
                        "username": solver.Username,
                    },
                }
            }
        }

        response = append(response, postData)
    }

    return c.JSON(response)
}

// ToggleMetoo handles adding or removing a "metoo" reaction to a post
func ToggleMetoo(c *fiber.Ctx) error {
    // Get user ID from the JWT token (must be authenticated)
    userID, ok := c.Locals("user_id").(uint)
    if !ok {
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
            "error": "Unauthorized or invalid token",
        })
    }

    // Get post ID from URL parameter
    postID, err := c.ParamsInt("post_id")
    if err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Invalid post ID",
        })
    }

    // Check if post exists
    var post models.Post
    if err := database.DB.First(&post, postID).Error; err != nil {
        if err == gorm.ErrRecordNotFound {
            return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
                "error": "Post not found",
            })
        }
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to fetch post",
        })
    }

    // Check if metoo already exists
    var existingMeToo models.MeToo
    result := database.DB.Where("post_id = ? AND user_id = ?", postID, userID).First(&existingMeToo)

    if result.Error == nil {
        // MeToo exists, so remove it
        if err := database.DB.Delete(&existingMeToo).Error; err != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "error": "Failed to remove metoo",
            })
        }
        return c.JSON(fiber.Map{
            "success": true,
            "message": "Removed metoo",
            "metoo":   false,
        })
    } else if result.Error == gorm.ErrRecordNotFound {
        // MeToo doesn't exist, so create it
        newMeToo := models.MeToo{
            PostID: uint(postID),
            UserID: userID,
        }
        if err := database.DB.Create(&newMeToo).Error; err != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "error": "Failed to add metoo",
            })
        }
        return c.JSON(fiber.Map{
            "success": true,
            "message": "Added metoo",
            "metoo":   true,
        })
    } else {
        // Some other database error
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Database error",
        })
    }
}