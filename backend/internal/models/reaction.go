package models

import "time"

// Reaction represents a reaction (like or dislike) on a comment
type Reaction struct {
    ID        uint      `gorm:"primaryKey"`
    UserID    uint      `gorm:"not null"` // Foreign key to User
    CommentID uint      `gorm:"not null"` // Foreign key to Comment
    Type      string    `gorm:"not null"` // "like" or "dislike"
    CreatedAt time.Time
}