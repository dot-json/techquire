package models

import "time"

// MeToo represents a "me too" expression on a post by a user
type MeToo struct {
    ID        uint      `gorm:"primaryKey"`
    UserID    uint      `gorm:"not null"` // Foreign key to User
    PostID    uint      `gorm:"not null"` // Foreign key to Post
    CreatedAt time.Time
}