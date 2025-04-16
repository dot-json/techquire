package models

import (
	"time"

	"github.com/lib/pq"
)

// Comment represents a comment on a post
type Comment struct {
    ID        uint      `gorm:"primaryKey"`
    Content   string    `gorm:"not null"`
    PostID    uint      `gorm:"not null"` // Foreign key to Post
    UserID    uint      `gorm:"not null"` // Foreign key to User
    Pictures   pq.StringArray `gorm:"type:text[]" json:"pictures"` // Array of picture URLs
    IsSolution bool     `gorm:"default:false"` // Indicates if the comment is a solution
    Likes     int       `gorm:"default:0"` // Number of likes
    Dislikes  int       `gorm:"default:0"` // Number of dislikes
    CreatedAt time.Time
    UpdatedAt time.Time
}