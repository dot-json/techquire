package models

import (
	"time"

	"github.com/lib/pq"
)

// Post represents a post created by a user
type Post struct {
    ID          uint            `gorm:"primaryKey"`
    Title       string          `gorm:"not null"`
    Content     string          `gorm:"not null"`
    Pictures    pq.StringArray  `gorm:"type:text[]"` // Array of picture URLs
    Tags        pq.StringArray  `gorm:"type:text[]"` // Array of tags
    UserID      uint            `gorm:"not null"` // Foreign key to User
    CreatedAt   time.Time
    UpdatedAt   time.Time
    Comments    []Comment       `gorm:"foreignKey:PostID"` // One-to-many relationship with Comment
    MeTooCount  int             `gorm:"default:0"` // Number of "me too" expressions
    MeToos      []MeToo         `gorm:"foreignKey:PostID"` // One-to-many relationship with MeToo
}