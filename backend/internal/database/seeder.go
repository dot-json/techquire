package database

import (
	"fmt"
	"log"
	"math/rand"
	"strings"

	"github.com/go-faker/faker/v4"
	"golang.org/x/crypto/bcrypt"

	"techquire-backend/internal/models"
)

// SeedUsers creates a default and a bunch of fake users for testing purposes.
func SeedUsers() {
    // Create a default user
    admin_hashed, err := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
    if err != nil {
        log.Printf("Error hashing password: %v", err)
        return
    }
    adminUser := models.User{
        Email:    "admin@email.com",
        Username: "admin",
        Password: string(admin_hashed),
        Role:    "admin",
    }
    if err := DB.Create(&adminUser).Error; err != nil {
        log.Printf("Error creating default user: %v", err)
    }

    // Create 10 random users
    for i := 0; i < 10; i++ {
        hashed, err := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
        if err != nil {
            log.Printf("Error hashing password: %v", err)
            return
        }

        uname := faker.FirstName()

        user := models.User{
            Email:    fmt.Sprintf("%s@email.com", strings.ToLower(uname)),
            Username: uname,
            Password: string(hashed),
        }
        if err := DB.Create(&user).Error; err != nil {
            log.Printf("Error creating user: %v", err)
            continue
        }
    }
}

// SeedPosts creates a bunch of fake posts for testing purposes.
func SeedPosts() {
    var users []models.User
    DB.Find(&users)

    if len(users) == 0 {
        log.Printf("No users found for creating posts")
        return
    }

    for _, user := range users {
        for j := 0; j < rand.Intn(5)+1; j++ {
            post := models.Post{
                Title:     faker.Sentence(),
                Content:   faker.Paragraph(),
                UserID:    user.ID,
                // We'll calculate the actual MeTooCount after creating metoos
            }
            if err := DB.Create(&post).Error; err != nil {
                log.Printf("Error creating post: %v", err)
                continue
            }

            // Create a slice of eligible users for metoo (excluding post author)
            var eligibleUsers []models.User
            for _, u := range users {
                if u.ID != post.UserID {
                    eligibleUsers = append(eligibleUsers, u)
                }
            }
            
            // Skip if no eligible users
            if len(eligibleUsers) == 0 {
                continue
            }
            
            // Shuffle the eligible users to randomize selection
            rand.Shuffle(len(eligibleUsers), func(i, j int) {
                eligibleUsers[i], eligibleUsers[j] = eligibleUsers[j], eligibleUsers[i]
            })
            
            // Determine how many metoos to create (random, but not exceeding eligible users)
            meTooCount := rand.Intn(len(eligibleUsers) + 1)
            
            // Select the first meTooCount users from shuffled slice (guaranteed to be unique)
            selectedUsers := eligibleUsers
            if meTooCount < len(eligibleUsers) {
                selectedUsers = eligibleUsers[:meTooCount]
            }
            
            // Create metoos for the selected users
            for _, meTooUser := range selectedUsers {
                meToo := models.MeToo{
                    UserID: meTooUser.ID,
                    PostID: post.ID,
                }
                if err := DB.Create(&meToo).Error; err != nil {
                    log.Printf("Error creating 'me too': %v", err)
                    continue
                }
            }
            
            // Update the post's MeTooCount field with the actual count
            post.MeTooCount = len(selectedUsers)
            if err := DB.Save(&post).Error; err != nil {
                log.Printf("Error updating post metoo count: %v", err)
            }

            // Update the post creation date to a random date within the last 30 days
            DB.Model(&post).Update("created_at", faker.Date())
        }
    }
}

// SeedComments creates a bunch of fake comments for testing purposes.
func SeedComments() {
    var posts []models.Post
    DB.Find(&posts)

    for _, post := range posts {
        hasSolution := rand.Intn(2) == 0 // Randomly decide if a post has a solution
        for k := 0; k < rand.Intn(10); k++ {
            comment := models.Comment{
                Content:  faker.Sentence(),
                PostID:   post.ID,
                UserID:   uint(rand.Intn(10)+1), // Randomly assign a user ID
                Likes:    0, // Initialize likes to 0
                Dislikes: 0, // Initialize dislikes to 0
                IsSolution: false,
            }
            // If the post should have a solution, mark this comment as the solution
            if hasSolution && comment.UserID != post.UserID {
                comment.IsSolution = true
                hasSolution = false // Ensure only one solution per post
            }
            if err := DB.Create(&comment).Error; err != nil {
                log.Printf("Error creating comment: %v", err)
                continue
            }

        }
    }
}

// SeedReactions creates a bunch of fake reactions for testing purposes.
func SeedReactions() {
    var comments []models.Comment
    DB.Find(&comments)

    var users []models.User
    DB.Find(&users)

    for _, comment := range comments {
        for l := 0; l < rand.Intn(10); l++ {
            user := users[rand.Intn(len(users))]

            // Check if the user has already reacted to the comment
            var reaction models.Reaction
            if err := DB.Where("user_id = ? AND comment_id = ?", user.ID, comment.ID).First(&reaction).Error; err == nil {
                continue // Skip if the user has already reacted
            }

            reaction = models.Reaction{
                UserID:    user.ID,
                CommentID: comment.ID,
                Type:      "like",
            }
            if rand.Intn(4) == 0 { // 25% chance of a dislike
                reaction.Type = "dislike"
            }
            if err := DB.Create(&reaction).Error; err != nil {
                log.Printf("Error creating reaction: %v", err)
                continue
            }

            // Update comment reactions count
            if reaction.Type == "like" {
                comment.Likes++
            } else {
                comment.Dislikes++
            }
            if err := DB.Save(&comment).Error; err != nil {
                log.Printf("Error updating comment reactions: %v", err)
                continue
            }
        }
    }
}

// SeedWatchlist creates a bunch of fake watchlist items for testing purposes.
func SeedWatchlist() {
    var users []models.User
    DB.Find(&users)

    var posts []models.Post
    DB.Find(&posts)

    for _, user := range users {
        // Create 0-4 random watchlist entries for each user
        for j := 0; j < rand.Intn(5); j++ {
            post := posts[rand.Intn(len(posts))]
            if post.UserID == user.ID {
                continue // Skip if the post is created by the user
            }
            
            // Create watchlist entry directly instead of using Association
            watchlistEntry := models.UserWatchlist{
                UserID:    user.ID,
                PostID:    post.ID,
            }
            
            // Check if entry already exists (avoid duplicates)
            var existingEntry models.UserWatchlist
            if err := DB.Where("user_id = ? AND post_id = ?", user.ID, post.ID).First(&existingEntry).Error; err == nil {
                // Entry already exists, skip
                continue
            }
            
            // Create the entry directly
            if err := DB.Create(&watchlistEntry).Error; err != nil {
                log.Printf("Error creating watchlist entry: %v", err)
                continue
            }
        }
    }
}

// SeedAll calls all the individual seed functions
func SeedAll() {
    SeedUsers()
    SeedPosts()
    SeedComments()
    SeedReactions()
    SeedWatchlist()

    // Update the number of posts, solutions, likes, and dislikes for each user
    var users []models.User
    DB.Find(&users)
    for _, user := range users {
        var postCount int64
        var solutionCount int64
        var likes int64
        var dislikes int64

        DB.Model(&models.Post{}).Where("user_id = ?", user.ID).Count(&postCount)
        DB.Model(&models.Comment{}).Where("user_id = ? AND is_solution = true", user.ID).Count(&solutionCount)
        DB.Model(&models.Comment{}).Where("user_id = ?", user.ID).Select("SUM(likes)").Scan(&likes)
        DB.Model(&models.Comment{}).Where("user_id = ?", user.ID).Select("SUM(dislikes)").Scan(&dislikes)

        user.NumberOfPosts = int(postCount)
        user.NumberOfSolutions = int(solutionCount)
        user.Reputation = int(likes - dislikes + solutionCount * 10)
        DB.Save(&user)
    }
}