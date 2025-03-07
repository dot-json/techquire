package database

import (
	"log"
	"math/rand"

	"github.com/go-faker/faker/v4"
	"golang.org/x/crypto/bcrypt"

	"techquire-backend/internal/models"
)

// SeedUsers creates a bunch of fake users for testing purposes.
func SeedUsers() {
    for i := 0; i < 10; i++ {
        hashed, err := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
        if err != nil {
            log.Printf("Error hashing password: %v", err)
            return
        }

        user := models.User{
            Email:    faker.Email(),
            Username: faker.FirstName(),
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

    for _, user := range users {
        for j := 0; j < rand.Intn(5)+1; j++ {
            post := models.Post{
                Title:     faker.Sentence(),
                Content:   faker.Paragraph(),
                UserID:    user.ID,
                MeTooCount: rand.Intn(len(users)), // Ensure MeTooCount does not exceed the number of users
            }
            if err := DB.Create(&post).Error; err != nil {
                log.Printf("Error creating post: %v", err)
                continue
            }

            // Create "me too" expressions for the post
            for k := 0; k < post.MeTooCount; k++ {
                meTooUser := users[rand.Intn(len(users))]
                meToo := models.MeToo{
                    UserID: meTooUser.ID,
                    PostID: post.ID,
                }
                if err := DB.Create(&meToo).Error; err != nil {
                    log.Printf("Error creating 'me too': %v", err)
                    continue
                }
            }
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
                UserID:   post.UserID,
                Likes:    0, // Initialize likes to 0
                Dislikes: 0, // Initialize dislikes to 0
            }
            if err := DB.Create(&comment).Error; err != nil {
                log.Printf("Error creating comment: %v", err)
                continue
            }

            // If the post should have a solution, mark this comment as the solution
            if hasSolution && k == 0 {
                solution := models.Solution{
                    Content: comment.Content,
                    PostID:  post.ID,
                    UserID:  comment.UserID,
                }
                if err := DB.Create(&solution).Error; err != nil {
                    log.Printf("Error creating solution: %v", err)
                    continue
                }
                hasSolution = false // Ensure only one solution per post
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
                Type:      "positive",
            }
            if rand.Intn(4) == 0 { // 25% chance of a negative reaction
                reaction.Type = "negative"
            }
            if err := DB.Create(&reaction).Error; err != nil {
                log.Printf("Error creating reaction: %v", err)
                continue
            }

            // Update comment reactions count
            if reaction.Type == "positive" {
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
        for j := 0; j < rand.Intn(5); j++ {
            post := posts[rand.Intn(len(posts))]
            if post.UserID == user.ID {
                continue // Skip if the post is created by the user
            }
            if err := DB.Model(&user).Association("Watchlist").Append(&post); err != nil {
                log.Printf("Error adding post to watchlist: %v", err)
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
        DB.Model(&models.Solution{}).Where("user_id = ?", user.ID).Count(&solutionCount)
        DB.Model(&models.Comment{}).Where("user_id = ?", user.ID).Select("SUM(likes)").Scan(&likes)
        DB.Model(&models.Comment{}).Where("user_id = ?", user.ID).Select("SUM(dislikes)").Scan(&dislikes)

        user.NumberOfPosts = int(postCount)
        user.NumberOfSolutions = int(solutionCount)
        user.Reputation = int(likes - dislikes + solutionCount * 10)
        DB.Save(&user)
    }
}