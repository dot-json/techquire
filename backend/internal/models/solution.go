package models

import "time"

// Solution represents a solution provided for a post
type Solution struct {
    ID        uint      `gorm:"primaryKey"`
    Content   string    `gorm:"not null"`
    PostID    uint      `gorm:"not null;unique"` // Foreign key to Post, unique to ensure one solution per post
    UserID    uint      `gorm:"not null"` // Foreign key to User
    CreatedAt time.Time
    UpdatedAt time.Time
}