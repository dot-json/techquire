package models

import "time"

// Comment represents a comment on a post
type Comment struct {
    ID        uint      `gorm:"primaryKey"`
    Content   string    `gorm:"not null"`
    PostID    uint      `gorm:"not null"` // Foreign key to Post
    UserID    uint      `gorm:"not null"` // Foreign key to User
    CreatedAt time.Time
    UpdatedAt time.Time
    Likes     int       `gorm:"default:0"` // Number of likes
    Dislikes  int       `gorm:"default:0"` // Number of dislikes
}