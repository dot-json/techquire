package handlers

import (
	"log"
	"strings"
	"techquire-backend/internal/database"
	"techquire-backend/internal/models"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// CreatePost handles the creation of a new post
func CreatePost(c *fiber.Ctx) error {
    // Get user ID from the JWT token
	var userID uint
	if userIDFloat, ok := c.Locals("user_id").(float64); ok {
        userID = uint(userIDFloat)
	} else {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
            "error": "Unauthorized or invalid token",
        })
	}

    // Parse the request body
    var postRequest struct {
        Title   string `json:"title"`
        Content string `json:"content"`
        Tags   []string `json:"tags"`
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
        Tags:    postRequest.Tags,
        UserID:  userID,
    }

    // Create the post in the database
    if err := database.DB.Create(&post).Error; err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to create post",
        })
    }

    var user models.User
    if err := database.DB.First(&user, post.UserID).Error; err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to retrieve user associated with post",
        })
    }

    postData := fiber.Map{
        "id":             post.ID,
        "title":          post.Title,
        "content":        post.Content,
        "tags":           post.Tags,
        "created_at":     post.CreatedAt,
        "updated_at":     post.UpdatedAt,
        "comment_count":  len(post.Comments),
        "is_metoo":       false,
        "metoo_count":    0,
        "is_watchlisted": false,
        "user": fiber.Map{
            "id":       user.ID,
            "username": user.Username,
        },
    }

    return c.JSON(postData)
}

// DeletePost handles the deletion of a post
func DeletePost(c *fiber.Ctx) error {
    // Get user ID from the JWT token
    var userID uint
    if userIDFloat, ok := c.Locals("user_id").(float64); ok {
        userID = uint(userIDFloat)
    } else {
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
            "error": "Unauthorized or invalid token",
        })
    }

    var user models.User
    if err := database.DB.First(&user, userID).Error; err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to retrieve user data",
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

    // Check if the user is the author of the post
    // Admins and moderators can delete any post
    if post.UserID != userID && user.Role != "admin" && user.Role != "moderator" {
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
            "error": "You are not the author of this post",
        })
    }

    // Delete the post
    if err := database.DB.Delete(&post).Error; err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to delete post",
        })
    }

    return c.JSON(fiber.Map{
        "message": "Post deleted successfully",
    })
}

// GetPost handles retrieving a single post by its ID
func GetPost(c *fiber.Ctx) error {
    postID := c.Params("post_id")

    var post models.Post
    // Preload the Comments relationship with ordering
    if err := database.DB.Preload("Comments", func(db *gorm.DB) *gorm.DB {
        return db.Order("created_at DESC")
    }).First(&post, postID).Error; err != nil {
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
    var userID uint
    if userIDFloat, ok := c.Locals("user_id").(float64); ok && userIDFloat > 0 {
        userID = uint(userIDFloat)
        
        // Check if current user has a metoo
        var meTooEntry models.MeToo
        isMetoo = database.DB.Where("post_id = ? AND user_id = ?", post.ID, userID).First(&meTooEntry).Error == nil
        
        // Check if current user has watchlisted this post
        var watchCount int64
        database.DB.Table("user_watchlist").Where("user_id = ? AND post_id = ?", userID, post.ID).Count(&watchCount)
        isWatchlisted = watchCount > 0
    }

    // Format comments to needs
    formattedComments := make([]fiber.Map, 0, len(post.Comments))
    for _, comment := range post.Comments {
        var commentAuthor models.User
        if err := database.DB.First(&commentAuthor, comment.UserID).Error; err != nil {
            log.Printf("Error fetching author for comment %d: %v", comment.ID, err)
            continue
        }

        // Check if the current user has liked or disliked this comment
        var isLiked, isDisliked bool

        // Only check reactions if user is authenticated
        if userID > 0 {
            var reaction models.Reaction
            result := database.DB.Where("comment_id = ? AND user_id = ?", comment.ID, userID).First(&reaction)
            if result.Error == nil {
                // User has a reaction
                isLiked = reaction.Type == "like"
                isDisliked = reaction.Type == "dislike"
            }
        }
        
        // Format the comment with proper JSON structure
        formattedComment := fiber.Map{
            "id":         comment.ID,
            "content":    comment.Content,
            "post_id":    comment.PostID,
            "is_solution": comment.IsSolution,
            "created_at": comment.CreatedAt,
            "updated_at": comment.UpdatedAt,
            "like_count":      comment.Likes,
            "dislike_count":   comment.Dislikes,
            "is_liked":       isLiked,
            "is_disliked":    isDisliked,
            "user": fiber.Map{
                "id":                 commentAuthor.ID,
                "username":           commentAuthor.Username,
                "profile_picture_url": commentAuthor.ProfilePictureURL,
            },
        }
        
        formattedComments = append(formattedComments, formattedComment)
    }

    // Initialize the response without solution
    response := fiber.Map{
        "id":             post.ID,
        "title":          post.Title,
        "content":        post.Content,
        "solution":       nil,
        "tags":           post.Tags,
        "created_at":     post.CreatedAt,
        "updated_at":     post.UpdatedAt,
        "comment_count":  len(post.Comments),
        "comments":       formattedComments,
        "is_metoo":       isMetoo,
        "metoo_count":    metooCount,
        "is_watchlisted": isWatchlisted,
        "user": fiber.Map{
            "id":       user.ID,
            "username": user.Username,
            "profile_picture_url": user.ProfilePictureURL,
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

// GetPosts handles retrieving a list of posts for the main feed
// with support for filtering, sorting and pagination
func GetPosts(c *fiber.Ctx) error {
    // Parse pagination and sorting parameters
    page := c.QueryInt("page", 1)
    limit := c.QueryInt("limit", 10)
    sortBy := c.Query("sort_by", "created_at")
    sortDir := c.Query("sort_dir", "desc")
    
    // Parse filter parameters
    searchQuery := c.Query("search")
    tagsQuery := c.Query("tags")
    isMetoo := c.QueryBool("is_metoo", false)
    isWatchlisted := c.QueryBool("is_watchlisted", false)
    hasSolutionQuery := c.Query("has_solution")
    userIDParam := c.Query("user_id") // For backward compatibility
    
    // Validate pagination parameters
    if limit > 50 {
        limit = 50
    }
    if limit < 1 {
        limit = 10
    }
    if page < 1 {
        page = 1
    }
    
    // Calculate offset for pagination
    offset := (page - 1) * limit
    
    // Get current user ID from JWT token
    var userID uint
    if userIDFloat, ok := c.Locals("user_id").(float64); ok {
        userID = uint(userIDFloat)
    }
    
    // Initialize base query with distinct to avoid duplicates
    query := database.DB.Model(&models.Post{}).
        Select("DISTINCT posts.*").
        Preload("Comments")
    
    // Add filters
    
    // Filter by user_id (for backward compatibility)
    if userIDParam != "" {
        query = query.Where("posts.user_id = ?", userIDParam)
    }
    
    // Search in title and content
    if searchQuery != "" {
        query = query.Where("posts.title LIKE ? OR posts.content LIKE ?", 
            "%"+searchQuery+"%", "%"+searchQuery+"%")
    }
    
    // Filter by tags
    if tagsQuery != "" {
        tagsList := strings.Split(tagsQuery, ",")
        for _, tag := range tagsList {
            // Trim spaces from tags and ignore empty ones
            cleanTag := strings.TrimSpace(tag)
            if cleanTag != "" {
                // Use JSON_CONTAINS for proper JSON array handling if available in your DB
                // Otherwise use this LIKE approach
                query = query.Where("posts.tags LIKE ?", "%"+cleanTag+"%")
            }
        }
    }
    
    // Apply user-specific filters if authenticated
    if userID > 0 {
        // Filter by "metoo" status
        if isMetoo {
            query = query.Where("EXISTS (SELECT 1 FROM me_toos WHERE me_toos.post_id = posts.id AND me_toos.user_id = ?)", userID)
        }
        
        // Filter by watchlisted status
        if isWatchlisted {
            query = query.Where("EXISTS (SELECT 1 FROM user_watchlist WHERE user_watchlist.post_id = posts.id AND user_watchlist.user_id = ?)", userID)
        }
    } else if isMetoo || isWatchlisted {
        // Return empty result if user is not authenticated but tries to use these filters
        return c.JSON(fiber.Map{
            "posts": []fiber.Map{},
            "pagination": fiber.Map{
                "page": page,
                "limit": limit,
                "total_posts": 0,
                "total_pages": 0,
                "has_more": false,
            },
        })
    }
    
    // Filter by solution status
    if hasSolutionQuery != "" {
        hasSolution := hasSolutionQuery == "true"
        if hasSolution {
            query = query.Where("EXISTS (SELECT 1 FROM comments WHERE comments.post_id = posts.id AND comments.is_solution = true)")
        } else {
            query = query.Where("NOT EXISTS (SELECT 1 FROM comments WHERE comments.post_id = posts.id AND comments.is_solution = true)")
        }
    }
    
    // Count total matching posts for pagination
    var totalPosts int64
    if err := database.DB.Table("(?) as filtered_posts", query.Session(&gorm.Session{}).Limit(-1).Offset(-1)).Count(&totalPosts).Error; err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to count posts: " + err.Error(),
        })
    }
    
    // Apply sorting - ensure we always prefix with table name to avoid ambiguity
    if sortBy == "metoo_count" {
        // Special case for sorting by metoo count using a window function approach
        // This works because we include the sorting field in the selection
        query = database.DB.Table("posts").
            Select("posts.*, COALESCE((SELECT COUNT(*) FROM me_toos WHERE me_toos.post_id = posts.id), 0) as metoo_count").
            Preload("Comments")
        
        // Apply other filters that were applied to the original query
        if userIDParam != "" {
            query = query.Where("posts.user_id = ?", userIDParam)
        }
        
        if searchQuery != "" {
            query = query.Where("posts.title LIKE ? OR posts.content LIKE ?", 
                "%"+searchQuery+"%", "%"+searchQuery+"%")
        }
        
        if tagsQuery != "" {
            tagsList := strings.Split(tagsQuery, ",")
            for _, tag := range tagsList {
                cleanTag := strings.TrimSpace(tag)
                if cleanTag != "" {
                    query = query.Where("posts.tags LIKE ?", "%"+cleanTag+"%")
                }
            }
        }
        
        if userID > 0 {
            if isMetoo {
                query = query.Where("EXISTS (SELECT 1 FROM me_toos WHERE me_toos.post_id = posts.id AND me_toos.user_id = ?)", userID)
            }
            
            if isWatchlisted {
                query = query.Where("EXISTS (SELECT 1 FROM user_watchlist WHERE user_watchlist.post_id = posts.id AND user_watchlist.user_id = ?)", userID)
            }
        }
        
        if hasSolutionQuery != "" {
            hasSolution := hasSolutionQuery == "true"
            if hasSolution {
                query = query.Where("EXISTS (SELECT 1 FROM comments WHERE comments.post_id = posts.id AND comments.is_solution = true)")
            } else {
                query = query.Where("NOT EXISTS (SELECT 1 FROM comments WHERE comments.post_id = posts.id AND comments.is_solution = true)")
            }
        }
        
        // Now apply the sorting
        if sortDir == "asc" {
            query = query.Order("metoo_count ASC, posts.created_at DESC")
        } else {
            query = query.Order("metoo_count DESC, posts.created_at DESC")
        }
    } else {
        // Standard sorting for other fields
        if sortDir == "asc" {
            query = query.Order("posts." + sortBy + " ASC")
        } else {
            query = query.Order("posts." + sortBy + " DESC")
        }
        // Add secondary sort by ID for consistent pagination
        query = query.Order("posts.id DESC")
    }
    
    // Execute the paginated query
    var posts []models.Post
    if err := query.Limit(limit).Offset(offset).Find(&posts).Error; err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to retrieve posts",
        })
    }
    
    // Extract the data needed for response
    returnedPosts := make([]fiber.Map, 0, len(posts))
    
    // If we have posts, let's get related data efficiently
    if len(posts) > 0 {
        // Maps for efficient lookups
        userMap := make(map[uint]models.User)
        metooCountMap := make(map[uint]int64)
        userMetooMap := make(map[uint]bool)
        userWatchlistMap := make(map[uint]bool)
        solutionMap := make(map[uint]fiber.Map)
        
        // Collect user and post IDs for batch operations
        userIDs := make([]uint, 0, len(posts))
        postIDs := make([]uint, 0, len(posts))
        postToUserMap := make(map[uint]uint)
        
        for _, post := range posts {
            userIDs = append(userIDs, post.UserID)
            postIDs = append(postIDs, post.ID)
            postToUserMap[post.ID] = post.UserID
        }
        
        // Fetch all users in one query
        var users []models.User
        database.DB.Where("id IN ?", userIDs).Find(&users)
        for _, user := range users {
            userMap[user.ID] = user
        }
        
        // Get metoo counts for all posts in one query
        type MetooCountResult struct {
            PostID uint
            Count  int64
        }
        var metooResults []MetooCountResult
        database.DB.Model(&models.MeToo{}).
            Select("post_id, count(*) as count").
            Where("post_id IN ?", postIDs).
            Group("post_id").
            Scan(&metooResults)
            
        for _, result := range metooResults {
            metooCountMap[result.PostID] = result.Count
        }
        
        // If user is authenticated, get their metoos and watchlist items
        if userID > 0 {
            // Check user's metoos
            var userMetoos []models.MeToo
            database.DB.Where("user_id = ? AND post_id IN ?", userID, postIDs).Find(&userMetoos)
            for _, metoo := range userMetoos {
                userMetooMap[metoo.PostID] = true
            }
            
            // Check user's watchlist
            type WatchlistItem struct {
                PostID uint
            }
            var watchlistItems []WatchlistItem
            database.DB.Table("user_watchlist").
                Select("post_id").
                Where("user_id = ? AND post_id IN ?", userID, postIDs).
                Scan(&watchlistItems)
                
            for _, item := range watchlistItems {
                userWatchlistMap[item.PostID] = true
            }
        }
        
        // Get solutions for posts in one query
        type SolutionResult struct {
            PostID           uint
            SolutionID       uint
            Content          string
            CreatedAt        time.Time
            UserID           uint
            Username         string
            ProfilePictureURL string `gorm:"column:profile_picture_url"`
        }
        
        var solutions []SolutionResult
        database.DB.Model(&models.Comment{}).
            Select("comments.post_id, comments.id as solution_id, comments.content, comments.created_at, users.id as user_id, users.username, users.profile_picture_url").
            Joins("JOIN users ON users.id = comments.user_id").
            Where("comments.post_id IN ? AND comments.is_solution = ?", postIDs, true).
            Scan(&solutions)
            
        for _, sol := range solutions {
            solutionMap[sol.PostID] = fiber.Map{
                "id":         sol.SolutionID,
                "content":    sol.Content,
                "created_at": sol.CreatedAt,
                "user": fiber.Map{
                    "id":                 sol.UserID,
                    "username":           sol.Username,
                    "profile_picture_url": sol.ProfilePictureURL,
                },
            }
        }
        
        // Format each post with the collected data
        for _, post := range posts {
            user, found := userMap[post.UserID]
            if !found {
                // Skip posts where we couldn't find the user
                continue
            }
            
            // Build post data
            postData := fiber.Map{
                "id":             post.ID,
                "title":          post.Title,
                "content":        post.Content,
                "solution":       nil,
                "tags":           post.Tags,
                "created_at":     post.CreatedAt,
                "updated_at":     post.UpdatedAt,
                "comment_count":  len(post.Comments),
                "is_metoo":       userMetooMap[post.ID],
                "metoo_count":    metooCountMap[post.ID],
                "is_watchlisted": userWatchlistMap[post.ID],
                "user": fiber.Map{
                    "id":                 user.ID,
                    "username":           user.Username,
                    "profile_picture_url": user.ProfilePictureURL,
                },
            }
            
            // Add solution if it exists
            if solution, exists := solutionMap[post.ID]; exists {
                postData["solution"] = solution
            }
            
            returnedPosts = append(returnedPosts, postData)
        }
    }
    
    // Calculate pagination metadata
    totalPages := (int(totalPosts) + limit - 1) / limit
    hasMore := page < totalPages
    
    return c.JSON(fiber.Map{
        "posts": returnedPosts,
        "pagination": fiber.Map{
            "page":        page,
            "limit":       limit,
            "total_posts": totalPosts,
            "total_pages": totalPages,
            "has_more":    hasMore,
        },
    })
}

// GetUserPosts retrieves posts created by a specific user
func GetUserPosts(c *fiber.Ctx) error {
    // Get user ID from path parameter
    userIDParam := c.Params("user_id")
    if userIDParam == "" {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "User ID is required",
        })
    }
    
    // Parse pagination parameters
    page := c.QueryInt("page", 1)
    limit := c.QueryInt("limit", 10)
    
    // Validate pagination
    if limit > 50 {
        limit = 50
    }
    if page < 1 {
        page = 1
    }
    
    offset := (page - 1) * limit
    
    // Get current user ID from JWT for personalization
    var currentUserID uint
    if userIDFloat, ok := c.Locals("user_id").(float64); ok {
        currentUserID = uint(userIDFloat)
    }
    
    // Check if the requested user exists
    var profileUser models.User
    if err := database.DB.First(&profileUser, userIDParam).Error; err != nil {
        if err == gorm.ErrRecordNotFound {
            return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
                "error": "User not found",
            })
        }
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to retrieve user",
        })
    }
    
    // Count total posts for pagination
    var totalPosts int64
    database.DB.Model(&models.Post{}).Where("user_id = ?", userIDParam).Count(&totalPosts)
    
    // Fetch posts with comments
    var posts []models.Post
    if err := database.DB.Where("user_id = ?", userIDParam).
        Preload("Comments").
        Order("created_at DESC").
        Limit(limit).
        Offset(offset).
        Find(&posts).Error; err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to retrieve posts",
        })
    }
    
    // Process results
    returnedPosts := make([]fiber.Map, 0, len(posts))
    for _, post := range posts {
        // Get metoo count
        var metooCount int64
        database.DB.Model(&models.MeToo{}).Where("post_id = ?", post.ID).Count(&metooCount)
        
        // Check if current user has metoo'd or watchlisted this post
        var isMetoo, isWatchlisted bool
        if currentUserID > 0 {
            // Check metoo
            var meTooEntry models.MeToo
            isMetoo = database.DB.Where("post_id = ? AND user_id = ?", post.ID, currentUserID).
                First(&meTooEntry).Error == nil
            
            // Check watchlist
            var watchCount int64
            database.DB.Table("user_watchlist").Where("user_id = ? AND post_id = ?", currentUserID, post.ID).
                Count(&watchCount)
            isWatchlisted = watchCount > 0
        }
        
        // Build post data
        postData := fiber.Map{
            "id":             post.ID,
            "title":          post.Title,
            "content":        post.Content,
            "solution":       nil,
            "tags":           post.Tags,
            "created_at":     post.CreatedAt,
            "updated_at":     post.UpdatedAt,
            "comment_count":  len(post.Comments),
            "is_metoo":       isMetoo,
            "metoo_count":    metooCount,
            "is_watchlisted": isWatchlisted,
            "user": fiber.Map{
                "id":                 profileUser.ID,
                "username":           profileUser.Username,
                "profile_picture_url": profileUser.ProfilePictureURL,
            },
        }
        
        // Check if there's a solution
        var solution models.Comment
        if err := database.DB.Where("post_id = ? AND is_solution = ?", post.ID, true).
            First(&solution).Error; err == nil {
            // Solution exists, get the solver
            var solver models.User
            if err := database.DB.First(&solver, solution.UserID).Error; err == nil {
                postData["solution"] = fiber.Map{
                    "id":         solution.ID,
                    "content":    solution.Content,
                    "created_at": solution.CreatedAt,
                    "user": fiber.Map{
                        "id":                 solver.ID,
                        "username":           solver.Username,
                        "profile_picture_url": solver.ProfilePictureURL,
                    },
                }
            }
        }
        
        returnedPosts = append(returnedPosts, postData)
    }
    
    // Calculate pagination metadata
    totalPages := (int(totalPosts) + limit - 1) / limit
    hasMore := page < totalPages
    
    return c.JSON(fiber.Map{
        "posts": returnedPosts,
        "pagination": fiber.Map{
            "page":        page,
            "limit":       limit,
            "total_posts": totalPosts,
            "total_pages": totalPages,
            "has_more":    hasMore,
        },
    })
}

// ToggleMetoo handles adding or removing a "metoo" reaction to a post
func ToggleMetoo(c *fiber.Ctx) error {
    // Get user ID from the JWT token
	var userID uint
	if userIDFloat, ok := c.Locals("user_id").(float64); ok {
        userID = uint(userIDFloat)
	} else {
		userID = 0
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
            "id":      postID,
            "is_metoo":   false,
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
            "id":      postID,
            "is_metoo":   true,
        })
    } else {
        // Some other database error
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Database error",
        })
    }
}

// ToggleWatchlist handles adding or removing a post from the user's watchlist
func ToggleWatchlist(c *fiber.Ctx) error {
    // Get user ID from the JWT token
    var userID uint
    if userIDFloat, ok := c.Locals("user_id").(float64); ok {
        userID = uint(userIDFloat)
    } else {
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
            "error": "Authentication required",
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

    // Get the current user with their watchlist
    var user models.User
    if err := database.DB.Preload("Watchlist").First(&user, userID).Error; err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to fetch user data",
        })
    }

    // Check if post is already in watchlist
    isWatchlisted := false
    for _, watchedPost := range user.Watchlist {
        if watchedPost.ID == uint(postID) {
            isWatchlisted = true
            break
        }
    }

    if isWatchlisted {
        // Post is already in watchlist, so remove it
        if err := database.DB.Model(&user).Association("Watchlist").Delete(&post); err != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "error": "Failed to remove post from watchlist",
            })
        }
        return c.JSON(fiber.Map{
            "id":             postID,
            "is_watchlisted": false,
        })
    } else {
        // Post is not in watchlist, so add it
        if err := database.DB.Model(&user).Association("Watchlist").Append(&post); err != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "error": "Failed to add post to watchlist",
            })
        }
        return c.JSON(fiber.Map{
            "id":             postID,
            "is_watchlisted": true,
        })
    }
}

// CreateComment handles the creation of a new comment on a post
func CreateComment(c* fiber.Ctx) error {
    // Get user ID from the JWT token
    var userID uint
    if userIDFloat, ok := c.Locals("user_id").(float64); ok {
        userID = uint(userIDFloat)
    } else {
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

    // Parse the request body
    var commentRequest struct {
        Content string `json:"content"`
    }
    
    if err := c.BodyParser(&commentRequest); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Failed to parse request body",
        })
    }

    // Validate the comment data
    if commentRequest.Content == "" {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Content is required",
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

    // Create the comment with the user ID from the token
    comment := models.Comment{
        Content: commentRequest.Content,
        PostID:  uint(postID),
        UserID:  userID,
    }

    // Create the comment in the database
    if err := database.DB.Create(&comment).Error; err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to create comment",
        })
    }

    // Fetch user separately
    var user models.User
    if err := database.DB.First(&user, comment.UserID).Error; err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to retrieve user associated with comment",
        })
    }

    commentData := fiber.Map{
        "id":         comment.ID,
        "content":    comment.Content,
        "post_id":    comment.PostID,
        "user": fiber.Map{
            "id":       user.ID,
            "username": user.Username,
            "profile_picture_url": user.ProfilePictureURL,
        },
        "created_at": comment.CreatedAt,
        "like_count":      comment.Likes,
        "dislike_count":   comment.Dislikes,
    }

    return c.JSON(commentData)
}

// DeleteComment handles the deletion of a comment
func DeleteComment(c *fiber.Ctx) error {
    // Get user ID from the JWT token
    var userID uint
    if userIDFloat, ok := c.Locals("user_id").(float64); ok {
        userID = uint(userIDFloat)
    } else {
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
            "error": "Unauthorized or invalid token",
        })
    }

    var user models.User
    if err := database.DB.First(&user, userID).Error; err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to retrieve user data",
        })
    }

    // Get comment ID from URL parameter
    commentID, err := c.ParamsInt("comment_id")
    if err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Invalid comment ID",
        })
    }

    // Check if comment exists
    var comment models.Comment
    if err := database.DB.First(&comment, commentID).Error; err != nil {
        if err == gorm.ErrRecordNotFound {
            return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
                "error": "Comment not found",
            })
        }
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to fetch comment",
        })
    }

    // Check if the user is the author of the comment
    // Admins and moderators can delete any comment
    if comment.UserID != userID && user.Role != "admin" && user.Role != "moderator" {
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
            "error": "You are not the author of this comment",
        })
    }

    // Delete the comment
    if err := database.DB.Delete(&comment).Error; err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to delete comment",
        })
    }

    return c.JSON(fiber.Map{
        "message": "Comment deleted successfully",
    })
}

// React handles adding a like or dislike to a comment
func React(c *fiber.Ctx) error {
    // Get user ID from the JWT token
    var userID uint
    if userIDFloat, ok := c.Locals("user_id").(float64); ok {
        userID = uint(userIDFloat)
    } else {
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
            "error": "Unauthorized or invalid token",
        })
    }

    // Get comment ID from URL parameter
    commentID, err := c.ParamsInt("comment_id")
    if err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Invalid comment ID",
        })
    }

    // Parse the request body
    var reactionRequest struct {
        Reaction string `json:"reaction"`
    }
    
    if err := c.BodyParser(&reactionRequest); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Failed to parse request body",
        })
    }

    // Validate the reaction data
    if reactionRequest.Reaction != "like" && reactionRequest.Reaction != "dislike" {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Invalid reaction type",
        })
    }

    // Use a transaction to ensure data consistency
    tx := database.DB.Begin()
    defer func() {
        if r := recover(); r != nil {
            tx.Rollback()
        }
    }()

    // Check if comment exists
    var comment models.Comment
    if err := tx.First(&comment, commentID).Error; err != nil {
        tx.Rollback()
        if err == gorm.ErrRecordNotFound {
            return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
                "error": "Comment not found",
            })
        }
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to fetch comment",
        })
    }

    // Check if the user has already reacted to the comment
    var existingReaction models.Reaction
    result := tx.Where("comment_id = ? AND user_id = ?", commentID, userID).First(&existingReaction)

    // Variables to track the final state
    var isLiked, isDisliked bool
    
    if result.Error == nil {
        // Reaction exists, store the old type
        oldReactionType := existingReaction.Type
        
        // If the same reaction is clicked again, remove it (toggle off)
        if existingReaction.Type == reactionRequest.Reaction {
            if err := tx.Delete(&existingReaction).Error; err != nil {
                tx.Rollback()
                return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                    "error": "Failed to remove reaction",
                })
            }
            
            // Decrement the appropriate count
            if oldReactionType == "like" {
                if comment.Likes > 0 {
                    comment.Likes--
                }
            } else if oldReactionType == "dislike" {
                if comment.Dislikes > 0 {
                    comment.Dislikes--
                }
            }
            
            // User has no reaction after removal
            isLiked = false
            isDisliked = false
            
        } else {
            // User is changing their reaction type
            existingReaction.Type = reactionRequest.Reaction
            
            if err := tx.Save(&existingReaction).Error; err != nil {
                tx.Rollback()
                return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                    "error": "Failed to update reaction",
                })
            }
            
            // Update counts based on the change
            if oldReactionType == "like" && reactionRequest.Reaction == "dislike" {
                if comment.Likes > 0 {
                    comment.Likes--
                }
                comment.Dislikes++
                
                // Set new reaction state
                isLiked = false
                isDisliked = true
                
            } else if oldReactionType == "dislike" && reactionRequest.Reaction == "like" {
                if comment.Dislikes > 0 {
                    comment.Dislikes--
                }
                comment.Likes++
                
                // Set new reaction state
                isLiked = true
                isDisliked = false
            }
        }
    } else if result.Error == gorm.ErrRecordNotFound {
        // Reaction doesn't exist, so create it
        newReaction := models.Reaction{
            CommentID: uint(commentID),
            UserID:    userID,
            Type:      reactionRequest.Reaction,
        }
        
        if err := tx.Create(&newReaction).Error; err != nil {
            tx.Rollback()
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "error": "Failed to add reaction",
            })
        }
        
        // Increment the appropriate count
        if reactionRequest.Reaction == "like" {
            comment.Likes++
            isLiked = true
            isDisliked = false
        } else if reactionRequest.Reaction == "dislike" {
            comment.Dislikes++
            isLiked = false
            isDisliked = true
        }
    } else {
        // Some other database error
        tx.Rollback()
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Database error",
        })
    }
    
    // Save the updated comment with new counts
    if err := tx.Save(&comment).Error; err != nil {
        tx.Rollback()
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to update comment counts",
        })
    }
    
    // Commit the transaction
    if err := tx.Commit().Error; err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to commit transaction",
        })
    }
    
    // Return the updated comment data
    return c.JSON(fiber.Map{
        "id":               commentID,
        "like_count":       comment.Likes,
        "dislike_count":    comment.Dislikes,
        "is_liked":         isLiked,
        "is_disliked":      isDisliked,
    })
}

// ToggleMarkCommentAsSolution handles marking a comment as a solution or unmarking it
func ToggleMarkCommentAsSolution(c *fiber.Ctx) error {
    // Get user ID from the JWT token
    var userID uint
    if userIDFloat, ok := c.Locals("user_id").(float64); ok {
        userID = uint(userIDFloat)
    } else {
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
            "error": "Unauthorized or invalid token",
        })
    }

    // Get comment ID from URL parameter
    commentID, err := c.ParamsInt("comment_id")
    if err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Invalid comment ID",
        })
    }

    // Check if comment exists
    var comment models.Comment
    if err := database.DB.First(&comment, commentID).Error; err != nil {
        if err == gorm.ErrRecordNotFound {
            return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
                "error": "Comment not found",
            })
        }
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to fetch comment",
        })
    }

    // Get comment author
    var commentAuthor models.User
    if err := database.DB.First(&commentAuthor, comment.UserID).Error; err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to fetch comment author",
        })
    }


    // Check if the user is the author of the comment
    var user models.User
    if err := database.DB.First(&user, userID).Error; err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to fetch user",
        })
    }

    // Only the author of the post can mark a comment as a solution
    if comment.UserID != user.ID && user.Role != "admin" && user.Role != "moderator" {
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
            "error": "You are not authorized to mark this comment as a solution",
        })
    }

    // Check if the post has an existing solution
    var existingSolution models.Comment
    if err := database.DB.Where("post_id = ? AND is_solution = ?", comment.PostID, true).First(&existingSolution).Error; err == nil {
        // If the comment is already marked as a solution, unmark it
        if existingSolution.ID == comment.ID {
            existingSolution.IsSolution = false
            if err := database.DB.Save(&existingSolution).Error; err != nil {
                return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                    "error": "Failed to unmark comment as solution",
                })
            }
            return c.JSON(fiber.Map{
                "id":         comment.ID,
                "is_solution": false,
            })
        }
    }
    // Mark the comment as a solution
    comment.IsSolution = true
    if err := database.DB.Save(&comment).Error; err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to mark comment as solution",
        })
    }
    return c.JSON(fiber.Map{
        "id":         comment.ID,
        "is_solution": true,
        "solution": fiber.Map{
            "id":         comment.ID,
            "content":    comment.Content,
            "created_at": comment.CreatedAt,
            "user": fiber.Map{
                "id":                 commentAuthor.ID,
                "username":           commentAuthor.Username,
                "profile_picture_url": commentAuthor.ProfilePictureURL,
            },
        },
    });
}